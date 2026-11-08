const achievementSaveKey="luminousClickerAchievements";
const achievementStats={
    clicks:0,
    energyEarned:0,
    upgradesBought:0,
    prestiges:0,
    prestigePointsEarned:0,
    skillsBought:0,
    challengesCleared:0
};
const unlockedAchievements=new Set();
const clearedChallengeAchievements=new Set();
const achievementDefinitions=[
    {id:"click-1",name:"起動",description:"初めてCOREをクリックする",goal:1,progress:()=>achievementStats.clicks},
    {id:"click-2",name:"連打の始まり",description:"COREを10回クリックする",goal:10,progress:()=>achievementStats.clicks},
    {id:"click-3",name:"神秘的クリック",description:"COREを100回クリックする",goal:100,progress:()=>achievementStats.clicks},
    {id:"click-4",name:"連打パワー",description:"COREを1,000回クリックする",goal:1000,progress:()=>achievementStats.clicks},
    {id:"click-5",name:"腱鞘炎不可避",description:"COREを10,000回クリックする",goal:10000,progress:()=>achievementStats.clicks},
    {id:"click-6",name:"クリック...",description:"COREを100,000回クリックする",goal:100000,progress:()=>achievementStats.clicks},
    {id:"click-7",name:"クリック中毒",description:"COREを1e6回クリックする",goal:1e6,progress:()=>achievementStats.clicks},
    {id:"click-8",name:"クリック王決定",description:"COREを1e7回クリックする",goal:1e7,progress:()=>achievementStats.clicks},
    {id:"click-9",name:"クリッククリッククリック...",description:"COREを1e8回クリックする",goal:1e8,progress:()=>achievementStats.clicks},
    {id:"click-10",name:"マウス<解せぬ",description:"COREを1e9回クリックする",goal:1e9,progress:()=>achievementStats.clicks},
    {id:"click-11",name:"転生不可避",description:"COREを1e10回クリックする",goal:1e10,progress:()=>achievementStats.clicks},

    {id:"energy-1",name:"Energy",description:"累計で1Energy獲得する",goal:1,progress:()=>achievementStats.energyEarned},
    {id:"energy-2",name:"Energyの目覚め",description:"累計で10Energy獲得する",goal:10,progress:()=>achievementStats.energyEarned},
    {id:"energy-3",name:"100Energy",description:"累計で100Energy獲得する",goal:100,progress:()=>achievementStats.energyEarned},
    {id:"energy-4",name:"1KEnergy",description:"累計で1,000Energy獲得する",goal:1000,progress:()=>achievementStats.energyEarned},
    {id:"energy-5",name:"Energyがいっぱい",description:"累計で10,000Energy獲得する",goal:10000,progress:()=>achievementStats.energyEarned},
    {id:"energy-6",name:"Energyの海",description:"累計で100,000Energy獲得する",goal:100000,progress:()=>achievementStats.energyEarned},
    {id:"energy-7",name:"永遠のEnergy",description:"累計で1e6Energy獲得する",goal:1e6,progress:()=>achievementStats.energyEarned},
    {id:"energy-8",name:"使い切れないEnergy",description:"累計で1e7Energy獲得する",goal:1e7,progress:()=>achievementStats.energyEarned},
    {id:"energy-9",name:"Energyの膨張",description:"累計で1E8Energy獲得する",goal:1e8,progress:()=>achievementStats.energyEarned},
    {id:"energy-10",name:"B達成",description:"累計で1e9Energy獲得する",goal:1e9,progress:()=>achievementStats.energyEarned},
    {id:"energy-11",name:"転生開始",description:"累計で1e10Energy獲得する",goal:1e10,progress:()=>achievementStats.energyEarned},
    {id:"energy-12",name:"限界突破",description:"累計で1e11Energy獲得する",goal:1e11,progress:()=>achievementStats.energyEarned},
    {id:"energy-13",name:"2度目の天井",description:"累計で1e12Energy獲得する",goal:1e12,progress:()=>achievementStats.energyEarned},
    {id:"energy-14",name:"T達成",description:"累計で1e13Energy獲得する",goal:1e13,progress:()=>achievementStats.energyEarned},

    {id:"auto-1",name:"オート開発",description:"オートを1にする",goal:1,progress:()=>achievementStats.auto},
    {id:"auto-2",name:"手作業のほうが早い",description:"オートを10にする",goal:10,progress:()=>achievementStats.auto},
    {id:"auto-3",name:"簡易的放置",description:"オートを100にする",goal:100,progress:()=>achievementStats.auto},
    {id:"auto-4",name:"オートのパワー",description:"オートを1,000にする",goal:1000,progress:()=>achievementStats.auto},
    {id:"auto-5",name:"インフレ中",description:"オートを10,000にする",goal:10000,progress:()=>achievementStats.auto},
    {id:"auto-6",name:"工場",description:"オートを100,000にする",goal:100000,progress:()=>achievementStats.auto},
    {id:"auto-7",name:"指数オート",description:"オートを1e6にする",goal:1e6,progress:()=>achievementStats.auto},
    {id:"auto-8",name:"手作業の負け",description:"オートを1e7にする",goal:1e7,progress:()=>achievementStats.auto},
    {id:"auto-9",name:"作業は放置へ",description:"オートを1e8にする",goal:1e8,progress:()=>achievementStats.auto},
    {id:"auto-10",name:"自主的休暇",description:"オートを1e9にする",goal:1e9,progress:()=>achievementStats.auto},
    {id:"auto-11",name:"瞬間転生",description:"オートを1e10にする",goal:1e10,progress:()=>achievementStats.auto},

    {id:"first-upgrade",name:"強化開始",description:"アップグレードを購入する",goal:1,progress:()=>achievementStats.upgradesBought},
    {id:"upgrade-50",name:"積み重ね",description:"アップグレードを累計50回購入する",goal:50,progress:()=>achievementStats.upgradesBought},
 
    {id:"first-prestige",name:"新たな始まり",description:"初めて転生する",goal:1,progress:()=>achievementStats.prestiges},
    {id:"points-100",name:"転生の蓄積",description:"転生ポイントを累計100獲得する",goal:100,progress:()=>achievementStats.prestigePointsEarned},
    {id:"challenge-1",name:"初チャレンジ",description:"チャレンジを1つクリアする",goal:1,progress:()=>achievementStats.challengesCleared},
    {id:"challenge-5",name:"挑戦者",description:"チャレンジを5つクリアする",goal:5,progress:()=>achievementStats.challengesCleared},
    {id:"challenge-10",name:"完全制覇",description:"全10チャレンジをクリアする",goal:10,progress:()=>achievementStats.challengesCleared},

    {id:"first-skill",name:"知識の解放",description:"スキルを1つ取得する",goal:1,progress:()=>achievementStats.skillsBought},
    {id:"root-skill-10",name:"根を伸ばす",description:"スキル1を10回取得する",goal:10,progress:()=>window.Prestige.getSkillLevel("1")},

    {id:"cap-1e12",name:"限界突破",description:"Energy上限を1e12にする",goal:1e12,progress:()=>window.Prestige.getEnergyCap()},
    {id:"cap-1e15",name:"星系の果て",description:"Energy上限を1e15にする",goal:1e15,progress:()=>window.Prestige.getEnergyCap()},

    {id:"auto-buy",name:"自動化",description:"スキル2.3を取得する",goal:1,progress:()=>window.Prestige.getSkillLevel("2.3")},

    {id:"Enter",name:"Enter長押し",description:"cps15を超える",goal:15,progress:()=>achievementStats.a},
    {id:"クリックやめます。",name:"",description:"クリックせずに転生する",goal:0,progress:()=>achievementStats.a}


];

function saveAchievements(){
    try{
        localStorage.setItem(achievementSaveKey,JSON.stringify({
            stats:achievementStats,
            unlocked:Array.from(unlockedAchievements),
            clearedChallenges:Array.from(clearedChallengeAchievements)
        }));
    }catch(error){
        console.warn("実績を保存できませんでした",error);
    }
}

function loadAchievements(){
    try{
        const save=JSON.parse(localStorage.getItem(achievementSaveKey));
        if(!save||typeof save!=="object"){
            return;
        }
        if(save.stats&&typeof save.stats==="object"){
            for(const key of Object.keys(achievementStats)){
                const value=save.stats[key];
                if(Number.isFinite(value)&&value>=0){
                    achievementStats[key]=value;
                }
            }
        }
        if(Array.isArray(save.unlocked)){
            for(const id of save.unlocked){
                if(achievementDefinitions.some(achievement=>achievement.id===id)){
                    unlockedAchievements.add(id);
                }
            }
        }
        if(Array.isArray(save.clearedChallenges)){
            for(const challengeId of save.clearedChallenges){
                if(Number.isInteger(challengeId)&&challengeId>=1&&challengeId<=10){
                    clearedChallengeAchievements.add(challengeId);
                }
            }
            achievementStats.challengesCleared=clearedChallengeAchievements.size;
        }
    }catch(error){
        console.warn("実績を読み込めませんでした",error);
    }
}

function updateAchievements(){
    const list=document.getElementById("achievement-list");
    let newlyUnlocked=false;
    for(const achievement of achievementDefinitions){
        if(!unlockedAchievements.has(achievement.id)&&achievement.progress()>=achievement.goal){
            unlockedAchievements.add(achievement.id);
            newlyUnlocked=true;
        }
    }

    list.replaceChildren();
    for(const achievement of achievementDefinitions){
        const unlocked=unlockedAchievements.has(achievement.id);
        const card=document.createElement("article");
        card.className="achievement-card "+(unlocked?"is-unlocked":"is-locked");
        const title=document.createElement("h3");
        title.className="achievement-name";
        title.textContent=unlocked?achievement.name:"???";
        const description=document.createElement("p");
        description.className="achievement-description";
        description.textContent=unlocked?achievement.description:"未解除の実績";
        const progress=document.createElement("p");
        progress.className="achievement-condition";
        progress.textContent=unlocked
            ? "解除済み"
            : window.Game.formatNumber(Math.min(achievement.progress(),achievement.goal))+" / "+window.Game.formatNumber(achievement.goal);
        card.append(title,description,progress);
        list.appendChild(card);
    }

    const unlockedCount=unlockedAchievements.size;
    document.getElementById("achievement-progress").textContent="解除済み: "+unlockedCount+" / "+achievementDefinitions.length;
    if(newlyUnlocked){
        saveAchievements();
    }
}

function recordClick(){
    achievementStats.clicks++;
    updateAchievements();
    saveAchievements();
}

function recordEnergy(amount){
    achievementStats.energyEarned+=amount;
    updateAchievements();
    saveAchievements();
}

function recordUpgrade(){
    achievementStats.upgradesBought++;
    updateAchievements();
    saveAchievements();
}

function recordPrestige(points){
    achievementStats.prestiges++;
    achievementStats.prestigePointsEarned+=points;
    updateAchievements();
    saveAchievements();
}

function recordSkill(){
    achievementStats.skillsBought++;
    updateAchievements();
    saveAchievements();
}

function recordChallengeClear(challengeId){
    if(!Number.isInteger(challengeId)||challengeId<1||challengeId>10||clearedChallengeAchievements.has(challengeId)){
        return;
    }
    clearedChallengeAchievements.add(challengeId);
    achievementStats.challengesCleared=clearedChallengeAchievements.size;
    updateAchievements();
    saveAchievements();
}

window.Achievements={
    refresh:updateAchievements,
    recordClick,
    recordEnergy,
    recordUpgrade,
    recordPrestige,
    recordSkill,
    recordChallengeClear
};

loadAchievements();
updateAchievements();