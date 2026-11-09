let energy=0;
let clickBase=1;
let clickMultiplier=1;
let clickExponent=1;
let autoBase=1;
let autoMultiplier=1;
let autoExponent=1;
let autoInterval=10000;

const core=document.getElementById("core");
const energyDisplay=document.getElementById("energy");
const productionDisplay=document.getElementById("Production");
const exponentSoftCap=100;
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
const upgradeTabs=Array.from(document.querySelectorAll(".upgrade-tab"));

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
    const normalPower=rawPower**exponent*multiplier;
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
    const normalPower=rawPower**exponent*multiplier;
    return Math.floor(normalPower**challenge.valueExponent*100)/100;
}

function getUpgradePrice(upgrade){
    const challenge=window.Prestige?window.Prestige.getChallengeModifiers():{priceExponent:1};
    const price=upgrade.cost**challenge.priceExponent;
    return Number.isFinite(price)?Math.ceil(price):Infinity;
}

function isUpgradeBlocked(index){
    return Boolean(window.Prestige&&window.Prestige.isUpgradeBlocked(index));
}

function updateDisplays(){
    energyDisplay.textContent="Energy:"+formatNumber(energy);
    productionDisplay.textContent="AUTO: +"+formatNumber(autoPower())+" / "+formatNumber(autoInterval/1000)+"秒";
    upgrades.forEach((upgrade,index)=>{
        const card=document.querySelector('[data-upgrade="'+index+'"]');
        document.getElementById("count"+index).textContent=upgrade.limit
            ? "購入: "+upgrade.count+" / "+upgrade.limit
            : "購入: "+upgrade.count;
        document.getElementById("price"+index).textContent=formatNumber(getUpgradePrice(upgrade))+" Energy";
        if(index===2||index===6){
            const currentExponent=index===2?clickExponent:autoExponent;
            const nextGain=upgrade.count<exponentSoftCap-1?exponentGain:exponentGainAfterCap;
            document.getElementById("effect"+index).textContent="指数: "+currentExponent.toFixed(3)+" / 次回 +"+(nextGain===exponentGain?"0.005":"0.001");
        }
        card.disabled=isUpgradeBlocked(index)||energy<getUpgradePrice(upgrade)||(upgrade.limit!==undefined&&upgrade.count>=upgrade.limit);
    });
    if(window.Prestige){
        window.Prestige.updateDisplays();
    }
    if(window.Achievements){
        window.Achievements.refresh();
    }
}

function buyUpgrade(index,free=false){
    const upgrade=upgrades[index];
    if(isUpgradeBlocked(index)){
        return false;
    }
    const price=getUpgradePrice(upgrade);
    if(!free&&(energy<price||(upgrade.limit!==undefined&&upgrade.count>=upgrade.limit))){
        return false;
    }
    if(free&&upgrade.limit!==undefined&&upgrade.count>=upgrade.limit){
        return false;
    }
    if(!free){
        energy-=price;
    }
    upgrade.count++;
    upgrade.apply();
    upgrade.cost=Math.ceil(upgrade.cost*1.1);
    return true;
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
        if(buyUpgrade(index)){
            if(window.Achievements){
                window.Achievements.recordUpgrade();
            }
            if(window.Prestige){
                window.Prestige.tryAutoBuy();
            }
            updateDisplays();
            saveGame();
        }
    });
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
    get upgrades(){return upgrades;},
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