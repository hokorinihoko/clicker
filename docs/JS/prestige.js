let prestigePoints=0;
let prestigeCount=0;

const prestigeSaveKey="luminousClickerPrestigeSave";
const skillDefinitions=[
	{id:"1",name:"1",description:"全獲得量の指数 +0.1",cost:1,maxLevel:100,x:410,y:440},
	{id:"2.1",name:"2.1",description:"全獲得量 +1倍",cost:1,requires:"1",x:410,y:215},
	{id:"2.2",name:"2.2",description:"転生ポイント獲得数 +1",cost:2,requires:"1",x:605,y:327},
	{id:"2.3",name:"2.3",description:"最安アップグレードを自動購入",cost:5,requires:"1",x:605,y:552},
	{id:"2.4",name:"2.4",description:"Energy上限を 1e12 に拡張",cost:10,requires:"1",x:410,y:665},
	{id:"2.5",name:"2.5",description:"転生後、CPを+10購入済みで開始",cost:10,requires:"1",x:215,y:552},
	{id:"2.6",name:"2.6",description:"チャレンジ解放",cost:50,requires:"1",x:215,y:327},
	{id:"3.1",name:"3.1",description:"全獲得量 +1倍",cost:2,requires:"2.1",x:337,y:89},
	{id:"3.2",name:"3.2",description:"全獲得量 +3倍",cost:5,requires:"2.1",x:483,y:89},
	{id:"3.3",name:"3.3",description:"転生ポイント獲得数 +1",cost:3,requires:"2.2",x:744,y:247},
	{id:"3.4",name:"3.4",description:"Energy上限を 1e15 に拡張",cost:50,requires:"2.4",x:410,y:810},
	{id:"3.5",name:"3.5",description:"転生後、CPをさらに+10購入済み",cost:10,requires:"2.5",x:143,y:678},
	{id:"3.6",name:"3.6",description:"転生後、クリック倍率を+10購入済み",cost:15,requires:"2.5",x:70,y:552}
];
skillDefinitions.forEach(skill=>{
	if(skill.maxLevel===undefined){
		skill.maxLevel=1;
	}
});

const skillLevels=Object.fromEntries(skillDefinitions.map(skill=>[skill.id,0]));
const skillEdges=[
	["1","2.1"],["1","2.2"],["1","2.3"],["1","2.4"],["1","2.5"],["1","2.6"],
	["2.1","3.1"],["2.1","3.2"],["2.2","3.3"],["2.4","3.4"],["2.5","3.5"],["2.5","3.6"]
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
}

function getEnergyCap(){
	if(getSkillLevel("3.4")>0){
		return 1e15;
	}
	if(getSkillLevel("2.4")>0){
		return 1e12;
	}
	return 1e10;
}

function getGlobalExponent(){
	return 1+getSkillLevel("1")*0.1;
}

function getGlobalMultiplier(){
	return 1+
		Number(getSkillLevel("2.1")>0)+
		Number(getSkillLevel("3.1")>0)+
		(getSkillLevel("3.2")>0?3:0);
}

function getPrestigePointMultiplier(){
	return 1+Number(getSkillLevel("2.2")>0)+Number(getSkillLevel("3.3")>0);
}

function skillCost(skill){
	return skill.id==="1"?2**getSkillLevel(skill.id):skill.cost;
}

function createSkillTree(){
	const svg=document.getElementById("skill-tree-lines");
	for(const [parentId,childId] of skillEdges){
		const parent=skillDefinitions.find(skill=>skill.id===parentId);
		const child=skillDefinitions.find(skill=>skill.id===childId);
		const line=document.createElementNS("http://www.w3.org/2000/svg","line");
		line.setAttribute("x1",parent.x);
		line.setAttribute("y1",parent.y);
		line.setAttribute("x2",child.x);
		line.setAttribute("y2",child.y);
		line.dataset.child=childId;
		svg.appendChild(line);
	}

	const container=document.getElementById("skill-tree-nodes");
	for(const skill of skillDefinitions){
		const button=document.createElement("button");
		button.className="skill-node";
		button.type="button";
		button.style.left=skill.x+"px";
		button.style.top=skill.y+"px";

		const name=document.createElement("span");
		name.className="skill-node-name";
		name.textContent=skill.name;
		const description=document.createElement("span");
		description.className="skill-node-description";
		description.textContent=skill.description;
		const cost=document.createElement("span");
		cost.className="skill-node-cost";

		button.append(name,description,cost);
		button.addEventListener("click",()=>purchaseSkill(skill));
		container.appendChild(button);
		skillButtons.set(skill.id,{button,cost});
	}
}

function isSkillAvailable(skill){
	return !skill.requires||getSkillLevel(skill.requires)>0;
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
		button.disabled=Boolean(skill.development)||!prerequisiteMet||isMaxed||prestigePoints<cost;

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
	section.hidden=getSkillLevel("2.6")===0;
	if(section.hidden){
		return;
	}

	const status=document.getElementById("challenge-status");
	if(activeChallenge!==null){
		const active=challengeDefinitions.find(challenge=>challenge.id===activeChallenge);
		status.textContent=active.name+"に挑戦中。デバフを維持したまま転生するとクリアです。";
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
		button.disabled=activeChallenge!==null||!unlocked;
		state.textContent=active
			? "挑戦中"
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
	document.getElementById("prestige-points").textContent="転生ポイント: "+window.Game.formatNumber(prestigePoints)+" (転生 "+window.Game.formatNumber(prestigeCount)+"回)";
	document.getElementById("energy-cap").textContent="Energy上限: "+window.Game.formatNumber(energyCap);

	const reward=Math.floor(game.energy/1e10)*getPrestigePointMultiplier();
	const button=document.getElementById("prestige-button");
	button.hidden=game.energy<energyCap;
	button.textContent="転生する ("+window.Game.formatNumber(reward)+" pt)";
	document.getElementById("prestige-reward").textContent="転生獲得: "+window.Game.formatNumber(reward)+" pt";
	document.getElementById("auto-buy-status").textContent=getSkillLevel("2.3")>0
		? "自動購入: 有効 (購入可能な最安アップグレードから購入)"
		: "自動購入: 未解放";
	updateSkillTree();
	updateChallengeDisplays();
}

function savePrestigeGame(){
	const game=window.Game;
	const save={
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

		if(save.skillLevels&&typeof save.skillLevels==="object"){
			for(const skill of skillDefinitions){
				const level=save.skillLevels[skill.id];
				skillLevels[skill.id]=Number.isInteger(level)&&level>=0
					? Math.min(level,skill.maxLevel)
					: 0;
			}
		}
		if(Array.isArray(save.clearedChallenges)){
			clearedChallenges=new Set(save.clearedChallenges.filter(id=>Number.isInteger(id)&&id>=1&&id<=challengeDefinitions.length));
		}
		if(Number.isInteger(save.activeChallenge)&&save.activeChallenge>=1&&save.activeChallenge<=challengeDefinitions.length&&getSkillLevel("2.6")>0){
			activeChallenge=save.activeChallenge;
		}

		for(const key of ["clickBase","clickMultiplier","clickExponent","autoBase","autoMultiplier","autoExponent","autoInterval"]){
			if(Number.isFinite(save[key])&&save[key]>=0){
				window.Game[key]=save[key];
			}
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
			.filter(item=>!game.isUpgradeBlocked(item.index)&&game.energy>=game.getUpgradePrice(item.upgrade)&&(
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
	if(skill.id==="2.3"){
		buyCheapestAvailableUpgrade();
	}
	updatePrestigeDisplays();
	savePrestigeGame();
	if(window.Achievements){
		window.Achievements.recordSkill(skill.id);
	}
}

function startChallenge(challengeId){
	if(getSkillLevel("2.6")===0||activeChallenge!==null||!Number.isInteger(challengeId)||!isChallengeUnlocked(challengeId)){
		return;
	}
	activeChallenge=challengeId;
	window.Game.resetRun();
	window.Game.updateDisplays();
	savePrestigeGame();
}

function prestige(){
	const game=window.Game;
	const energyCap=getEnergyCap();
	if(game.energy<energyCap){
		return;
	}
	const pointsEarned=Math.floor(game.energy/1e10)*getPrestigePointMultiplier();
	if(pointsEarned<=0){
		return;
	}
	const completedChallenge=activeChallenge;

	prestigePoints+=pointsEarned;
	prestigeCount++;
	if(completedChallenge!==null){
		clearedChallenges.add(completedChallenge);
		activeChallenge=null;
	}
	game.resetRun();
	const freeClickBuys=10*Number(getSkillLevel("2.5")>0)+10*Number(getSkillLevel("3.5")>0);
	for(let index=0;index<freeClickBuys;index++){
		game.buyUpgrade(0,true);
	}
	if(getSkillLevel("3.6")>0){
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

window.Prestige={
	getEnergyCap,
	getGlobalExponent,
	getGlobalMultiplier,
	getSkillLevel,
	getPrestigePointMultiplier,
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
		if(getSkillLevel("2.3")>0){
			buyCheapestAvailableUpgrade();
		}
	}
};

document.getElementById("prestige-button").addEventListener("click",prestige);
window.addEventListener("beforeunload",savePrestigeGame);
loadPrestigeGame();
createSkillTree();
createChallengeCards();
window.Game.updateDisplays();
window.Game.start();
