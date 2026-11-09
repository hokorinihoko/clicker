let prestigePoints=0;
let prestigeCount=0;
let prestigeUnlocked=false;
let developerMode=false;
let pushCount=0;
let pushUnlocked=false;
let lastPushEnergy=0;

const prestigeSaveKey="luminousClickerPrestigeSave";
const developerGiftCode="hokorinohoko";
const prestigeEnergyRequirement=1e10;
const pushEnergyRequirement=1e5;
const viewToggle=document.getElementById("view-toggle");
const prestigeView=document.getElementById("prestige-view");
const developerToggle=document.getElementById("developer-toggle");
const developerPanel=document.getElementById("developer-panel");
let prestigeWindowPosition=null;
const pendingSkillClicks=new Map();
const skillTreeOffsetY=200;
const mx=[
	-145,-139,0,139,145
];
const my=[
	-126,-80,0,80,126,
];
const skillDefinitions=[
	{id:"0",name:"0",description:"全獲得量の指数 +0.01",cost:1,maxLevel:10,x:410,y:440},
	{id:"1.1",name:"1.1",description:"全獲得量 +1倍",cost:1,requires:"0",x:410,y:215},
	{id:"2.1",name:"2.1",description:"転生ポイント獲得数 +1倍",cost:2,requires:"0",x:605,y:327},
	{id:"3.1",name:"3.1",description:"x10購入解禁",cost:2,requires:"0",x:605,y:552},
	{id:"4.1",name:"4.1",description:"Energy上限を 1e11 に拡張",cost:10,requires:"0",x:410,y:665},
	{id:"5.1",name:"5.1",description:"転生後、CPを+10購入済みで開始",cost:10,requires:"0",x:215,y:552},
	{id:"6.1",name:"6.1",description:"チャレンジ解放",cost:50,requires:"0",x:215,y:327},
	{id:"1.2",name:"1.2",description:"全獲得量 +1倍",cost:2,requires:"1.1",x:410+mx[0],y:215+my[1]},
	{id:"1.3",name:"1.3",description:"全獲得量 +3倍",cost:5,requires:"1.1",x:410+mx[4],y:215+my[1]},
	{id:"1.4",name:"1.4",description:"全獲得量 +3倍",cost:10,requires:"1.2,1.3",x:410,y:215+my[0]},
	{id:"1.5",name:"1.5",description:"オード時間短縮の最大購入数+10",cost:5,requires:"1.3",x:410+mx[4]*2,y:215+my[1]*2},
	{id:"1.6",name:"1.6",description:"全アップグレード値段5%引き",cost:10,requires:"1.2",x:410+mx[0]*2,y:215+my[1]*2},
	{id:"1.7",name:"1.7",description:"オード時間短縮の最大購入数+5",cost:15,requires:"1.6",x:410+mx[4]*3,y:215+my[1]*3},
	{id:"1.8",name:"1.8",description:"オード時間短縮の最大購入数+5",cost:45,requires:"1.7",x:410+mx[4]*3,y:215+my[0]+my[1]*3},
	{id:"1.9",name:"1.9",description:"全アップグレード値段1%引き",cost:20,requires:"1.5",x:410+mx[0]*3,y:215+my[1]*3},
	{id:"2.2",name:"2.2",description:"転生ポイント獲得数 +1倍",cost:3,requires:"2.1",x:605+mx[3],y:327+my[1]},
	{id:"2.3",name:"2.3",description:"転生ポイント獲得数 +1倍",cost:10,requires:"2.2",x:605+mx[3]*2,y:327+my[1]*2},
	{id:"2.4",name:"2.4",description:"転生ポイント獲得数 +1倍",cost:50,requires:"2.3",x:605+mx[3]*3,y:327+my[1]*3},
	{id:"3.2",name:"3.2",description:"最安アップグレードを自動購入",cost:10,requires:"3.1",x:605+mx[3],y:552+my[3]},
	{id:"3.3",name:"3.3",description:"自動購入をON/OFF可能にする",cost:20,requires:"3.2",x:605+mx[3]*2,y:552+my[3]*2},
	{id:"3.4",name:"3.4",description:"優先順位を変更可能にする",cost:20,requires:"3.3",x:605+mx[3]*3,y:552+my[3]*3},
	{id:"4.2",name:"4.2",description:"Energy上限を 1e12 に拡張",cost:50,requires:"4.1",x:410,y:665+my[4]},
	{id:"4.3",name:"4.3",description:"Energy上限を 1e13 に拡張",cost:1000,requires:"4.2",x:410,y:665+my[4]*2},
	{id:"4.4",name:"4.4",description:"Energy上限を 1e14 に拡張",cost:50000,requires:"4.3",x:410,y:665+my[4]*3},
	{id:"4.5",name:"4.5",description:"Energy上限を 1e15 に拡張",cost:100000,requires:"4.4",x:410,y:665+my[4]*4},
	{id:"5.2",name:"5.2",description:"転生後、CPをさらに+10購入済み",cost:10,requires:"5.1",x:215,y:552+my[4]},
	{id:"5.3",name:"5.3",description:"転生後、クリック倍率を+10購入済み",cost:15,requires:"5.1",x:215+mx[0],y:552},
	{id:"6.2",name:"6.2",description:"チャレンジ1つクリアにつき+^0.1",cost:500,requires:"6.1",x:215+mx[0],y:327+my[1]}
];
skillDefinitions.forEach(skill=>{
	if(skill.maxLevel===undefined){
		skill.maxLevel=1;
	}
});

const skillLevels=Object.fromEntries(skillDefinitions.map(skill=>[skill.id,0]));
const skillEdges=[
	["0","1.1"],["0","2.1"],["0","3.1"],["0","4.1"],["0","5.1"],["0","6.1"],
	["1.1","1.2"],["1.1","1.3"],["1.2","1.4"],["1.3","1.4"],["1.3","1.5"],
	["1.2","1.6"],["1.5","1.7"],["1.7","1.8"],["1.6","1.9"],
	["2.1","2.2"],
	["3.1","3.2"],["3.2","3.3"],["3.3","3.4"],
	["4.1","4.2"],["4.2","4.3"],["4.3","4.4"],["4.4","4.5"],
	["5.1","5.2"],["5.1","5.3"],
	["6.1","6.2"]
];
const skillButtons=new Map();
const challengeDefinitions=[
	{id:1,valueExponent:0.5,description:"すべての獲得量を x^0.5 にする"},
	{id:2,autoDisabled:true,description:"オート獲得とオート系アップグレード禁止"},
	{id:3,valueExponent:0.1,description:"すべての獲得量を x^0.1 にする"},
	{id:4,exponentUpgradesDisabled:true,description:"指数アップグレード禁止"},
	{id:5,valueExponent:0.01,description:"すべての獲得量を x^0.01 にする"},
	{id:6,priceExponent:2,description:"すべてのアップグレード価格を x^2 にする"},
	{id:7,valueExponent:0.1,priceExponent:3,description:"獲得量 x^0.1 ・アップグレード価格 x^3"},
	{id:8,valueExponent:0.01,priceExponent:2,description:"獲得量 x^0.01 ・アップグレード価格 x^2"},
	{id:9,valueExponent:0.01,exponentUpgradesDisabled:true,description:"指数アップグレード禁止 ・獲得量 x^0.01"},
	{id:10,valueExponent:0.01,priceExponent:3,exponentUpgradesDisabled:true,description:"指数アップグレード禁止 ・アップグレード価格 x^3 ・獲得量 x^0.01"}
].map(challenge=>({
	...challenge,
	name:"チャレンジ "+challenge.id,
	valueExponent:challenge.valueExponent??1,
	priceExponent:challenge.priceExponent??1
}));
const challengeButtons=new Map();
let activeChallenge=null;
let clearedChallenges=new Set();

function getSkillLevel(skillId){
	const level=skillLevels[skillId];
	return Number.isInteger(level)&&level>=0?level:0;
};

function getEnergyCap(){
	if(getSkillLevel("4.5")>0){
		return 1e15;
	};
	if(getSkillLevel("4.4")>0){
		return 1e14;
	};
	if(getSkillLevel("4.3")>0){
		return 1e13;
	};
	if(getSkillLevel("4.2")>0){
		return 1e12;
	};
	if(getSkillLevel("4.1")>0){
		return 1e11;
	};
	return 1e10;
};

function getGlobalExponent(){
	return 1+getSkillLevel("0")*0.01;
}

function getGlobalMultiplier(){
	return 1+
		Number(getSkillLevel("1.1")>0)+
		Number(getSkillLevel("1.2")>0)+
		(getSkillLevel("1.3")>0?3:0)+
		(getSkillLevel("1.4")>0?3:0);
}

function getPrestigePointMultiplier(){
	return 1+Number(getSkillLevel("2.1")>0)+Number(getSkillLevel("2.2")>0)+Number(getSkillLevel("2.3")>0)+Number(getSkillLevel("2.4")>0);
}

function skillCost(skill){
	return skill.id==="0"?2**getSkillLevel(skill.id):skill.cost;
}

function createSkillTree(){
	const svg=document.getElementById("skill-tree-lines");
	for(const [parentId,childId] of skillEdges){
		const parent=skillDefinitions.find(skill=>skill.id===parentId);
		const child=skillDefinitions.find(skill=>skill.id===childId);
		const line=document.createElementNS("http://www.w3.org/2000/svg","line");
		line.setAttribute("x1",parent.x);
		line.setAttribute("y1",parent.y+skillTreeOffsetY);
		line.setAttribute("x2",child.x);
		line.setAttribute("y2",child.y+skillTreeOffsetY);
		line.dataset.child=childId;
		svg.appendChild(line);
	}

	const container=document.getElementById("skill-tree-nodes");
	for(const skill of skillDefinitions){
		const button=document.createElement("button");
		button.className="skill-node";
		button.type="button";
		button.style.left=skill.x+"px";
		button.style.top=(skill.y+skillTreeOffsetY)+"px";

		const name=document.createElement("span");
		name.className="skill-node-name";
		name.textContent=skill.name;
		const description=document.createElement("span");
		description.className="skill-node-description";
		description.textContent=skill.description;
		const cost=document.createElement("span");
		cost.className="skill-node-cost";

		button.append(name,description,cost);
		button.addEventListener("click",event=>{
			if(developerMode){
				adjustSkillLevelFromClick(skill,event);
				return;
			}
			purchaseSkill(skill);
		});
		button.addEventListener("dblclick",event=>{
			if(developerMode){
				event.preventDefault();
			}
		});
		container.appendChild(button);
		skillButtons.set(skill.id,{button,cost});
	}
}

function isSkillAvailable(skill){
	return !skill.requires||skill.requires.split(",").every(skillId=>getSkillLevel(skillId.trim())>0);
}

function clampPrestigeWindowPosition(){
	const rect=prestigeView.getBoundingClientRect();
	const position=prestigeWindowPosition||{left:rect.left,top:rect.top};
	const left=Math.min(Math.max(position.left,8),Math.max(8,window.innerWidth-rect.width-8));
	const top=Math.min(Math.max(position.top,8),Math.max(8,window.innerHeight-rect.height-8));
	prestigeView.style.left=left+"px";
	prestigeView.style.top=top+"px";
	prestigeView.style.transform="none";
	prestigeWindowPosition={left,top};
}

function movePrestigeWindow(left,top){
	prestigeWindowPosition={left,top};
	clampPrestigeWindowPosition();
}

function updateSkillTree(){
	for(const skill of skillDefinitions){
		const level=getSkillLevel(skill.id);
		const cost=skillCost(skill);
		const prerequisiteMet=isSkillAvailable(skill);
		const isMaxed=level>=skill.maxLevel;
		const {button,cost:costLabel}=skillButtons.get(skill.id);
		button.classList.toggle("purchased",level>0);
		button.classList.toggle("available",prerequisiteMet&&!skill.development&&!isMaxed);
		button.classList.toggle("dev",Boolean(skill.development));
		button.disabled=!developerMode&&(Boolean(skill.development)||!prerequisiteMet||isMaxed||prestigePoints<cost);

		if(skill.development){
			costLabel.textContent=window.Game.formatNumber(skill.cost)+" pt ・開発中";
		}else if(isMaxed||level>0&&skill.maxLevel===1){
			costLabel.textContent="取得済み";
		}else if(skill.maxLevel>1){
			costLabel.textContent=level+" / "+skill.maxLevel+" ・次: "+window.Game.formatNumber(cost)+" pt";
		}else{
			costLabel.textContent=window.Game.formatNumber(cost)+" pt";
		}
	}

	for(const line of document.querySelectorAll(".skill-tree-lines line")){
		line.classList.toggle("active",getSkillLevel(line.dataset.child)>0);
	}
}

function adjustSkillLevel(skill,amount){
	skillLevels[skill.id]=Math.max(0,Math.min(skill.maxLevel,getSkillLevel(skill.id)+amount));
	updatePrestigeDisplays();
	savePrestigeGame();
}

function adjustSkillLevelFromClick(skill,event){
	const pendingClick=pendingSkillClicks.get(skill.id);
	if(event.detail===0){
		adjustSkillLevel(skill,1);
		return;
	}
	if(pendingClick){
		clearTimeout(pendingClick);
		pendingSkillClicks.delete(skill.id);
		adjustSkillLevel(skill,-1);
		return;
	}
	const timer=setTimeout(()=>{
		pendingSkillClicks.delete(skill.id);
		adjustSkillLevel(skill,1);
	},250);
	pendingSkillClicks.set(skill.id,timer);
}

function createChallengeCards(){
	const list=document.getElementById("challenge-list");
	for(const challenge of challengeDefinitions){
		const button=document.createElement("button");
		button.className="challenge-card is-locked";
		button.type="button";
		const title=document.createElement("span");
		title.className="challenge-title";
		title.textContent=challenge.name;
		const debuff=document.createElement("span");
		debuff.className="challenge-debuff";
		debuff.textContent=challenge.description;
		const cost=document.createElement("span");
		cost.className="challenge-cost";
		cost.textContent="条件: デバフ中に転生";
		const state=document.createElement("span");
		state.className="challenge-state";
		button.append(title,debuff,cost,state);
		button.addEventListener("click",()=>startChallenge(challenge.id));
		list.appendChild(button);
		challengeButtons.set(challenge.id,{button,state});
	}
}

function isChallengeUnlocked(challengeId){
	return challengeId===1||clearedChallenges.has(challengeId-1);
}

function updateChallengeDisplays(){
	const section=document.getElementById("challenge-section");
	section.hidden=getSkillLevel("6.2")===0;
	if(section.hidden){
		return;
	}

	const status=document.getElementById("challenge-status");
	if(activeChallenge!==null){
		const active=challengeDefinitions.find(challenge=>challenge.id===activeChallenge);
		status.textContent=active.name+"に挑戦中。同じカードをもう一度押すと中断できます。デバフ中に転生するとクリアです。";
	}else{
		const nextChallenge=challengeDefinitions.find(challenge=>!clearedChallenges.has(challenge.id));
		status.textContent=nextChallenge
			? "挑戦を始めると現在のランをリセットします。次に挑戦可能: "+nextChallenge.name
			: "全10チャレンジをクリアしました。クリア済みチャレンジには再挑戦できます。";
	}

	for(const challenge of challengeDefinitions){
		const {button,state}=challengeButtons.get(challenge.id);
		const cleared=clearedChallenges.has(challenge.id);
		const active=activeChallenge===challenge.id;
		const unlocked=isChallengeUnlocked(challenge.id);
		button.classList.toggle("is-cleared",cleared&&!active);
		button.classList.toggle("is-active",active);
		button.classList.toggle("is-locked",!unlocked);
		button.disabled=activeChallenge!==null? !active:!unlocked;
		state.textContent=active
			? "挑戦中・クリックで中断"
			: cleared
				? "クリア済み・再挑戦可能"
				: unlocked
					? "挑戦可能"
					: "前のチャレンジをクリアで解放";
	}
}

function updatePrestigeDisplays(){
	const game=window.Game;
	const energyCap=getEnergyCap();
	game.energy=Math.min(game.energy,energyCap);
	if(game.energy>=pushEnergyRequirement){
		pushUnlocked=true;
	}
	const pushButton=document.getElementById("push-button");
	pushButton.hidden=!pushUnlocked;
	const canPush=game.energy>=pushEnergyRequirement&&game.energy>lastPushEnergy;
	pushButton.disabled=!canPush;
	pushButton.textContent=canPush?"Pushする":lastPushEnergy>=pushEnergyRequirement
		? "前回PushのEnergy超過で実行可能"
		: "Pushする (Energy 1e5で実行可能)";
	document.getElementById("push-status").textContent=pushUnlocked
		? "現在のPush倍率: x"+window.Game.formatNumber(game.pushMultiplier)+" ・Push回数: "+window.Game.formatNumber(pushCount)+" ・前回Push時Energy: "+window.Game.formatNumber(lastPushEnergy)
		: "Energy 1e5でPushが解放されます。";
	if(game.energy>=1e10||prestigeCount>0){
		prestigeUnlocked=true;
	}
	viewToggle.hidden=!prestigeUnlocked;
	developerToggle.hidden=!developerMode;
	document.getElementById("prestige-points").textContent="転生ポイント: "+window.Game.formatNumber(prestigePoints)+" (転生 "+window.Game.formatNumber(prestigeCount)+"回)";
	document.getElementById("energy-cap").textContent="Energy上限: "+window.Game.formatNumber(energyCap);

	const reward=Math.floor(game.energy/prestigeEnergyRequirement)*getPrestigePointMultiplier();
	const button=document.getElementById("prestige-button");
	button.hidden=game.energy<prestigeEnergyRequirement;
	button.textContent="転生する ("+window.Game.formatNumber(reward)+" pt)";
	document.getElementById("prestige-reward").textContent="転生獲得: "+window.Game.formatNumber(reward)+" pt";
	const autoBuyEnabledCount=window.Game.autoBuyEnabled.filter(Boolean).length;
	document.getElementById("auto-buy-status").textContent=getSkillLevel("3.1")===0
		? "自動購入: 未解放"
		: autoBuyEnabledCount===0
			? "自動購入: 対象なし"
			: "自動購入: 有効 ("+autoBuyEnabledCount+" / "+window.Game.upgrades.length+"種類を対象)";
	updateSkillTree();
	updateChallengeDisplays();
}

function savePrestigeGame(){
	const game=window.Game;
	const save={
		gameStateVersion:2,
		energy:game.energy,
		clickBase:game.clickBase,
		clickMultiplier:game.clickMultiplier,
		clickExponent:game.clickExponent,
		autoBase:game.autoBase,
		autoMultiplier:game.autoMultiplier,
		autoExponent:game.autoExponent,
		autoInterval:game.autoInterval,
		prestigePoints,
		prestigeCount,
		prestigeUnlocked,
		developerMode,
		pushCount,
		pushUnlocked,
		lastPushEnergy,
		pushMultiplier:game.pushMultiplier,
		prestigeWindowPosition,
		autoBuyEnabled:game.autoBuyEnabled,
		skillIdVersion:2,
		activeChallenge,
		clearedChallenges:Array.from(clearedChallenges),
		skillLevels:Object.fromEntries(skillDefinitions.map(skill=>[skill.id,getSkillLevel(skill.id)])),
		upgrades:game.upgrades.map(upgrade=>({cost:upgrade.cost,count:upgrade.count}))
	};
	try{
		localStorage.setItem(prestigeSaveKey,JSON.stringify(save));
	}catch(error){
		console.warn("セーブできませんでした",error);
	}
}

function loadPrestigeGame(){
	try{
		const save=JSON.parse(localStorage.getItem(prestigeSaveKey));
		if(!save||typeof save!=="object"){
			return;
		}
		for(const key of ["prestigePoints","prestigeCount"]){
			if(Number.isFinite(save[key])&&save[key]>=0){
				if(key==="prestigePoints"){
					prestigePoints=save[key];
				}else{
					prestigeCount=save[key];
				}
			}
		}
		prestigeUnlocked=save.prestigeUnlocked===true||prestigeCount>0;
		developerMode=save.developerMode===true;
		pushCount=Number.isInteger(save.pushCount)&&save.pushCount>=0?save.pushCount:0;
		pushUnlocked=save.pushUnlocked===true||pushCount>0;
		lastPushEnergy=Number.isFinite(save.lastPushEnergy)&&save.lastPushEnergy>=0?save.lastPushEnergy:0;
		if(Number.isFinite(save.pushMultiplier)&&save.pushMultiplier>=1){
			window.Game.pushMultiplier=save.pushMultiplier;
		}
		if(save.prestigeWindowPosition&&Number.isFinite(save.prestigeWindowPosition.left)&&Number.isFinite(save.prestigeWindowPosition.top)){
			prestigeWindowPosition={left:save.prestigeWindowPosition.left,top:save.prestigeWindowPosition.top};
		}
		if(Array.isArray(save.autoBuyEnabled)){
			save.autoBuyEnabled.forEach((enabled,index)=>window.Game.setAutoBuyEnabled(index,enabled));
		}

		if(save.skillLevels&&typeof save.skillLevels==="object"){
			const legacySkillIds={
				"1":"0",
				"2.1":"1.1",
				"2.2":"2.1",
				"2.3":"3.1",
				"2.4":"4.1",
				"2.5":"5.1",
				"2.6":"6.1",
				"3.1":"1.2",
				"3.2":"1.3",
				"3.3":"2.2",
				"3.4":"4.2",
				"3.5":"5.2",
				"3.6":"5.3"
			};
			const isCurrentSkillSchema=save.skillIdVersion>=2||Object.prototype.hasOwnProperty.call(save.skillLevels,"0");
			for(const skill of skillDefinitions){
				const sourceId=isCurrentSkillSchema
					? skill.id
					: Object.keys(legacySkillIds).find(oldId=>legacySkillIds[oldId]===skill.id);
				const level=save.skillLevels[sourceId||skill.id];
				skillLevels[skill.id]=Number.isInteger(level)&&level>=0
					? Math.min(level,skill.maxLevel)
					: 0;
			}
		}
		if(Array.isArray(save.clearedChallenges)){
			clearedChallenges=new Set(save.clearedChallenges.filter(id=>Number.isInteger(id)&&id>=1&&id<=challengeDefinitions.length));
		}
		if(Number.isInteger(save.activeChallenge)&&save.activeChallenge>=1&&save.activeChallenge<=challengeDefinitions.length&&getSkillLevel("6.2")>0){
			activeChallenge=save.activeChallenge;
		}

		for(const key of ["clickBase","clickMultiplier","clickExponent","autoMultiplier","autoExponent","autoInterval"]){
			if(Number.isFinite(save[key])&&save[key]>=0){
				window.Game[key]=save[key];
			}
		}
		if(Number.isFinite(save.autoBase)&&save.autoBase>=0){
			window.Game.autoBase=save.gameStateVersion>=2?save.autoBase:save.autoBase+1;
		}
		if(Array.isArray(save.upgrades)){
			window.Game.upgrades.forEach((upgrade,index)=>{
				const savedUpgrade=save.upgrades[index];
				if(savedUpgrade&&Number.isFinite(savedUpgrade.cost)&&savedUpgrade.cost>0&&Number.isInteger(savedUpgrade.count)&&savedUpgrade.count>=0){
					upgrade.cost=savedUpgrade.cost;
					upgrade.count=savedUpgrade.count;
				}
			});
		}
		if(Number.isFinite(save.energy)&&save.energy>=0){
			window.Game.energy=Math.min(save.energy,getEnergyCap());
		}
	}catch(error){
		console.warn("セーブデータを読み込めませんでした",error);
	}
}

function buyCheapestAvailableUpgrade(){
	const game=window.Game;
	while(game.energy<getEnergyCap()){
		const next=game.upgrades
			.map((upgrade,index)=>({upgrade,index}))
			.filter(item=>game.getAutoBuyEnabled(item.index)&&!game.isUpgradeBlocked(item.index)&&game.energy>=game.getUpgradePrice(item.upgrade)&&(
				item.upgrade.limit===undefined||item.upgrade.count<item.upgrade.limit
			))
			.sort((left,right)=>game.getUpgradePrice(left.upgrade)-game.getUpgradePrice(right.upgrade)||left.index-right.index)[0];
		if(!next||!game.buyUpgrade(next.index)){
			break;
		}
		if(window.Achievements){
			window.Achievements.recordUpgrade();
		}
	}
}

function purchaseSkill(skill){
	const cost=skillCost(skill);
	if(skill.development||getSkillLevel(skill.id)>=skill.maxLevel||prestigePoints<cost||!isSkillAvailable(skill)){
		return;
	}
	prestigePoints-=cost;
	skillLevels[skill.id]=getSkillLevel(skill.id)+1;
	if(skill.id==="3.1"){
		buyCheapestAvailableUpgrade();
	}
	updatePrestigeDisplays();
	savePrestigeGame();
	if(window.Achievements){
		window.Achievements.recordSkill(skill.id);
	}
}

function startChallenge(challengeId){
	if(getSkillLevel("6.2")===0||!Number.isInteger(challengeId)){
		return;
	}
	if(activeChallenge===challengeId){
		activeChallenge=null;
		window.Game.updateDisplays();
		savePrestigeGame();
		return;
	}
	if(activeChallenge!==null||!isChallengeUnlocked(challengeId)){
		return;
	}
	activeChallenge=challengeId;
	window.Game.resetRun();
	window.Game.updateDisplays();
	savePrestigeGame();
}

function prestige(){
	const game=window.Game;
	if(game.energy<prestigeEnergyRequirement){
		return;
	}
	const pointsEarned=Math.floor(game.energy/prestigeEnergyRequirement)*getPrestigePointMultiplier();
	if(pointsEarned<=0){
		return;
	}
	const challengeNotice=activeChallenge!==null?"\n現在のチャレンジもクリアになります。":"";
	const confirmation="転生しますか？\nEnergyとアップグレードの進行はリセットされます。\n転生ポイントを "+window.Game.formatNumber(pointsEarned)+" pt獲得します。"+challengeNotice;
	if(!window.confirm(confirmation)){
		return;
	}
	const completedChallenge=activeChallenge;

	prestigePoints+=pointsEarned;
	prestigeCount++;
	if(completedChallenge!==null){
		clearedChallenges.add(completedChallenge);
		activeChallenge=null;
	}
	game.pushMultiplier=1;
	pushCount=0;
	pushUnlocked=false;
	lastPushEnergy=0;
	game.resetRun();
	const freeClickBuys=10*Number(getSkillLevel("5.1")>0)+10*Number(getSkillLevel("5.2")>0);
	for(let index=0;index<freeClickBuys;index++){
		game.buyUpgrade(0,true);
	}
	if(getSkillLevel("5.3")>0){
		for(let index=0;index<10;index++){
			game.buyUpgrade(1,true);
		}
	}
	game.updateDisplays();
	savePrestigeGame();
	if(window.Achievements){
		window.Achievements.recordPrestige(pointsEarned);
		if(completedChallenge!==null){
			window.Achievements.recordChallengeClear(completedChallenge);
		}
	}
}

function getPushMultiplierForEnergy(energy){
	if(!Number.isFinite(energy)||energy<pushEnergyRequirement){
		return 1;
	}
	return 10**(0.19*(Math.log10(energy)-4)**2);
}

function push(){
	const game=window.Game;
	if(game.energy<pushEnergyRequirement||game.energy<=lastPushEnergy){
		return;
	}
	const multiplierGained=getPushMultiplierForEnergy(game.energy);
	const energyAtPush=game.energy;
	const confirmation="Pushしますか？\nEnergyとアップグレードをリセットします。\nPush倍率は x"+window.Game.formatNumber(multiplierGained)+" に置き換わります。";
	if(!window.confirm(confirmation)){
		return;
	}
	game.pushMultiplier=multiplierGained;
	pushCount++;
	pushUnlocked=true;
	lastPushEnergy=energyAtPush;
	game.resetRun();
	game.updateDisplays();
	savePrestigeGame();
}

const developerValueDefinitions=[
	{key:"energy",label:"Energy"},
	{key:"prestigePoints",label:"転生ポイント"},
	{key:"prestigeCount",label:"転生回数"},
	{key:"clickBase",label:"クリック基本値"},
	{key:"clickMultiplier",label:"クリック倍率"},
	{key:"clickExponent",label:"クリック指数"},
	{key:"autoBase",label:"オート基本値"},
	{key:"autoMultiplier",label:"オート倍率"},
	{key:"autoExponent",label:"オート指数"},
	{key:"autoInterval",label:"オート間隔 (ms)"},
	{key:"pushMultiplier",label:"Push倍率"},
	{key:"pushCount",label:"Push回数"},
	{key:"lastPushEnergy",label:"前回Push時Energy"}
];

function getDeveloperValues(){
	const game=window.Game;
	return {
		energy:game.energy,
		prestigePoints,
		prestigeCount,
		clickBase:game.clickBase,
		clickMultiplier:game.clickMultiplier,
		clickExponent:game.clickExponent,
		autoBase:game.autoBase,
		autoMultiplier:game.autoMultiplier,
		autoExponent:game.autoExponent,
		autoInterval:game.autoInterval,
		pushMultiplier:game.pushMultiplier,
		pushCount,
		lastPushEnergy
	};
}

function setDeveloperValue(key,value){
	if(!Number.isFinite(value)){
		return;
	}
	const game=window.Game;
	const nonNegative=Math.max(0,value);
	switch(key){
		case "energy": game.energy=Math.min(nonNegative,getEnergyCap()); break;
		case "prestigePoints": prestigePoints=nonNegative; break;
		case "prestigeCount": prestigeCount=Math.floor(nonNegative); break;
		case "clickBase": game.clickBase=nonNegative; break;
		case "clickMultiplier": game.clickMultiplier=nonNegative; break;
		case "clickExponent": game.clickExponent=nonNegative; break;
		case "autoBase": game.autoBase=nonNegative; break;
		case "autoMultiplier": game.autoMultiplier=nonNegative; break;
		case "autoExponent": game.autoExponent=nonNegative; break;
		case "autoInterval": game.autoInterval=Math.max(100,nonNegative); break;
		case "pushMultiplier": game.pushMultiplier=Math.max(1,nonNegative); break;
		case "pushCount": pushCount=Math.floor(nonNegative); break;
		case "lastPushEnergy": lastPushEnergy=nonNegative; break;
		default: return;
	}
	game.updateDisplays();
	savePrestigeGame();
}

function renderDeveloperPanel(){
	const values=getDeveloperValues();
	const valuesContainer=document.getElementById("developer-values");
	valuesContainer.replaceChildren();
	for(const definition of developerValueDefinitions){
		const row=document.createElement("div");
		row.className="developer-value-row";
		const label=document.createElement("span");
		label.className="developer-value-label";
		label.textContent=definition.label;
		const value=document.createElement("output");
		value.textContent=window.Game.formatNumber(values[definition.key]);
		const actions=document.createElement("div");
		actions.className="developer-value-actions";
		for(const [operation,text] of [["add","+1"],["subtract","-1"],["multiply","×10"],["divide","÷10"]]){
			const button=document.createElement("button");
			button.type="button";
			button.textContent=text;
			button.setAttribute("aria-label",definition.label+"を"+text);
			button.addEventListener("click",()=>{
				const current=getDeveloperValues()[definition.key];
				const next=operation==="add"?current+1
					:operation==="subtract"?current-1
					:operation==="multiply"?current*10
					:current/10;
				setDeveloperValue(definition.key,next);
				renderDeveloperPanel();
			});
			actions.appendChild(button);
		}
		row.append(label,value,actions);
		valuesContainer.appendChild(row);
	}

	const achievementContainer=document.getElementById("developer-achievements");
	achievementContainer.replaceChildren();
	for(const achievement of window.Achievements.getAchievements()){
		const button=document.createElement("button");
		button.type="button";
		button.className="developer-achievement"+(achievement.unlocked?" is-enabled":"");
		button.dataset.achievementId=achievement.id;
		button.setAttribute("aria-pressed",String(achievement.unlocked));
		button.textContent=achievement.name+" · "+(achievement.unlocked?"ON":"OFF");
		button.addEventListener("click",()=>{
			window.Achievements.setAchievementUnlocked(achievement.id,!achievement.unlocked);
			renderDeveloperPanel();
		});
		achievementContainer.appendChild(button);
	}
}

function resetAllGameData(){
	if(!window.confirm("ゲームの全データをリセットします。実績・転生・開発者モードも消去されます。よろしいですか？")){
		return;
	}
	window.removeEventListener("beforeunload",savePrestigeGame);
	localStorage.removeItem(prestigeSaveKey);
	localStorage.removeItem("luminousClickerAchievements");
	window.location.reload();
}

window.Prestige={
	getEnergyCap,
	getGlobalExponent,
	getGlobalMultiplier,
	getSkillLevel,
	getPrestigePointMultiplier,
	getPushMultiplierForEnergy,
	getDeveloperValues,
	setDeveloperValue,
	setDeveloperMode(enabled){
		developerMode=Boolean(enabled);
		developerToggle.hidden=!developerMode;
		if(!developerMode){
			developerPanel.hidden=true;
			developerToggle.setAttribute("aria-expanded","false");
		}
		updatePrestigeDisplays();
		savePrestigeGame();
	},
	getChallengeModifiers(){
		const challenge=challengeDefinitions.find(item=>item.id===activeChallenge);
		return challenge?{
			valueExponent:challenge.valueExponent,
			priceExponent:challenge.priceExponent,
			autoDisabled:Boolean(challenge.autoDisabled),
			exponentUpgradesDisabled:Boolean(challenge.exponentUpgradesDisabled)
		}:{valueExponent:1,priceExponent:1,autoDisabled:false,exponentUpgradesDisabled:false};
	},
	isUpgradeBlocked(index){
		const challenge=challengeDefinitions.find(item=>item.id===activeChallenge);
		if(!challenge){
			return false;
		}
		return (challenge.autoDisabled&&index>=3)||(challenge.exponentUpgradesDisabled&&(index===2||index===6));
	},
	getActiveChallenge(){return activeChallenge;},
	updateDisplays:updatePrestigeDisplays,
	saveGame:savePrestigeGame,
	tryAutoBuy(){
		if(getSkillLevel("3.1")>0){
			buyCheapestAvailableUpgrade();
		}
	}
};

const prestigeDragHandle=document.getElementById("prestige-title");
let prestigeDragOffset=null;
prestigeDragHandle.addEventListener("pointerdown",event=>{
	if(event.button!==0){
		return;
	}
	const rect=prestigeView.getBoundingClientRect();
	prestigeView.style.left=rect.left+"px";
	prestigeView.style.top=rect.top+"px";
	prestigeView.style.transform="none";
	prestigeDragOffset={x:event.clientX-rect.left,y:event.clientY-rect.top};
	prestigeDragHandle.setPointerCapture(event.pointerId);
});
prestigeDragHandle.addEventListener("pointermove",event=>{
	if(!prestigeDragOffset||!prestigeDragHandle.hasPointerCapture(event.pointerId)){
		return;
	}
	movePrestigeWindow(event.clientX-prestigeDragOffset.x,event.clientY-prestigeDragOffset.y);
});
prestigeDragHandle.addEventListener("pointerup",event=>{
	if(!prestigeDragHandle.hasPointerCapture(event.pointerId)){
		return;
	}
	prestigeDragHandle.releasePointerCapture(event.pointerId);
	prestigeDragOffset=null;
	savePrestigeGame();
});
prestigeDragHandle.addEventListener("keydown",event=>{
	const rect=prestigeView.getBoundingClientRect();
	const step=event.shiftKey?32:12;
	const moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
	const move=moves[event.key];
	if(!move){
		return;
	}
	event.preventDefault();
	movePrestigeWindow(rect.left+move[0],rect.top+move[1]);
	savePrestigeGame();
});
window.addEventListener("resize",()=>{
	if(!prestigeView.hidden){
		clampPrestigeWindowPosition();
	}
});

document.getElementById("prestige-button").addEventListener("click",prestige);
document.getElementById("push-button").addEventListener("click",push);
viewToggle.addEventListener("click",()=>{
	const showingPrestige=!prestigeView.hidden;
	prestigeView.hidden=showingPrestige;
	viewToggle.textContent=showingPrestige?"転生画面":"ゲームに戻る";
	viewToggle.setAttribute("aria-expanded",String(!showingPrestige));
	if(!showingPrestige){
		clampPrestigeWindowPosition();
		savePrestigeGame();
	}
});
document.getElementById("gift-code-form").addEventListener("submit",event=>{
	event.preventDefault();
	const input=document.getElementById("gift-code-input");
	if(input.value.trim().toLowerCase()!==developerGiftCode){
		document.getElementById("gift-code-status").textContent="コードが違います。";
		return;
	}
	window.Prestige.setDeveloperMode(true);
	document.getElementById("gift-code-status").textContent="開発者モードを解放しました。";
	input.value="";
});
developerToggle.addEventListener("click",()=>{
	const opening=developerPanel.hidden;
	if(opening){
		renderDeveloperPanel();
	}
	developerPanel.hidden=!opening;
	developerToggle.setAttribute("aria-expanded",String(opening));
});
document.getElementById("developer-close").addEventListener("click",()=>{
	developerPanel.hidden=true;
	developerToggle.setAttribute("aria-expanded","false");
});
document.getElementById("developer-reset").addEventListener("click",resetAllGameData);
window.addEventListener("beforeunload",savePrestigeGame);
loadPrestigeGame();
createSkillTree();
createChallengeCards();
window.Game.updateDisplays();
window.Game.start();
