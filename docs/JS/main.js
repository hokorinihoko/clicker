let energy=0;
let clickBase=1;
let clickMultiplier=1;
let clickExponent=1;
let autoBase=1;
let autoMultiplier=1;
let autoExponent=1;
let autoInterval=10000;
let pushMultiplier=1;

const core=document.getElementById("core");
const energyDisplay=document.getElementById("energy");
const productionDisplay=document.getElementById("Production");
const exponentSoftCap=200;
const exponentGain=0.005;
const exponentGainAfterCap=0.001;
const upgrades=[
    {cost:10,count:0,apply:()=>clickBase++},
    {cost:100,count:0,apply:()=>clickMultiplier++},
    {cost:1000,count:0,apply:()=>clickExponent+=(upgrades[2].count<exponentSoftCap?exponentGain:exponentGainAfterCap)},
    {cost:100,count:0,apply:()=>autoBase++},
    {cost:1000,count:0,apply:()=>autoInterval=Math.max(100,autoInterval-Math.floor(autoInterval/(upgrades[4].count*10))),limit:10},
    {cost:1000,count:0,apply:()=>autoMultiplier++},
    {cost:1000,count:0,apply:()=>autoExponent+=(upgrades[6].count<exponentSoftCap?exponentGain:exponentGainAfterCap)}
];
const autoBuyEnabled=upgrades.map(()=>true);
let autoBuyPriority=upgrades.map((_,index)=>index);
let purchaseAmount=1;
const upgradeTabs=Array.from(document.querySelectorAll(".upgrade-tab"));
const priorityControls=[];

function activateUpgradeTab(tab){
    upgradeTabs.forEach(item=>{
        const selected=item===tab;
        item.setAttribute("aria-selected",String(selected));
        item.tabIndex=selected?0:-1;
        document.getElementById(item.getAttribute("aria-controls")).hidden=!selected;
    });
}

function formatNumber(value){
    if(!Number.isFinite(value)){
        return value.toExponential(2);
    }
    if(Math.abs(value)>1e9){
        return value.toExponential(2);
    }
    return Number(value.toPrecision(3)).toLocaleString("ja-JP");
}

function clickPower(){
    const rawPower=(clickBase*clickMultiplier)**clickExponent;
    const exponent=window.Prestige?window.Prestige.getGlobalExponent():1;
    const multiplier=window.Prestige?window.Prestige.getGlobalMultiplier():1;
    const challenge=window.Prestige?window.Prestige.getChallengeModifiers():{valueExponent:1};
    const normalPower=rawPower**exponent*multiplier*pushMultiplier;
    return Math.floor(normalPower**challenge.valueExponent*100)/100;
}

function autoPower(){
    const challenge=window.Prestige?window.Prestige.getChallengeModifiers():{autoDisabled:false,valueExponent:1};
    if(challenge.autoDisabled){
        return 0;
    }
    const rawPower=(autoBase*autoMultiplier)**autoExponent;
    const exponent=window.Prestige?window.Prestige.getGlobalExponent():1;
    const multiplier=window.Prestige?window.Prestige.getGlobalMultiplier():1;
    const normalPower=rawPower**exponent*multiplier*pushMultiplier;
    return Math.floor(normalPower**challenge.valueExponent*100)/100;
}

function getUpgradePriceForCost(cost){
    const challenge=window.Prestige?window.Prestige.getChallengeModifiers():{priceExponent:1};
    const discount=window.Prestige?window.Prestige.getUpgradeCostMultiplier():1;
    const price=cost**challenge.priceExponent*discount;
    return Number.isFinite(price)?Math.ceil(price):Infinity;
}

function getUpgradePrice(upgrade){
    return getUpgradePriceForCost(upgrade.cost);
}

function getUpgradeLimit(upgrade,index){
    if(index!==4||upgrade.limit===undefined){
        return upgrade.limit;
    }
    const prestige=window.Prestige;
    return upgrade.limit+
        Number(prestige&&prestige.getSkillLevel("1.5")>0)*10+
        Number(prestige&&prestige.getSkillLevel("1.7")>0)*5+
        Number(prestige&&prestige.getSkillLevel("1.8")>0)*5;
}

function getBulkUpgradeQuote(upgrade,index,quantity){
    const limit=getUpgradeLimit(upgrade,index);
    const remaining=limit===undefined?quantity:Math.max(0,limit-upgrade.count);
    const purchaseCount=Math.min(quantity,remaining);
    let cost=upgrade.cost;
    let total=0;
    for(let purchaseIndex=0;purchaseIndex<purchaseCount;purchaseIndex++){
        total+=getUpgradePriceForCost(cost);
        cost=Math.ceil(cost*1.1);
    }
    return {purchaseCount,total};
}

function isUpgradeBlocked(index){
    return Boolean(window.Prestige&&window.Prestige.isUpgradeBlocked(index));
}

function updateDisplays(){
    energyDisplay.textContent="Energy:"+formatNumber(energy);
    productionDisplay.textContent="AUTO: +"+formatNumber(autoPower())+" / "+formatNumber(autoInterval/1000)+"秒";
    upgrades.forEach((upgrade,index)=>{
        const card=document.querySelector('[data-upgrade="'+index+'"]');
        const limit=getUpgradeLimit(upgrade,index);
        document.getElementById("count"+index).textContent=upgrade.limit
            ? "購入: "+upgrade.count+" / "+limit
            : "購入: "+upgrade.count;
        const unitPrice=getUpgradePrice(upgrade);
        const bulkQuote=getBulkUpgradeQuote(upgrade,index,10);
        document.getElementById("price"+index).textContent=bulkQuote.purchaseCount>0
            ? "1回: "+formatNumber(unitPrice)+" / ×"+bulkQuote.purchaseCount+": "+formatNumber(bulkQuote.total)+" Energy"
            : "1回: "+formatNumber(unitPrice)+" / 上限到達";
        if(index===2||index===6){
            const currentExponent=index===2?clickExponent:autoExponent;
            const nextGain=upgrade.count<exponentSoftCap-1?exponentGain:exponentGainAfterCap;
            document.getElementById("effect"+index).textContent="指数: "+currentExponent.toFixed(3)+" / 次回 +"+(nextGain===exponentGain?"0.005":"0.001");
        }
        card.disabled=isUpgradeBlocked(index)||energy<getUpgradePrice(upgrade)||(limit!==undefined&&upgrade.count>=limit);
        const autoBuyToggle=document.querySelector('[data-auto-buy="'+index+'"]');
        if(autoBuyToggle){
            autoBuyToggle.checked=window.Game.getAutoBuyEnabled(index);
            autoBuyToggle.disabled=!window.Prestige||window.Prestige.getSkillLevel("3.3")===0;
        }
        const priorityControl=priorityControls[index];
        if(priorityControl){
            const priorityIndex=autoBuyPriority.indexOf(index);
            priorityControl.container.hidden=!window.Prestige||window.Prestige.getSkillLevel("3.4")===0;
            priorityControl.rank.textContent="優先 "+(priorityIndex+1);
            priorityControl.up.disabled=priorityIndex===0;
            priorityControl.down.disabled=priorityIndex===autoBuyPriority.length-1;
        }
    });
    document.querySelectorAll("[data-purchase-amount]").forEach(button=>{
        const amount=Number(button.dataset.purchaseAmount);
        const unlocked=amount===1||Boolean(window.Prestige&&window.Prestige.getSkillLevel("3.1")>0);
        button.disabled=!unlocked;
        button.classList.toggle("is-selected",purchaseAmount===amount);
        button.setAttribute("aria-pressed",String(purchaseAmount===amount));
    });
    if(window.Prestige){
        window.Prestige.updateDisplays();
    }
    if(window.Achievements){
        window.Achievements.refresh();
    }
}

function buyUpgrade(index,free=false,quantity=1){
    const upgrade=upgrades[index];
    const purchaseLimit=free?1:Math.max(1,Math.floor(quantity));
    let purchased=0;
    for(let purchaseIndex=0;purchaseIndex<purchaseLimit;purchaseIndex++){
        const limit=getUpgradeLimit(upgrade,index);
        if(isUpgradeBlocked(index)||(limit!==undefined&&upgrade.count>=limit)){
            break;
        }
        const price=getUpgradePrice(upgrade);
        if(!free&&energy<price){
            break;
        }
        if(!free){
            energy-=price;
        }
        upgrade.count++;
        upgrade.apply();
        upgrade.cost=Math.ceil(upgrade.cost*1.1);
        purchased++;
    }
    return purchased;
}

function addEnergy(amount){
    const energyCap=window.Prestige?window.Prestige.getEnergyCap():1e10;
    const previousEnergy=energy;
    const gain=Number.isFinite(amount)?Math.max(0,amount):energyCap;
    energy=Math.min(energyCap,energy+gain);
    const gained=energy-previousEnergy;
    if(gained>0&&window.Achievements){
        window.Achievements.recordEnergy(gained);
    }
    if(window.Prestige&&energy<energyCap){
        window.Prestige.tryAutoBuy();
    }
    updateDisplays();
    saveGame();
}

function saveGame(){
    if(window.Prestige){
        window.Prestige.saveGame();
    }
}

function collectAuto(){
    addEnergy(autoPower());
    setTimeout(collectAuto,autoInterval);
}

for(const [index,tab] of upgradeTabs.entries()){
    tab.addEventListener("click",()=>activateUpgradeTab(tab));
    tab.addEventListener("keydown",event=>{
        let nextIndex=index;
        if(event.key==="ArrowRight"){
            nextIndex=(index+1)%upgradeTabs.length;
        }else if(event.key==="ArrowLeft"){
            nextIndex=(index-1+upgradeTabs.length)%upgradeTabs.length;
        }else if(event.key==="Home"){
            nextIndex=0;
        }else if(event.key==="End"){
            nextIndex=upgradeTabs.length-1;
        }else{
            return;
        }
        event.preventDefault();
        activateUpgradeTab(upgradeTabs[nextIndex]);
        upgradeTabs[nextIndex].focus();
    });
}

document.querySelectorAll(".upgrade-card").forEach(card=>{
    card.addEventListener("click",function(){
        const index=Number(card.dataset.upgrade);
        const purchased=buyUpgrade(index,false,purchaseAmount);
        if(purchased>0){
            if(window.Achievements){
                for(let purchaseIndex=0;purchaseIndex<purchased;purchaseIndex++){
                    window.Achievements.recordUpgrade();
                }
            }
            if(window.Prestige){
                window.Prestige.tryAutoBuy();
            }
            updateDisplays();
            saveGame();
        }
    });
});

document.querySelectorAll("[data-purchase-amount]").forEach(button=>{
    button.addEventListener("click",()=>{
        purchaseAmount=Number(button.dataset.purchaseAmount);
        updateDisplays();
    });
});

document.querySelectorAll("[data-auto-buy]").forEach(toggle=>{
    toggle.addEventListener("change",()=>{
        window.Game.setAutoBuyEnabled(Number(toggle.dataset.autoBuy),toggle.checked);
        updateDisplays();
        saveGame();
    });
});

document.querySelectorAll(".upgrade-item").forEach((item,index)=>{
    const container=document.createElement("div");
    container.className="auto-priority-controls";
    const rank=document.createElement("span");
    const up=document.createElement("button");
    up.type="button";
    up.textContent="↑";
    up.title="自動購入の優先順位を上げる";
    up.setAttribute("aria-label","アップグレード"+(index+1)+"の優先順位を上げる");
    const down=document.createElement("button");
    down.type="button";
    down.textContent="↓";
    down.title="自動購入の優先順位を下げる";
    down.setAttribute("aria-label","アップグレード"+(index+1)+"の優先順位を下げる");
    up.addEventListener("click",()=>{
        window.Game.moveAutoBuyPriority(index,-1);
        updateDisplays();
        saveGame();
    });
    down.addEventListener("click",()=>{
        window.Game.moveAutoBuyPriority(index,1);
        updateDisplays();
        saveGame();
    });
    container.append(rank,up,down);
    item.appendChild(container);
    priorityControls.push({container,rank,up,down});
});

core.addEventListener("click",function(){
    if(window.Achievements){
        window.Achievements.recordClick();
    }
    addEnergy(clickPower());
    core.classList.remove("clicked");
    void core.offsetWidth;
    core.classList.add("clicked");
});

window.Game={
    get energy(){return energy;},
    set energy(value){energy=Number.isFinite(value)?Math.max(0,value):0;},
    get clickBase(){return clickBase;},
    set clickBase(value){clickBase=value;},
    get clickMultiplier(){return clickMultiplier;},
    set clickMultiplier(value){clickMultiplier=value;},
    get clickExponent(){return clickExponent;},
    set clickExponent(value){clickExponent=value;},
    get autoBase(){return autoBase;},
    set autoBase(value){autoBase=value;},
    get autoMultiplier(){return autoMultiplier;},
    set autoMultiplier(value){autoMultiplier=value;},
    get autoExponent(){return autoExponent;},
    set autoExponent(value){autoExponent=value;},
    get autoInterval(){return autoInterval;},
    set autoInterval(value){autoInterval=value;},
    get pushMultiplier(){return pushMultiplier;},
    set pushMultiplier(value){pushMultiplier=Number.isFinite(value)?Math.max(1,value):Number.MAX_VALUE;},
    get upgrades(){return upgrades;},
    get autoBuyEnabled(){return autoBuyEnabled.slice();},
    getAutoBuyEnabled(index){return autoBuyEnabled[index]===true;},
    setAutoBuyEnabled(index,enabled){
        if(Number.isInteger(index)&&index>=0&&index<autoBuyEnabled.length){
            autoBuyEnabled[index]=Boolean(enabled);
        }
    },
    getAutoBuyPriority(){return autoBuyPriority.slice();},
    setAutoBuyPriority(priority){
        if(Array.isArray(priority)&&priority.length===upgrades.length&&new Set(priority).size===upgrades.length&&priority.every(index=>Number.isInteger(index)&&index>=0&&index<upgrades.length)){
            autoBuyPriority=priority.slice();
        }
    },
    moveAutoBuyPriority(upgradeIndex,direction){
        const currentIndex=autoBuyPriority.indexOf(upgradeIndex);
        const targetIndex=currentIndex+direction;
        if(currentIndex<0||targetIndex<0||targetIndex>=autoBuyPriority.length){
            return;
        }
        [autoBuyPriority[currentIndex],autoBuyPriority[targetIndex]]=[autoBuyPriority[targetIndex],autoBuyPriority[currentIndex]];
    },
    getUpgradeLimit,
    get baseUpgradeCosts(){return [10,100,1000,100,1000,1000,1000];},
    getUpgradePrice,
    isUpgradeBlocked,
    formatNumber,
    get clickPower(){return clickPower();},
    get autoPower(){return autoPower();},
    updateDisplays,
    addEnergy,
    buyUpgrade,
    start(){setTimeout(collectAuto,autoInterval);},
    resetRun(){
        energy=0;
        clickBase=1;
        clickMultiplier=1;
        clickExponent=1;
        autoBase=1;
        autoMultiplier=1;
        autoExponent=1;
        autoInterval=10000;
        upgrades.forEach((upgrade,index)=>{
            upgrade.cost=this.baseUpgradeCosts[index];
            upgrade.count=0;
        });
    }
};
