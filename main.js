// ================= 配置区域：多卡池 =================
const APP_VERSION =
  (document.currentScript &&
    new URL(document.currentScript.src, window.location.href).searchParams.get("v")) ||
  "dev";

const COMMON_MILESTONE_PULLS = [
  20, 40, 60, 80, 100, 120, 140, 160, 180,
  200, 230, 260, 290, 300, 350, 400, 450,
  500, 550, 600, 650, 700, 750, 800, 850,
];

function createMilestones(labels) {
  return COMMON_MILESTONE_PULLS.map((pulls) => {
    if (pulls === 200) {
      return { pulls, type: "empowered_random", label: labels.empoweredRandom };
    }
    if (pulls === 500 || pulls === 850) {
      return { pulls, type: "empowered_select", label: labels.empoweredSelect };
    }

    const chance = [60, 100, 260, 350, 450, 600, 700, 800].includes(pulls)
      ? 0.3
      : 0.1;
    return {
      pulls,
      type: "empowered_chance",
      chance,
      label: chance === 0.3 ? labels.chance30 : labels.chance10,
    };
  });
}

function createDefenseGiftMilestones() {
  const genericLabel = "5星签约 10%含钢铁防线史诗";
  const rows = [
    { pulls: 30, targetName: "巴雷西", label: genericLabel },
    { pulls: 60, targetName: "巴雷西", label: genericLabel },
    { pulls: 90, targetName: "布冯", label: "5星签约 10%含吉安路易吉·布冯" },
    { pulls: 120, targetName: "巴雷西", label: genericLabel },
    { pulls: 150, targetName: "巴雷西", label: genericLabel },
    { pulls: 180, targetName: "科库", label: "5星签约 10%含菲利普·科库" },
    { pulls: 210, targetName: "巴雷西", label: genericLabel },
    { pulls: 240, targetName: "巴雷西", label: genericLabel },
    { pulls: 270, targetName: "布冯", label: "5星签约 10%含吉安路易吉·布冯" },
    { pulls: 300, targetName: "巴雷西", label: genericLabel },
    { pulls: 330, targetName: "巴雷西", label: genericLabel },
    { pulls: 360, targetName: "科库", label: "5星签约 10%含菲利普·科库" },
    { pulls: 390, targetName: "巴雷西", label: genericLabel },
    { pulls: 420, targetName: "巴雷西", label: genericLabel },
  ];
  return rows.map((row) => ({
    pulls: row.pulls,
    type: "exchange_target_chance",
    chance: 0.1,
    targetName: row.targetName,
    label: row.label,
  }));
}

function createCarnivalPool(config) {
  return {
    poolType: "carnival_gift",
    progressionType: "milestone",
    ...config,
  };
}

function showSyncWarning(message) {
  const id = "appSyncWarning";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "10px";
    el.style.transform = "translateX(-50%)";
    el.style.zIndex = "9999";
    el.style.padding = "8px 12px";
    el.style.borderRadius = "8px";
    el.style.border = "1px solid rgba(252, 211, 77, 0.7)";
    el.style.background = "rgba(120, 53, 15, 0.95)";
    el.style.color = "#fde68a";
    el.style.fontSize = "12px";
    el.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.35)";
    document.body.appendChild(el);
  }
  el.textContent = message;
}

function checkAppSync() {
  const metaVersion = document
    .querySelector('meta[name="app-version"]')
    ?.getAttribute("content");
  const versionText = document.getElementById("appVersionText");
  const versionValue = document.getElementById("appVersionValue");
  if (versionText) {
    if (versionValue) {
      versionValue.textContent = metaVersion || APP_VERSION;
    } else {
      versionText.textContent = `版本号：${metaVersion || APP_VERSION}`;
    }
  }
  if (metaVersion && metaVersion !== APP_VERSION) {
    showSyncWarning("检测到网页资源版本未同步，请强制刷新（Ctrl/Cmd + Shift + R）");
    console.warn("[抽卡模拟器] app version mismatch:", {
      html: metaVersion,
      js: APP_VERSION,
    });
  }

  const criticalIds = [
    "poolTypeChoice",
    "poolSwitchChoice",
    "modeSwitchSelect",
    "favEmpoweredTags",
    "chainFavEmpoweredTags",
    "rewardOpenModeSelect",
  ];
  const missing = criticalIds.filter((id) => !document.getElementById(id));
  if (missing.length) {
    showSyncWarning(
      `页面结构不完整（缺少：${missing.join("、")}），请确认 GitHub Pages 已部署最新 index.html`
    );
    console.warn("[抽卡模拟器] missing critical dom ids:", missing);
  }
}

const POOLS = {
  xinzai_jinxiu: createCarnivalPool({
    name: "新载锦绣狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.008 },
      { type: "selected", label: "精选卡", probability: 0.016 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.352 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "姆巴佩",
      "哈兰德",
      "库尔图瓦",
      "多库",
      "图拉姆",
      "巴雷拉",
      "阿劳霍",
      "阿诺德",
    ],
    milestones: createMilestones({
      chance10: "10% 含增能/精选卡券",
      chance30: "30% 含增能/精选卡券",
      empoweredRandom: "随机增能卡必得券",
      empoweredSelect: "增能卡自选券",
    }),
    bonusHitMode: "empowered_or_selected_weighted",
    selectedCardCountForBonus: 16,
  }),
  blue_old_friend: createCarnivalPool({
    name: "蓝衣故人狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "麦克托米奈",
      "马克莱莱",
      "兰帕德",
      "罗德里",
      "若昂佩德罗",
      "卢卡库",
      "马尔穆什",
      "劳尔",
    ],
    milestones: createMilestones({
      chance10: "10% 增能卡券",
      chance30: "30% 增能卡券",
      empoweredRandom: "随机增能卡必得券",
      empoweredSelect: "增能卡自选券",
    }),
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  }),

  ouzhan_fengyan: createCarnivalPool({
    name: "欧战烽烟狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "萨利巴",
      "萨卡",
      "赖斯",
      "博格坎普",
      "麦孔",
      "马特乌斯",
      "萨内蒂",
      "邓弗里斯",
    ],
    milestones: createMilestones({
      chance10: "10% 增能卡券",
      chance30: "30% 增能卡券",
      empoweredRandom: "随机增能卡必得券",
      empoweredSelect: "增能卡自选券",
    }),
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  }),
  dream_midfield_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "梦幻中轴兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "维埃拉",
      "德塞利",
      "卡纳瓦罗",
      "莫伦特斯",
      "居莱尔",
      "德布劳内",
      "法比尼奥",
    ],
    exchangeConfig: {
      specificPlayers: ["维埃拉", "德塞利", "德布劳内"],
      fixedSelect42: "德布劳内",
      select47Players: null, // null 代表 47 徽章可任意自选增能
      hasSkin52: true,
    },
    exchangeSpecificPlayers: ["维埃拉", "德塞利", "德布劳内"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  lucky_drop_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "天降幸运兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "拉姆",
      "亚马尔",
      "科勒",
      "伊涅斯塔",
      "哈维",
      "范布隆克霍斯特",
      "塞尔吉奥",
    ],
    exchangeConfig: {
      specificPlayers: ["拉姆", "亚马尔", "科勒"],
      fixedSelect42: null,
      select47Players: ["拉姆", "亚马尔", "科勒"], // 47 徽章仅可自选主菜
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["拉姆", "亚马尔", "科勒"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  rock_blade_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "磐石利刃兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: ["贝肯鲍尔", "苏亚雷斯", "内斯塔", "比利亚", "弗兰", "特维斯", "西多夫"],
    exchangeConfig: {
      specificPlayers: ["贝肯鲍尔", "苏亚雷斯", "内斯塔"],
      fixedSelect42: null,
      select47Players: ["贝肯鲍尔", "苏亚雷斯", "内斯塔"], // 47 徽章仅可自选主菜
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["贝肯鲍尔", "苏亚雷斯", "内斯塔"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  pitch_maestro_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "球场主宰兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: ["马克莱莱", "欧文", "皮克", "伊涅斯塔", "罗纳尔迪尼奥", "托雷斯", "范博梅尔"],
    exchangeConfig: {
      specificPlayers: ["马克莱莱", "皮克", "欧文"],
      fixedSelect42: null,
      select47Players: ["马克莱莱", "皮克", "欧文"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["马克莱莱", "皮克", "欧文"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  genius_chain_bundle: {
    poolType: "chain_bundle",
    progressionType: "chain_tier",
    name: "天纵奇才连锁礼包",
    mainPoolName: "天纵奇才",
    sidePoolName: "无畏斗士",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "贝斯特",
      "帕尔默",
      "k77",
      "奥谢",
      "罗布森",
      "奥多",
      "埃尔文",
      "拜亚",
      "贝林厄姆",
      "伊萨克",
    ],
    sidePoolCards: ["内托", "罗杰斯", "拉菲尼亚", "亨德森"],
    chainTiers: [
      { tier: 1, costGold: 1680, rewards: ["main_10", "main_10"] },
      { tier: 2, costGold: 4400, rewards: ["main_30", "main_30"] },
      { tier: 3, costGold: 6800, rewards: ["side_box"] },
      { tier: 4, costGold: 6800, rewards: ["main_random"] },
      { tier: 5, costGold: 11800, rewards: ["main_random", "side_box"] },
      { tier: 6, costGold: 9800, rewards: ["main_random", "side_box"] },
      { tier: 7, costGold: 8800, rewards: ["main_select", "side_box"] },
    ],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  spring_reunion_chain_bundle: {
    poolType: "chain_bundle",
    progressionType: "chain_tier",
    name: "新春团圆连锁礼包",
    mainPoolName: "新春团圆第一弹",
    sidePoolName: "新春团圆第二弹",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    chainSubPools: {
      first: {
        name: "新春团圆第一弹",
        cards: [
          "克鲁伊夫",
          "亚亚图雷",
          "托蒂",
          "济科",
          "卡洛斯",
          "阿扎尔",
          "皮尔洛",
          "瓜迪奥拉",
          "科尔",
          "范尼斯特鲁伊",
        ],
      },
      second: {
        name: "新春团圆第二弹",
        cards: [
          "李金羽",
          "克鲁伊夫",
          "亚亚图雷",
          "托蒂",
          "阿扎尔",
          "皮尔洛",
          "范尼斯特鲁伊",
        ],
      },
      third: {
        name: "新春团圆第三弹",
        cards: [
          "济科",
          "克鲁伊夫",
          "亚亚图雷",
          "卡洛斯",
          "阿扎尔",
          "瓜迪奥拉",
          "科尔",
        ],
      },
    },
    empoweredCards: [
      "克鲁伊夫",
      "亚亚图雷",
      "托蒂",
      "济科",
      "卡洛斯",
      "阿扎尔",
      "皮尔洛",
      "瓜迪奥拉",
      "科尔",
      "范尼斯特鲁伊",
    ],
    sidePoolCards: [],
    chainTiers: [
      { tier: 1, costGold: 1000, rewards: ["first_10", "first_10"] },
      { tier: 2, costGold: 4400, rewards: ["first_30", "first_30"] },
      { tier: 3, costGold: 6800, rewards: ["first_random"] },
      { tier: 4, costGold: 6800, rewards: ["second_random"] },
      { tier: 5, costGold: 11800, rewards: ["first_random", "second_random"] },
      { tier: 6, costGold: 9800, rewards: ["first_random", "third_random"] },
      { tier: 7, costGold: 8800, rewards: ["first_random", "first_select"] },
    ],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  defense_guardians_gift: {
    poolType: "accumulated_gift",
    progressionType: "milestone",
    name: "防守悍将累抽赠礼",
    progressCap: 420,
    poolConfig: [
      { type: "empowered", label: "史诗球员", probability: 0.005 },
      { type: "star5", label: "5星普通球员", probability: 0.024 },
      { type: "star4", label: "4星普通球员", probability: 0.371 },
      { type: "star3", label: "3星普通球员", probability: 0.6 },
    ],
    empoweredCards: ["布冯", "德尔皮耶罗", "科库", "贝隆", "巴雷西", "埃托奥", "加西亚"],
    milestones: createDefenseGiftMilestones(),
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  s9_season_inherit: {
    poolType: "season_carryover",
    progressionType: "season_inherit",
    name: "S9赛季累抽继承",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.001 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.375 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "内马尔",
      "内斯塔",
      "德罗巴",
      "菲戈",
      "伊涅斯塔",
      "皮克",
      "里杰卡尔德",
      "范巴斯滕",
      "古利特",
      "皮尔洛",
      "亚马尔",
      "梅西",
    ],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  oriental_dragon_liyi: {
    poolType: "accumulated_guarantee",
    progressionType: "accumulated_target",
    displayName: "东方巨龙累抽必得",
    switchGroup: "oriental_dragon_accumulated",
    switchButtonLabel: "李毅",
    name: "东方巨龙累抽必得·李毅",
    poolConfig: [
      { type: "empowered", label: "定向球员", probability: 0.001 },
      { type: "star5", label: "5星普通球员", probability: 0.024 },
      { type: "star4", label: "4星球员", probability: 0.375 },
      { type: "star3", label: "3星球员", probability: 0.6 },
    ],
    empoweredCards: ["李毅"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
    accumulatedGuaranteeConfig: {
      guaranteePulls: 160,
      targetName: "李毅",
      boosts: [
        { pulls: 20, multiplier: 3 },
        { pulls: 60, multiplier: 4 },
        { pulls: 80, multiplier: 9 },
        { pulls: 100, multiplier: 11 },
        { pulls: 120, multiplier: 16 },
        { pulls: 140, multiplier: 51 },
      ],
    },
  },
  oriental_dragon_fengxiaoting: {
    poolType: "accumulated_guarantee",
    progressionType: "accumulated_target",
    displayName: "东方巨龙累抽必得",
    switchGroup: "oriental_dragon_accumulated",
    switchButtonLabel: "冯潇霆",
    name: "东方巨龙累抽必得·冯潇霆",
    poolConfig: [
      { type: "empowered", label: "定向球员", probability: 0.001 },
      { type: "star5", label: "5星普通球员", probability: 0.024 },
      { type: "star4", label: "4星球员", probability: 0.375 },
      { type: "star3", label: "3星球员", probability: 0.6 },
    ],
    empoweredCards: ["冯潇霆"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
    accumulatedGuaranteeConfig: {
      guaranteePulls: 160,
      targetName: "冯潇霆",
      boosts: [
        { pulls: 20, multiplier: 3 },
        { pulls: 60, multiplier: 4 },
        { pulls: 80, multiplier: 9 },
        { pulls: 100, multiplier: 11 },
        { pulls: 120, multiplier: 16 },
        { pulls: 140, multiplier: 51 },
      ],
    },
  },
};

const POOL_KEYS = Object.keys(POOLS);
let activePoolKey =
  (POOLS.defense_guardians_gift && "defense_guardians_gift") ||
  (POOLS.pitch_maestro_exchange && "pitch_maestro_exchange") ||
  (POOLS.rock_blade_exchange && "rock_blade_exchange") ||
  (POOLS.spring_reunion_chain_bundle && "spring_reunion_chain_bundle") ||
  POOL_KEYS[POOL_KEYS.length - 1] ||
  "xinzai_jinxiu";
let activeModeKey = "unlimited";

const POOL_TYPE_LABELS = {
  carnival_gift: "狂欢赠礼",
  accumulated_gift: "累抽赠礼",
  exchange_guarantee: "兑换保底",
  chain_bundle: "连锁礼包",
  season_carryover: "赛季累抽继承",
  accumulated_guarantee: "累抽必得",
};

const POOL_CINEMATIC_ASSET_FOLDERS = {
  xinzai_jinxiu: ["assets/新载锦绣"],
  blue_old_friend: ["assets/蓝衣故人"],
  ouzhan_fengyan: ["assets/欧战烽烟"],
  dream_midfield_exchange: ["assets/梦幻中轴"],
  lucky_drop_exchange: ["assets/天降幸运"],
  rock_blade_exchange: ["assets/磐石利刃"],
  pitch_maestro_exchange: ["assets/球场主宰"],
  genius_chain_bundle: ["assets/天纵奇才", "assets/天纵奇才-无畏斗士"],
  spring_reunion_chain_bundle: ["assets/新春团圆"],
  defense_guardians_gift: ["assets/防守悍将"],
  s9_season_inherit: ["assets/S9赛季累抽继承"],
  oriental_dragon_liyi: ["assets/东方巨龙"],
  oriental_dragon_fengxiaoting: ["assets/东方巨龙"],
};

const POOL_PLAYER_META = {
  xinzai_jinxiu: {
    哈兰德: { type: "ST", position: "中锋" },
    姆巴佩: { type: "ST", position: "中锋" },
    阿劳霍: { type: "ST", position: "中后卫" },
    阿诺德: { type: "ST", position: "右后卫" },
    巴雷拉: { type: "ST", position: "后腰" },
    多库: { type: "ST", position: "左边锋" },
    库尔图瓦: { type: "ST", position: "门将" },
    图拉姆: { type: "ST", position: "中锋" },
  },
  blue_old_friend: {
    兰帕德: { type: "史诗", position: "中前卫" },
    劳尔: { type: "史诗", position: "影锋" },
    卢卡库: { type: "ST", position: "中锋" },
    罗德里: { type: "ST", position: "中前卫" },
    马尔穆什: { type: "ST", position: "左前卫" },
    马克莱莱: { type: "史诗", position: "后腰" },
    麦克托米奈: { type: "BT", position: "中前卫" },
    若昂佩德罗: { type: "ST", position: "中锋" },
  },
  ouzhan_fengyan: {
    博格坎普: { type: "史诗", position: "中锋" },
    邓弗里斯: { type: "ST", position: "右前卫" },
    赖斯: { type: "ST", position: "中前卫" },
    马特乌斯: { type: "史诗", position: "前腰" },
    麦孔: { type: "史诗", position: "右后卫" },
    萨卡: { type: "ST", position: "右边锋" },
    萨利巴: { type: "ST", position: "中后卫" },
    萨内蒂: { type: "史诗", position: "左后卫" },
  },
  dream_midfield_exchange: {
    德布劳内: { type: "ST", position: "前腰" },
    德塞利: { type: "史诗", position: "中后卫" },
    法比尼奥: { type: "ST", position: "后腰" },
    居莱尔: { type: "ST", position: "前腰" },
    卡纳瓦罗: { type: "史诗", position: "中后卫" },
    莫伦特斯: { type: "史诗", position: "中锋" },
    维埃拉: { type: "史诗", position: "后腰" },
  },
  lucky_drop_exchange: {
    范布隆克霍斯特: { type: "史诗", position: "左后卫" },
    塞尔吉奥: { type: "史诗", position: "左前卫" },
    科勒: { type: "史诗", position: "中锋" },
    亚马尔: { type: "史诗", position: "右前卫" },
    哈维: { type: "史诗", position: "后腰" },
    拉姆: { type: "史诗", position: "右后卫" },
    伊涅斯塔: { type: "史诗", position: "中前卫" },
  },
  rock_blade_exchange: {
    贝肯鲍尔: { type: "史诗", position: "中后卫" },
    苏亚雷斯: { type: "史诗", position: "中锋" },
    内斯塔: { type: "史诗", position: "中后卫" },
    比利亚: { type: "史诗", position: "中锋" },
    弗兰: { type: "史诗", position: "中锋" },
    特维斯: { type: "史诗", position: "中锋" },
    西多夫: { type: "史诗", position: "后腰" },
  },
  pitch_maestro_exchange: {
    马克莱莱: { type: "史诗", position: "后腰" },
    欧文: { type: "史诗", position: "中锋" },
    皮克: { type: "史诗", position: "中后卫" },
    伊涅斯塔: { type: "史诗", position: "前腰" },
    罗纳尔迪尼奥: { type: "史诗", position: "左边锋" },
    托雷斯: { type: "史诗", position: "中锋" },
    范博梅尔: { type: "史诗", position: "中前卫" },
  },
  genius_chain_bundle: {
    贝斯特: { type: "BT", position: "右边锋" },
    帕尔默: { type: "BT", position: "右前卫" },
    奥多: { type: "史诗", position: "右后卫" },
    k77: { type: "BT", position: "左边锋" },
    奥谢: { type: "史诗", position: "后腰" },
    罗布森: { type: "史诗", position: "中前卫" },
    拜亚: { type: "史诗", position: "门将" },
    埃尔文: { type: "史诗", position: "左后卫" },
    贝林厄姆: { type: "ST", position: "中前卫" },
    伊萨克: { type: "ST", position: "中锋" },
    亨德森: { type: "ST", position: "后腰" },
    拉菲尼亚: { type: "ST", position: "左前卫" },
    罗杰斯: { type: "ST", position: "前腰" },
    内托: { type: "ST", position: "左前卫" },
  },
  spring_reunion_chain_bundle: {
    克鲁伊夫: { type: "史诗", position: "中锋" },
    阿扎尔: { type: "史诗", position: "前腰" },
    托蒂: { type: "史诗", position: "前腰" },
    济科: { type: "史诗", position: "前腰" },
    皮尔洛: { type: "史诗", position: "后腰" },
    亚亚图雷: { type: "史诗", position: "后腰" },
    卡洛斯: { type: "史诗", position: "左后卫" },
    科尔: { type: "史诗", position: "中锋" },
    瓜迪奥拉: { type: "史诗", position: "后腰" },
    范尼斯特鲁伊: { type: "史诗", position: "中锋" },
    李金羽: { type: "BT", position: "中锋" },
  },
  defense_guardians_gift: {
    布冯: { type: "史诗", position: "门将" },
    德尔皮耶罗: { type: "史诗", position: "影锋" },
    科库: { type: "史诗", position: "后腰" },
    贝隆: { type: "史诗", position: "前腰" },
    巴雷西: { type: "史诗", position: "中后卫" },
    埃托奥: { type: "史诗", position: "右前卫" },
    加西亚: { type: "史诗", position: "右边锋" },
  },
  s9_season_inherit: {
    梅西: { type: "史诗", position: "影锋" },
    亚马尔: { type: "史诗", position: "右边锋" },
    德罗巴: { type: "史诗", position: "中锋" },
    范巴斯滕: { type: "史诗", position: "中锋" },
    菲戈: { type: "史诗", position: "右前卫" },
    古利特: { type: "史诗", position: "前腰" },
    里杰卡尔德: { type: "史诗", position: "后腰" },
    内斯塔: { type: "史诗", position: "中后卫" },
    皮尔洛: { type: "史诗", position: "后腰" },
    皮克: { type: "史诗", position: "中后卫" },
    内马尔: { type: "BT", position: "左边锋" },
    伊涅斯塔: { type: "史诗", position: "中前卫" },
  },
  oriental_dragon_liyi: {
    李毅: { type: "BT", position: "中锋" },
  },
  oriental_dragon_fengxiaoting: {
    冯潇霆: { type: "BT", position: "中后卫" },
  },
};

const GOLD_PER_PULL = 100;
const REAL_MODE_KEY = "real";
const SKIN_MODE_STORAGE_KEY = "sim_skin_mode";
const VALID_SKIN_MODES = ["light", "dark"];
let activeSkinKey = "light";

// 每次十连抽是否启用“至少 1 张五星及以上”保底
const TEN_PULL_GUARANTEE_ENABLED = true;

// ================= 内部状态 =================

function createInitialState(empoweredCards) {
  const empoweredCounts = {};
  const empoweredDetails = {};
  empoweredCards.forEach((name) => {
    empoweredCounts[name] = 0;
    empoweredDetails[name] = [];
  });

  return {
    totalPulls: 0,
    stats: {
      empowered: 0,
      selected: 0,
      star5: 0,
      star4: 0,
      star3: 0,
    },
    empoweredCounts,
    empoweredDetails,
    resultsHistory: [],
    rewards: [],
    nextMilestoneIndex: 0,
    chainTierProgress: 0,
    chainSidePoolRemaining: [],
    badges: 0,
    nextBadgeMilestone: 10,
    vieiraSkinCount: 0,
    pendingSelectRewardCount: 0,
    pendingSelectMilestones: [],
    seasonProgressPulls: 0,
    seasonRewardFlags: {
      p20: false,
      p40: false,
      p60: false,
      p80: false,
      p200: false,
      p500: false,
    },
    seasonObtainedEmpoweredNames: {},
    accumulatedGuaranteeGranted: false,
    keyMoments: [],
    resetCount: 0,
  };
}

const stateByModeAndPool = {
  unlimited: {},
  real: {},
};

const realModeMeta = {
  remainingGold: null,
  totalSpentGold: 0,
  totalRechargeRmb: 0,
};
let pendingModeSwitch = null;
let rewardOpenModeSetting = "manual";
let momentReplayTimers = [];

function getCurrentPool() {
  return POOLS[activePoolKey];
}

function getStateForModeAndPool(modeKey, poolKey) {
  if (!stateByModeAndPool[modeKey][poolKey]) {
    stateByModeAndPool[modeKey][poolKey] = createInitialState(
      POOLS[poolKey].empoweredCards
    );
  }
  return stateByModeAndPool[modeKey][poolKey];
}

let state = getStateForModeAndPool(activeModeKey, activePoolKey);

// ================= 工具函数 =================

function randomFromArray(arr) {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function formatPercent(p) {
  return (p * 100).toFixed(1).replace(/\.0$/, "") + "%";
}

function formatExpectedDrawValue(value) {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return Math.round(value).toString();
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function getBaseEmpoweredProbability(poolConfig) {
  return (poolConfig.find((item) => item.type === "empowered") || {}).probability || 0;
}

function getSeasonEmpoweredProbAtProgress(progressAfterDraw) {
  if (progressAfterDraw >= 80) return 0.005;
  if (progressAfterDraw >= 60) return 0.004;
  if (progressAfterDraw >= 40) return 0.003;
  if (progressAfterDraw >= 20) return 0.002;
  return 0.001;
}

function getAccumulatedGuaranteeConfig(pool = getCurrentPool()) {
  return pool.accumulatedGuaranteeConfig || null;
}

function getAccumulatedSwitchPools(pool = getCurrentPool()) {
  const group = pool.switchGroup || "";
  if (!group) return [];
  return POOL_KEYS.filter((key) => POOLS[key].switchGroup === group);
}

function getAccumulatedGuaranteeProgressCap(pool = getCurrentPool()) {
  const cfg = getAccumulatedGuaranteeConfig(pool);
  return Math.max(1, Number(cfg?.guaranteePulls || 160));
}

function getAccumulatedGuaranteeProbByCurrentProgress(currentProgress, pool = getCurrentPool()) {
  const cfg = getAccumulatedGuaranteeConfig(pool);
  const baseProb = getBaseEmpoweredProbability(pool.poolConfig || []);
  if (!cfg) return baseProb;
  const boosts = Array.isArray(cfg.boosts) ? cfg.boosts : [];
  let multiplier = 1;
  boosts.forEach((boost) => {
    if (currentProgress >= Number(boost.pulls || 0)) {
      multiplier = Number(boost.multiplier || 1);
    }
  });
  return clamp01(baseProb * multiplier);
}

function calcAccumulatedGuaranteeSpecificCDF(pool, targetDraws) {
  targetDraws = Math.max(0, Math.floor(Number(targetDraws) || 0));
  if (targetDraws <= 0) return 0;
  const cap = getAccumulatedGuaranteeProgressCap(pool);
  if (targetDraws >= cap) return 1;
  let survive = 1;
  for (let draw = 1; draw <= targetDraws; draw += 1) {
    const p = getAccumulatedGuaranteeProbByCurrentProgress(draw - 1, pool);
    survive *= 1 - p;
  }
  return clamp01(1 - survive);
}

function calcAccumulatedGuaranteeExpected(pool) {
  const cap = getAccumulatedGuaranteeProgressCap(pool);
  const pFn = (progressAfterDraw) =>
    getAccumulatedGuaranteeProbByCurrentProgress(progressAfterDraw - 1, pool);
  const expected = expectedWithDrawAndGuarantee(0, cap, pFn);
  return { any: expected, specific: expected };
}

function calcAccumulatedGuaranteeEmpoweredAtLeastCDF(pool, drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  const cap = getAccumulatedGuaranteeProgressCap(pool);
  const guaranteeAdds = drawCount >= cap ? 1 : 0;
  const needFromDraws = Math.max(0, targetCount - guaranteeAdds);
  const dist = new Array(needFromDraws + 1).fill(0);
  dist[0] = 1;

  const lastDraw = Math.min(drawCount, cap - 1);
  for (let draw = 1; draw <= lastDraw; draw += 1) {
    const p = getAccumulatedGuaranteeProbByCurrentProgress(draw - 1, pool);
    for (let count = needFromDraws - 1; count >= 0; count -= 1) {
      const base = dist[count];
      if (base <= 0) continue;
      dist[count + 1] += base * p;
      dist[count] = base * (1 - p);
    }
  }

  if (drawCount > cap) {
    for (let draw = cap + 1; draw <= drawCount; draw += 1) {
      const p = getAccumulatedGuaranteeProbByCurrentProgress(draw - 1, pool);
      for (let count = needFromDraws - 1; count >= 0; count -= 1) {
        const base = dist[count];
        if (base <= 0) continue;
        dist[count + 1] += base * p;
        dist[count] = base * (1 - p);
      }
    }
  }

  return clamp01(dist[needFromDraws] || 0);
}

function calcAccumulatedGuaranteeSpecificCountAtLeastCDF(pool, drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;
  return calcAccumulatedGuaranteeEmpoweredAtLeastCDF(pool, drawCount, targetCount);
}

function expectedWithProbFn(startProgress, drawLimit, probFn) {
  let expected = 0;
  let survival = 1;
  for (let draw = 1; draw <= drawLimit; draw += 1) {
    expected += survival;
    const p = Math.min(1, Math.max(0, probFn(startProgress + draw)));
    survival *= 1 - p;
    if (survival < 1e-12) break;
  }
  return expected;
}

function expectedFromStepProbs(stepProbs) {
  let expected = 0;
  let survival = 1;
  for (let i = 0; i < stepProbs.length; i += 1) {
    expected += survival;
    const p = Math.min(1, Math.max(0, stepProbs[i]));
    survival *= 1 - p;
  }
  return expected;
}

function expectedFromSeasonCycle(startProgress, stepProbsInCycle) {
  const firstSegment = stepProbsInCycle.slice(startProgress);
  let sumFirst = 0;
  let surviveEndFirst = 1;
  for (let i = 0; i < firstSegment.length; i += 1) {
    sumFirst += surviveEndFirst;
    surviveEndFirst *= 1 - firstSegment[i];
  }

  let sumCycle = 0;
  let surviveCycle = 1;
  for (let i = 0; i < stepProbsInCycle.length; i += 1) {
    sumCycle += surviveCycle;
    surviveCycle *= 1 - stepProbsInCycle[i];
  }

  if (surviveCycle >= 1) {
    return Infinity;
  }

  return sumFirst + (surviveEndFirst * sumCycle) / (1 - surviveCycle);
}

function calcSeasonBaseExpected(startProgress, empoweredCount) {
  const anyCycleProbs = [];
  const specificCycleProbs = [];
  for (let progress = 1; progress <= 500; progress += 1) {
    const pAny = getSeasonEmpoweredProbAtProgress(progress);
    anyCycleProbs.push(pAny);
    specificCycleProbs.push(empoweredCount > 0 ? pAny / empoweredCount : 0);
  }
  const any = expectedFromSeasonCycle(startProgress, anyCycleProbs);
  const specific = expectedFromSeasonCycle(startProgress, specificCycleProbs);
  return { any, specific };
}

function expectedWithDrawAndGuarantee(startProgress, guaranteeProgress, probFn) {
  const drawsToGuarantee = Math.max(1, guaranteeProgress - startProgress);
  let expected = 0;
  let survival = 1;
  for (let draw = 1; draw <= drawsToGuarantee; draw += 1) {
    expected += survival;
    if (draw < drawsToGuarantee) {
      const p = Math.min(1, Math.max(0, probFn(startProgress + draw)));
      survival *= 1 - p;
    }
  }
  return expected;
}

function calcSeasonWithGiftExpected(startProgress, empoweredCount, flags) {
  const pAnyFn = (progressAfterDraw) =>
    getSeasonEmpoweredProbAtProgress(progressAfterDraw);
  const pSpecificFn = (progressAfterDraw) => {
    const any = getSeasonEmpoweredProbAtProgress(progressAfterDraw);
    return empoweredCount > 0 ? any / empoweredCount : 0;
  };

  const anyGuaranteeProgress = flags && flags.p200 ? 500 : 200;
  return {
    any: expectedWithDrawAndGuarantee(startProgress, anyGuaranteeProgress, pAnyFn),
    specific: expectedWithDrawAndGuarantee(startProgress, 500, pSpecificFn),
  };
}

function calcExchangeWithGiftExpected(pool) {
  const cfg = getExchangeConfig();
  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const n = Math.max(1, (pool.empoweredCards || []).length);
  const capAny = cfg.fixedSelect42 ? 420 : 470;
  const capSpecificByTarget = (targetName) => {
    if (!targetName) return null;
    if (cfg.fixedSelect42 && targetName === cfg.fixedSelect42) return 420;
    const select47Pool =
      Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0
        ? cfg.select47Players
        : (pool.empoweredCards || []);
    return select47Pool.includes(targetName) ? 470 : null;
  };

  const calcExpectedWithGuarantees = (pBase, cap) => {
    if (!cap || cap <= 0) return pBase > 0 ? (1 / pBase) : 0;
    let expected = 0;
    let survival = 1;
    for (let draw = 1; draw <= cap; draw += 1) {
      expected += survival;
      let missFactor = 1 - clamp01(pBase);
      if (draw === cap) {
        missFactor = 0; // cap 抽触发自选保底
      }
      survival *= missFactor;
    }
    return expected;
  };

  const calcAnyExpected = () => calcExpectedWithGuarantees(pAny, capAny);

  const calcSpecificExpected = (targetName) => {
    if (!targetName) return 0;
    const pSpecific = pAny / n;
    const capSpecific = capSpecificByTarget(targetName);
    return calcExpectedWithGuarantees(pSpecific, capSpecific);
  };

  const refTarget = (pool.empoweredCards || [])[0] || "";
  return {
    any: calcAnyExpected(),
    specific: calcSpecificExpected(refTarget),
  };
}

function calcExchangeSpecificHitCDF(pool, drawCount, targetName) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  if (!allNames.includes(targetName)) return 0;
  const cfg = getExchangeConfig();
  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const n = Math.max(1, allNames.length);
  const pSpecific = pAny / n;
  let cap = null;
  if (cfg.fixedSelect42 && targetName === cfg.fixedSelect42) {
    cap = 420;
  } else {
    const select47Pool =
      Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0
        ? cfg.select47Players
        : (pool.empoweredCards || []);
    if (select47Pool.includes(targetName)) cap = 470;
  }
  if (cap && drawCount >= cap) return 1;
  const baseNoHit = (1 - pSpecific) ** drawCount;
  return clamp01(1 - baseNoHit);
}

function calcExchangeEmpoweredAtLeastCDF(pool, drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const cfg = getExchangeConfig();
  const cap = cfg.fixedSelect42 ? 420 : 470;
  const fixedGain = drawCount >= cap ? 1 : 0;
  const needFromBase = Math.max(0, targetCount - fixedGain);
  return calcBinomialAtLeast(drawCount, pAny, needFromBase);
}

function calcExchangeSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  if (!allNames.includes(targetName)) return 0;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const n = Math.max(1, allNames.length);
  const pSpecific = pAny / n;
  const cfg = getExchangeConfig();
  let cap = null;
  if (cfg.fixedSelect42 && targetName === cfg.fixedSelect42) {
    cap = 420;
  } else {
    const select47Pool =
      Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0
        ? cfg.select47Players
        : (pool.empoweredCards || []);
    if (select47Pool.includes(targetName)) cap = 470;
  }
  const fixedGain = cap && drawCount >= cap ? 1 : 0;
  const need = Math.max(0, targetCount - fixedGain);
  const cdf = calcBinomialAtLeast(drawCount, pSpecific, need);
  return clamp01(cdf);
}

function getMilestoneRewardHitProb(reward, pool, empoweredCount) {
  if (!reward) return { any: 0, specific: 0 };

  if (reward.type === "empowered_chance") {
    const chance = reward.chance || 0;
    if (pool.bonusHitMode === "empowered_only") {
      return {
        any: chance,
        specific: empoweredCount > 0 ? chance / empoweredCount : 0,
      };
    }
    const selectedWeight = pool.selectedCardCountForBonus || 0;
    const total = empoweredCount + selectedWeight;
    if (total <= 0) return { any: 0, specific: 0 };
    return {
      any: chance * (empoweredCount / total),
      specific: chance * (1 / total),
    };
  }

  if (reward.type === "empowered_random") {
    return { any: 1, specific: empoweredCount > 0 ? 1 / empoweredCount : 0 };
  }

  if (reward.type === "empowered_select") {
    return { any: 1, specific: 1 };
  }

  if (reward.type === "exchange_target_chance") {
    const chance = reward.chance || 0;
    return {
      any: chance,
      specific: empoweredCount > 0 ? chance / empoweredCount : 0,
    };
  }

  return { any: 0, specific: 0 };
}

function calcMilestoneWithGiftExpected(pool, empoweredCount) {
  const empoweredProb = getBaseEmpoweredProbability(pool.poolConfig || []);
  const drawAny = empoweredProb;
  const drawSpecific = empoweredCount > 0 ? empoweredProb / empoweredCount : 0;

  const rewardsByPull = {};
  (pool.milestones || [])
    .filter((m) => m.pulls <= 500)
    .forEach((m) => {
      if (!rewardsByPull[m.pulls]) rewardsByPull[m.pulls] = [];
      rewardsByPull[m.pulls].push(m);
    });

  const stepProbsAny = [];
  const stepProbsSpecific = [];
  for (let pulls = 1; pulls <= 500; pulls += 1) {
    let failAny = 1 - drawAny;
    let failSpecific = 1 - drawSpecific;
    const rewards = rewardsByPull[pulls] || [];
    rewards.forEach((reward) => {
      const hit = getMilestoneRewardHitProb(reward, pool, empoweredCount);
      failAny *= 1 - hit.any;
      failSpecific *= 1 - hit.specific;
    });
    stepProbsAny.push(1 - failAny);
    stepProbsSpecific.push(1 - failSpecific);
  }

  return {
    any: expectedFromStepProbs(stepProbsAny),
    specific: expectedFromStepProbs(stepProbsSpecific),
  };
}

function getChainTargetPool(targetName, pool = getCurrentPool()) {
  if (pool.chainSubPools) {
    const keys = Object.keys(pool.chainSubPools);
    const matched = keys.filter((key) =>
      (pool.chainSubPools[key]?.cards || []).includes(targetName)
    );
    return matched[0] || "";
  }
  const mainNames = pool.empoweredCards || [];
  const sideNames = pool.sidePoolCards || [];
  if (mainNames.includes(targetName)) return "main";
  if (sideNames.includes(targetName)) return "side";
  return "";
}

function getChainPoolCards(pool, poolKey) {
  if (!poolKey) return [];
  if (pool.chainSubPools && pool.chainSubPools[poolKey]) {
    return (pool.chainSubPools[poolKey].cards || []).slice();
  }
  if (poolKey === "main") return (pool.empoweredCards || []).slice();
  if (poolKey === "side") return (pool.sidePoolCards || []).slice();
  return [];
}

function getChainPoolDisplayName(pool, poolKey) {
  if (!poolKey) return "卡池";
  if (pool.chainSubPools && pool.chainSubPools[poolKey]) {
    return pool.chainSubPools[poolKey].name || poolKey;
  }
  if (poolKey === "main") return pool.mainPoolName || "主池";
  if (poolKey === "side") return pool.sidePoolName || "小池";
  return poolKey;
}

function parseChainRewardKind(kind, pool = getCurrentPool()) {
  if (!kind) return null;
  if (kind === "side_box") {
    return { rewardType: "box", poolKey: "side", chance: 1 };
  }
  const m = String(kind).match(/^([a-z0-9]+)_(10|30|random|select)$/i);
  if (!m) return null;
  const poolKey = m[1];
  const action = m[2];
  if (!getChainPoolCards(pool, poolKey).length) return null;
  if (action === "10") return { rewardType: "chance", poolKey, chance: 0.1 };
  if (action === "30") return { rewardType: "chance", poolKey, chance: 0.3 };
  if (action === "random") return { rewardType: "random", poolKey, chance: 1 };
  if (action === "select") return { rewardType: "select", poolKey, chance: 1 };
  return null;
}

function getChainRewardKindLabel(kind, pool = getCurrentPool()) {
  const parsed = parseChainRewardKind(kind, pool);
  if (!parsed) return kind;
  const poolName = getChainPoolDisplayName(pool, parsed.poolKey);
  if (parsed.rewardType === "chance") {
    const rate = Math.round((parsed.chance || 0) * 100);
    return `${rate}%${poolName}随机增能卡券`;
  }
  if (parsed.rewardType === "random") {
    return `${poolName}随机增能必得券`;
  }
  if (parsed.rewardType === "select") {
    return `${poolName}增能自选券`;
  }
  if (parsed.rewardType === "box") {
    return `${poolName}箱式随机券`;
  }
  return kind;
}

function getChainSpecificHitProbForKind(kind, targetName, pool = getCurrentPool()) {
  const parsed = parseChainRewardKind(kind, pool);
  if (!parsed) return 0;
  if (parsed.rewardType === "box") return 0;
  const cards = getChainPoolCards(pool, parsed.poolKey);
  if (!cards.length || !cards.includes(targetName)) return 0;
  if (parsed.rewardType === "chance") {
    return (parsed.chance || 0) / cards.length;
  }
  if (parsed.rewardType === "random") {
    return 1 / cards.length;
  }
  if (parsed.rewardType === "select") {
    return 1;
  }
  return 0;
}

function getChainEmpoweredProbForKind(kind, pool = getCurrentPool()) {
  const parsed = parseChainRewardKind(kind, pool);
  if (!parsed) return 0;
  if (parsed.rewardType === "chance") return parsed.chance || 0;
  if (["random", "select", "box"].includes(parsed.rewardType)) return 1;
  return 0;
}

function getChainMainSpecificHitProbForTier(tier, mainCount) {
  if (mainCount <= 0) return 0;
  let fail = 1;
  (tier.rewards || []).forEach((kind) => {
    if (kind === "main_10") fail *= 1 - 0.1 / mainCount;
    else if (kind === "main_30") fail *= 1 - 0.3 / mainCount;
    else if (kind === "main_random") fail *= 1 - 1 / mainCount;
    else if (kind === "main_select") fail *= 0;
  });
  return clamp01(1 - fail);
}

function calcChainSpecificCDF(tierCount, targetName) {
  if (tierCount <= 0 || !targetName) return 0;
  const pool = getCurrentPool();
  const tiers = (pool.chainTiers || []).filter((t) => (t.tier || 0) <= tierCount);
  if (!tiers.length) return 0;

  if (pool.chainSubPools) {
    let fail = 1;
    tiers.forEach((tier) => {
      (tier.rewards || []).forEach((kind) => {
        const p = clamp01(getChainSpecificHitProbForKind(kind, targetName, pool));
        fail *= 1 - p;
      });
    });
    return clamp01(1 - fail);
  }

  const targetPool = getChainTargetPool(targetName, pool);
  if (!targetPool) return 0;

  if (targetPool === "main") {
    const mainCount = (pool.empoweredCards || []).length;
    if (mainCount <= 0) return 0;
    let fail = 1;
    tiers.forEach((tier) => {
      fail *= 1 - getChainMainSpecificHitProbForTier(tier, mainCount);
    });
    return clamp01(1 - fail);
  }

  const sideCount = (pool.sidePoolCards || []).length;
  if (sideCount <= 0) return 0;
  let survive = 1;
  let remain = sideCount;
  tiers.forEach((tier) => {
    (tier.rewards || []).forEach((kind) => {
      if (kind !== "side_box" || remain <= 0) return;
      const hit = 1 / remain;
      survive *= 1 - hit;
      remain -= 1;
    });
  });
  return clamp01(1 - survive);
}

function calcChainExpectedTierByPoolType(poolType, pool = getCurrentPool()) {
  const tiers = pool.chainTiers || [];
  if (!tiers.length) return 0;
  const maxTier = tiers[tiers.length - 1].tier || tiers.length;

  if (poolType === "main") {
    const mainCount = (pool.empoweredCards || []).length;
    if (mainCount <= 0) return 0;
    let survive = 1;
    let expected = 0;
    tiers.forEach((tier) => {
      const hit = getChainMainSpecificHitProbForTier(tier, mainCount);
      expected += (tier.tier || 0) * survive * hit;
      survive *= 1 - hit;
    });
    return expected + maxTier * survive;
  }

  if (poolType === "side") {
    const sideCount = (pool.sidePoolCards || []).length;
    if (sideCount <= 0) return 0;
    let survive = 1;
    let remain = sideCount;
    let expected = 0;
    tiers.forEach((tier) => {
      (tier.rewards || []).forEach((kind) => {
        if (kind !== "side_box" || remain <= 0) return;
        const hit = 1 / remain;
        expected += (tier.tier || 0) * survive * hit;
        survive *= 1 - hit;
        remain -= 1;
      });
    });
    return expected + maxTier * survive;
  }

  return 0;
}

function calcChainSpecificExpectedTier(targetName, pool = getCurrentPool()) {
  if (!targetName) return 0;
  const tiers = pool.chainTiers || [];
  if (!tiers.length) return 0;
  const sorted = tiers.slice().sort((a, b) => (a.tier || 0) - (b.tier || 0));
  const maxTier = sorted[sorted.length - 1].tier || sorted.length;

  let expected = 0;
  let prevCdf = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    const tier = sorted[i].tier || i + 1;
    const cdf = clamp01(calcChainSpecificCDF(tier, targetName));
    const pAtTier = Math.max(0, cdf - prevCdf);
    expected += tier * pAtTier;
    prevCdf = cdf;
  }
  expected += maxTier * Math.max(0, 1 - prevCdf);
  return expected;
}

function calcChainExpectedTierMetrics(pool) {
  if (pool.chainSubPools) {
    const poolExpectedTiers = {};
    Object.keys(pool.chainSubPools).forEach((poolKey) => {
      const cards = pool.chainSubPools[poolKey]?.cards || [];
      if (!cards.length) return;
      const sum = cards.reduce(
        (acc, name) => acc + calcChainSpecificExpectedTier(name, pool),
        0
      );
      poolExpectedTiers[poolKey] = sum / cards.length;
    });
    return { poolExpectedTiers };
  }
  return {
    mainSpecificTier: calcChainExpectedTierByPoolType("main", pool),
    sideSpecificTier: calcChainExpectedTierByPoolType("side", pool),
  };
}

function getBonusSpecificHitProb(pool, empoweredCount) {
  if (pool.bonusHitMode === "empowered_only") {
    return empoweredCount > 0 ? 1 / empoweredCount : 0;
  }
  const selectedWeight = pool.selectedCardCountForBonus || 0;
  const total = empoweredCount + selectedWeight;
  return total > 0 ? 1 / total : 0;
}

function calcMilestoneSpecificHitCDF(pool, targetDraws, targetName = "") {
  const empoweredCount = (pool.empoweredCards || []).length;
  if (empoweredCount <= 0 || targetDraws <= 0) return 0;

  const empoweredProb = getBaseEmpoweredProbability(pool.poolConfig || []);
  const drawSpecific = empoweredProb / empoweredCount;
  const bonusSpecific = getBonusSpecificHitProb(pool, empoweredCount);

  const rewardsByPull = {};
  (pool.milestones || [])
    .filter((m) => m.pulls <= targetDraws)
    .forEach((m) => {
      if (!rewardsByPull[m.pulls]) rewardsByPull[m.pulls] = [];
      rewardsByPull[m.pulls].push(m);
    });

  let survive = 1;
  for (let pull = 1; pull <= targetDraws; pull += 1) {
    let failThisPull = 1 - drawSpecific;
    const rewards = rewardsByPull[pull] || [];
    rewards.forEach((reward) => {
      if (reward.type === "empowered_chance") {
        const hit = (reward.chance || 0) * bonusSpecific;
        failThisPull *= 1 - hit;
      } else if (reward.type === "empowered_random") {
        failThisPull *= 1 - 1 / empoweredCount;
      } else if (reward.type === "empowered_select") {
        failThisPull *= 0;
      } else if (reward.type === "exchange_target_chance") {
        const hit = reward.targetName && reward.targetName === targetName
          ? (reward.chance || 0)
          : targetName
          ? 0
          : empoweredCount > 0
          ? (reward.chance || 0) / empoweredCount
          : 0;
        failThisPull *= 1 - hit;
      }
    });
    survive *= clamp01(failThisPull);
  }
  return clamp01(1 - survive);
}

function getSeasonEmpoweredProbByCurrentProgress(currentProgress) {
  if (currentProgress >= 80) return 0.005;
  if (currentProgress >= 60) return 0.004;
  if (currentProgress >= 40) return 0.003;
  if (currentProgress >= 20) return 0.002;
  return 0.001;
}

function simulateSeasonSpecificCDF(targetDraws, targetName) {
  targetDraws = Math.max(0, Math.floor(Number(targetDraws) || 0));
  if (targetDraws <= 0) return 0;
  const names = getCurrentPool().empoweredCards || [];
  const n = names.length;
  if (!n) return 0;
  const target = targetName && names.includes(targetName) ? targetName : names[0];
  if (!target) return 0;
  if (targetDraws >= 500) return 1;

  // dist[u]：在当前抽次前仍未中目标，且其他球员已见过 u 个的概率
  let dist = new Array(Math.max(1, n)).fill(0);
  dist[0] = 1;

  for (let draw = 1; draw <= targetDraws; draw += 1) {
    const progressBeforeDraw = draw - 1;
    const pAny = getSeasonEmpoweredProbByCurrentProgress(progressBeforeDraw);
    const next = new Array(Math.max(1, n)).fill(0);

    for (let u = 0; u <= n - 1; u += 1) {
      const base = dist[u] || 0;
      if (base <= 0) continue;

      // 本抽不出增能
      next[u] += base * (1 - pAny);
      // 出增能但不是目标，且抽到已见过的其他球员
      next[u] += base * pAny * (u / n);
      // 出增能且抽到未见过的其他球员
      if (u + 1 <= n - 1) {
        next[u + 1] += base * pAny * ((n - 1 - u) / n);
      }
      // 出目标的概率被留在“命中”中，不进入 next
    }

    // 200抽奖励：随机不重复增能
    if (draw === 200) {
      const afterReward = new Array(Math.max(1, n)).fill(0);
      for (let u = 0; u <= n - 1; u += 1) {
        const base = next[u] || 0;
        if (base <= 0) continue;
        const unseenTotal = n - u; // 目标一定还未命中，所以至少包含目标
        if (unseenTotal <= 0) continue;
        // 奖励非目标时，一定新增一个“其他球员”
        if (u + 1 <= n - 1) {
          afterReward[u + 1] += base * (1 - 1 / unseenTotal);
        }
        // 奖励命中目标的概率不进入 afterReward
      }
      dist = afterReward;
    } else {
      dist = next;
    }
  }

  const survival = dist.reduce((sum, p) => sum + p, 0);
  return clamp01(1 - survival);
}

const favoredProbabilityCache = {};
const specificProbabilityCache = {};
const specificCountProbabilityCache = {};
const empoweredCountProbabilityCache = {};
const uniqueEmpoweredCountProbabilityCache = {};
const chainFavoredExpectedTierCache = {};
const favoredSetMetricsCache = {};
let pendingFavoredHitEvent = null;
let continueOpenAllRewards = false;
let favHitLineTimers = [];
let cinematicDemoTimers = [];
let cinematicDemoDone = false;
let cinematicDemoContext = null;
let cinematicDemoPreviewType = "史诗";

const ANIMATION_MODES = {
  FAVORED_ONLY: "favored_only",
  ALL_EMPOWERED: "all_empowered",
  NONE: "none",
};

function getCurrentAnimationMode() {
  const select = document.getElementById("animationModeSelect");
  return select ? select.value : ANIMATION_MODES.FAVORED_ONLY;
}

function getCurrentAnimationProgressDraws() {
  if (isChainPool()) {
    return Number(state.chainTierProgress || 0);
  }
  return Number(state.totalPulls || 0);
}

function getFavoredHitProbabilityByDrawCount(drawCount) {
  const pool = getCurrentPool();
  const names = isChainPool() ? getEmpoweredStatNames() : pool.empoweredCards || [];
  if (!names.length || drawCount <= 0) return 0;
  const targetName = getCurrentFavoredTargetName();
  const normalizedTarget = targetName && names.includes(targetName) ? targetName : names[0];

  const cacheKey = `${activePoolKey}|${normalizedTarget}|${drawCount}`;
  if (favoredProbabilityCache[cacheKey] != null) {
    return favoredProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (isChainPool()) {
    cdf = calcChainSpecificCDF(drawCount, normalizedTarget);
  } else if (isSeasonPool()) {
    cdf = simulateSeasonSpecificCDF(drawCount, normalizedTarget);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeSpecificCDF(pool, drawCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else {
    const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
    const pSpecific = names.length > 0 ? pAny / names.length : 0;
    cdf = 1 - (1 - pSpecific) ** drawCount;
  }

  favoredProbabilityCache[cacheKey] = clamp01(cdf);
  return favoredProbabilityCache[cacheKey];
}

function getSpecificHitProbabilityByDrawCount(drawCount, targetName) {
  const pool = getCurrentPool();
  const names = isChainPool() ? getEmpoweredStatNames() : pool.empoweredCards || [];
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (!names.length || drawCount <= 0 || !targetName || !names.includes(targetName)) return 0;

  const cacheKey = `${activePoolKey}|${targetName}|${drawCount}`;
  if (specificProbabilityCache[cacheKey] != null) {
    return specificProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (isChainPool()) {
    cdf = calcChainSpecificCDF(drawCount, targetName);
  } else if (isSeasonPool()) {
    cdf = simulateSeasonSpecificCDF(drawCount, targetName);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeSpecificCDF(pool, drawCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneSpecificHitCDF(pool, drawCount, targetName);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificHitCDF(pool, drawCount, targetName);
  } else {
    const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
    const pSpecific = names.length > 0 ? pAny / names.length : 0;
    cdf = 1 - (1 - pSpecific) ** drawCount;
  }

  specificProbabilityCache[cacheKey] = clamp01(cdf);
  return specificProbabilityCache[cacheKey];
}

function getFavoredProgressCap(pool = getCurrentPool(), selectedNames = []) {
  if (isChainPool()) {
    return (pool.chainTiers || []).length || 7;
  }
  if (isSeasonPool()) return 500;
  if (isAccumulatedGuaranteePool()) return getAccumulatedGuaranteeProgressCap(pool);
  if (pool.progressionType === "milestone") {
    if (Number(pool.progressCap) > 0) return Number(pool.progressCap);
    const firstSelect = (pool.milestones || []).find((m) => m.type === "empowered_select");
    return firstSelect ? Number(firstSelect.pulls) || 500 : 500;
  }
  if (pool.progressionType === "exchange_badge") {
    const cfg = getExchangeConfig();
    const selected = Array.from(new Set((selectedNames || []).filter(Boolean)));
    if (cfg.fixedSelect42 && selected.length === 1 && selected[0] === cfg.fixedSelect42) {
      return 420;
    }
    return 470;
  }
  return 500;
}

function getExchangeSelectPoolForCap(pool, capDraw) {
  const cfg = getExchangeConfig();
  if (cfg.fixedSelect42 && capDraw === 420) return [cfg.fixedSelect42];
  if (Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0) {
    return cfg.select47Players.slice();
  }
  return (pool.empoweredCards || []).slice();
}

function calcChainFavoredSetMetricsExact(pool, selectedNames) {
  const tiers = (pool.chainTiers || [])
    .slice()
    .sort((a, b) => (a.tier || 0) - (b.tier || 0));
  const maxTier = tiers.length ? tiers[tiers.length - 1].tier || tiers.length : 0;
  const selected = Array.from(new Set((selectedNames || []).filter(Boolean)));
  if (!selected.length || !maxTier) {
    return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };
  }

  const selectedIndex = {};
  selected.forEach((name, idx) => {
    selectedIndex[name] = idx;
  });
  const fullMask = (1 << selected.length) - 1;

  const sideCards = (pool.sidePoolCards || []).slice();
  const sideFullMask = sideCards.length > 0 ? (1 << sideCards.length) - 1 : -1;
  const sideCardBitByIndex = sideCards.map((name) =>
    Object.prototype.hasOwnProperty.call(selectedIndex, name) ? (1 << selectedIndex[name]) : 0
  );

  const keyOf = (mask, sideMask) => `${mask}|${sideMask}`;
  const parseKey = (key) => {
    const parts = key.split("|");
    return { mask: Number(parts[0]), sideMask: Number(parts[1]) };
  };

  const transitionByReward = (states, kind) => {
    const next = new Map();
    states.forEach((stateProb, key) => {
      if (stateProb <= 0) return;
      const { mask, sideMask } = parseKey(key);

      // 箱式（不放回）
      if (kind === "side_box") {
        if (sideMask < 0) {
          const k = keyOf(mask, sideMask);
          next.set(k, (next.get(k) || 0) + stateProb);
          return;
        }
        const remainingIdx = [];
        for (let i = 0; i < sideCards.length; i += 1) {
          if (sideMask & (1 << i)) remainingIdx.push(i);
        }
        if (!remainingIdx.length) {
          const k = keyOf(mask, sideMask);
          next.set(k, (next.get(k) || 0) + stateProb);
          return;
        }
        const eachP = stateProb / remainingIdx.length;
        remainingIdx.forEach((idx) => {
          const newSideMask = sideMask & ~(1 << idx);
          const addBit = sideCardBitByIndex[idx] || 0;
          const newMask = mask | addBit;
          const k = keyOf(newMask, newSideMask);
          next.set(k, (next.get(k) || 0) + eachP);
        });
        return;
      }

      const parsed = parseChainRewardKind(kind, pool);
      if (!parsed) {
        const k = keyOf(mask, sideMask);
        next.set(k, (next.get(k) || 0) + stateProb);
        return;
      }

      const candidates = getChainPoolCards(pool, parsed.poolKey);
      if (!candidates.length) {
        const k = keyOf(mask, sideMask);
        next.set(k, (next.get(k) || 0) + stateProb);
        return;
      }

      const selectedBitsInPool = candidates
        .map((name) =>
          Object.prototype.hasOwnProperty.call(selectedIndex, name)
            ? (1 << selectedIndex[name])
            : 0
        )
        .filter((bit) => bit !== 0);
      const selectedCountInPool = selectedBitsInPool.length;
      const n = candidates.length;

      if (parsed.rewardType === "chance") {
        const missP = Math.max(0, 1 - (parsed.chance || 0) * (selectedCountInPool / n));
        if (missP > 0) {
          const k = keyOf(mask, sideMask);
          next.set(k, (next.get(k) || 0) + stateProb * missP);
        }
        if (selectedCountInPool > 0) {
          const hitEachP = stateProb * ((parsed.chance || 0) / n);
          selectedBitsInPool.forEach((bit) => {
            const k = keyOf(mask | bit, sideMask);
            next.set(k, (next.get(k) || 0) + hitEachP);
          });
        }
        return;
      }

      if (parsed.rewardType === "random") {
        const missP = Math.max(0, 1 - selectedCountInPool / n);
        if (missP > 0) {
          const k = keyOf(mask, sideMask);
          next.set(k, (next.get(k) || 0) + stateProb * missP);
        }
        if (selectedCountInPool > 0) {
          const hitEachP = stateProb * (1 / n);
          selectedBitsInPool.forEach((bit) => {
            const k = keyOf(mask | bit, sideMask);
            next.set(k, (next.get(k) || 0) + hitEachP);
          });
        }
        return;
      }

      if (parsed.rewardType === "select") {
        const missingBits = Array.from(new Set(selectedBitsInPool)).filter(
          (bit) => (mask & bit) === 0
        );
        if (missingBits.length > 0) {
          const eachP = stateProb / missingBits.length;
          missingBits.forEach((bit) => {
            const k = keyOf(mask | bit, sideMask);
            next.set(k, (next.get(k) || 0) + eachP);
          });
        } else {
          const k = keyOf(mask, sideMask);
          next.set(k, (next.get(k) || 0) + stateProb);
        }
        return;
      }

      const k = keyOf(mask, sideMask);
      next.set(k, (next.get(k) || 0) + stateProb);
    });
    return next;
  };

  let states = new Map();
  states.set(keyOf(0, sideFullMask), 1);
  let prevAnyCDF = 0;
  let prevAllCDF = 0;
  let anyExpected = 0;
  let allExpected = 0;
  let allCDFAtCap = 0;

  for (let tierNo = 1; tierNo <= maxTier; tierNo += 1) {
    const tierCfg = tiers.find((t) => (t.tier || 0) === tierNo);
    if (!tierCfg) continue;
    let afterTier = states;
    (tierCfg.rewards || []).forEach((kind) => {
      afterTier = transitionByReward(afterTier, kind);
    });
    states = afterTier;

    let anyCDF = 0;
    let allCDF = 0;
    states.forEach((prob, key) => {
      const { mask } = parseKey(key);
      if (mask !== 0) anyCDF += prob;
      if (mask === fullMask) allCDF += prob;
    });
    anyCDF = clamp01(anyCDF);
    allCDF = clamp01(allCDF);
    anyExpected += tierNo * Math.max(0, anyCDF - prevAnyCDF);
    allExpected += tierNo * Math.max(0, allCDF - prevAllCDF);
    prevAnyCDF = anyCDF;
    prevAllCDF = allCDF;
    if (tierNo === getFavoredProgressCap(pool)) {
      allCDFAtCap = allCDF;
    }
  }

  // 未在最大档内完成的质量，记到“max+1”上，确保显示“超7档”
  anyExpected += (maxTier + 1) * Math.max(0, 1 - prevAnyCDF);
  allExpected += (maxTier + 1) * Math.max(0, 1 - prevAllCDF);
  if (!allCDFAtCap) allCDFAtCap = prevAllCDF;

  return {
    anyExpected,
    allExpected,
    allProbAtCap: clamp01(allCDFAtCap),
  };
}

function simulateDrawFavoredSetHitTimes(pool, selectedNames) {
  const selected = Array.from(new Set((selectedNames || []).filter(Boolean)));
  const cap = getFavoredProgressCap(pool, selected);
  const maxDraw = Math.max(cap * 4, 1200);
  const m = selected.length;
  const n = (pool.empoweredCards || []).length || 1;
  if (!m) return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };
  const fullMask = (1 << m) - 1;
  const bitOf = {};
  selected.forEach((name, idx) => {
    bitOf[name] = 1 << idx;
  });

  const keyOf = (mask, aux1, aux2) => `${mask}|${aux1}|${aux2}`;
  const parseKey = (k) => {
    const p = k.split("|");
    return { mask: Number(p[0]), aux1: Number(p[1]), aux2: Number(p[2]) };
  };

  const push = (map, mask, aux1, aux2, prob) => {
    if (prob <= 0) return;
    const k = keyOf(mask, aux1, aux2);
    map.set(k, (map.get(k) || 0) + prob);
  };

  const applyRandomEmpowered = (mapIn, chance, poolNames, keepAux) => {
    const out = new Map();
    const poolCount = Math.max(1, (poolNames || []).length);
    mapIn.forEach((prob, key) => {
      if (prob <= 0) return;
      const { mask, aux1, aux2 } = parseKey(key);
      let missProb = prob;
      Object.keys(bitOf).forEach((name) => {
        const bit = bitOf[name];
        if ((mask & bit) !== 0) return;
        if (!(poolNames || []).includes(name)) return;
        const p = prob * (chance / poolCount);
        missProb -= p;
        push(out, mask | bit, aux1, aux2, p);
      });
      push(out, mask, aux1, aux2, Math.max(0, missProb));
    });
    return out;
  };

  let states = new Map();
  // aux1/aux2:
  // milestone: aux1=milestoneIndex, aux2=0
  // season: aux1=progress(0..499), aux2=seenUnselectedCount
  // exchange: aux1=badges, aux2=0
  states.set(
    keyOf(0, 0, 0),
    1
  );

  let prevAnyCDF = 0;
  let prevAllCDF = 0;
  let anyExpected = 0;
  let allExpected = 0;
  let allCDFAtCap = 0;

  for (let draw = 1; draw <= maxDraw; draw += 1) {
    // 1) base draw transition
    let next = new Map();
    states.forEach((prob, key) => {
      if (prob <= 0) return;
      const { mask, aux1, aux2 } = parseKey(key);
      if (pool.progressionType === "season_inherit") {
        const progress = aux1;
        const seenUnselected = aux2;
        const pAny = clamp01(getSeasonEmpoweredProbByCurrentProgress(progress));
        const seenSelected = selected.reduce((c, name) => c + (((mask & bitOf[name]) !== 0) ? 1 : 0), 0);
        const missingSelected = m - seenSelected;

        // no empowered
        push(next, mask, progress, seenUnselected, prob * (1 - pAny));
        // empowered hits selected missing
        Object.keys(bitOf).forEach((name) => {
          const bit = bitOf[name];
          if ((mask & bit) !== 0) return;
          push(next, mask | bit, progress, seenUnselected, prob * (pAny / n));
        });
        // empowered but no new selected
        const pSelectedSeen = pAny * (seenSelected / n);
        const pUnselectedSeen = pAny * (seenUnselected / n);
        push(next, mask, progress, seenUnselected, prob * (pSelectedSeen + pUnselectedSeen));
        const unseenUnselected = Math.max(0, n - m - seenUnselected);
        if (unseenUnselected > 0) {
          push(next, mask, progress, seenUnselected + 1, prob * (pAny * (unseenUnselected / n)));
        }
      } else if (pool.progressionType === "accumulated_target") {
        const pAny = clamp01(getAccumulatedGuaranteeProbByCurrentProgress(draw - 1, pool));
        Object.keys(bitOf).forEach((name) => {
          const bit = bitOf[name];
          if ((mask & bit) !== 0) return;
          push(next, mask | bit, aux1, aux2, prob * (pAny / n));
        });
        const missing = selected.reduce((c, name) => c + (((mask & bitOf[name]) === 0) ? 1 : 0), 0);
        push(next, mask, aux1, aux2, prob * (1 - pAny * (missing / n)));
      } else {
        const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
        // selected missing
        Object.keys(bitOf).forEach((name) => {
          const bit = bitOf[name];
          if ((mask & bit) !== 0) return;
          push(next, mask | bit, aux1, aux2, prob * (pAny / n));
        });
        const missing = selected.reduce((c, name) => c + (((mask & bitOf[name]) === 0) ? 1 : 0), 0);
        push(next, mask, aux1, aux2, prob * (1 - pAny * (missing / n)));
      }
    });

    // 2) progression transition
    if (pool.progressionType === "milestone") {
      // milestone index advances by draw; apply all rewards unlocked at this draw
      let progressed = new Map();
      next.forEach((prob, key) => {
        const { mask, aux1 } = parseKey(key);
        let idx = aux1;
        let dist = new Map([[keyOf(mask, idx, 0), prob]]);
        while (
          idx < (pool.milestones || []).length &&
          draw >= (((pool.milestones || [])[idx] || {}).pulls || 0)
        ) {
          const reward = (pool.milestones || [])[idx];
          const afterReward = new Map();
          dist.forEach((dProb, dKey) => {
            const parsed = parseKey(dKey);
            const dMask = parsed.mask;
            if (!reward) return;
            if (reward.type === "empowered_chance") {
              if (pool.bonusHitMode === "empowered_only") {
                const tmp = applyRandomEmpowered(
                  new Map([[keyOf(dMask, idx + 1, 0), dProb]]),
                  reward.chance || 0,
                  pool.empoweredCards || [],
                  true
                );
                tmp.forEach((v, k) => afterReward.set(k, (afterReward.get(k) || 0) + v));
              } else {
                const selWeight = pool.selectedCardCountForBonus || 0;
                const total = (pool.empoweredCards || []).length + selWeight;
                const chanceEmp = total > 0 ? (reward.chance || 0) * ((pool.empoweredCards || []).length / total) : 0;
                const tmp = applyRandomEmpowered(
                  new Map([[keyOf(dMask, idx + 1, 0), dProb]]),
                  chanceEmp,
                  pool.empoweredCards || [],
                  true
                );
                tmp.forEach((v, k) => afterReward.set(k, (afterReward.get(k) || 0) + v));
              }
            } else if (reward.type === "empowered_random") {
              const tmp = applyRandomEmpowered(
                new Map([[keyOf(dMask, idx + 1, 0), dProb]]),
                1,
                pool.empoweredCards || [],
                true
              );
              tmp.forEach((v, k) => afterReward.set(k, (afterReward.get(k) || 0) + v));
            } else if (reward.type === "empowered_select") {
              const missingBits = Object.keys(bitOf)
                .map((name) => bitOf[name])
                .filter((bit) => (dMask & bit) === 0);
              if (missingBits.length > 0) {
                const each = dProb / missingBits.length;
                missingBits.forEach((bit) => {
                  push(afterReward, dMask | bit, idx + 1, 0, each);
                });
              } else {
                push(afterReward, dMask, idx + 1, 0, dProb);
              }
            } else if (reward.type === "exchange_target_chance") {
              const targetBit = reward.targetName ? bitOf[reward.targetName] || 0 : 0;
              const hitChance = clamp01(reward.chance || 0);
              if (targetBit && (dMask & targetBit) === 0 && hitChance > 0) {
                push(afterReward, dMask | targetBit, idx + 1, 0, dProb * hitChance);
                push(afterReward, dMask, idx + 1, 0, dProb * (1 - hitChance));
              } else {
                push(afterReward, dMask, idx + 1, 0, dProb);
              }
            } else {
              push(afterReward, dMask, idx + 1, 0, dProb);
            }
          });
          dist = afterReward;
          idx += 1;
        }
        dist.forEach((v, k) => progressed.set(k, (progressed.get(k) || 0) + v));
      });
      next = progressed;
    } else if (pool.progressionType === "season_inherit") {
      const progressed = new Map();
      next.forEach((prob, key) => {
        if (prob <= 0) return;
        const { mask, aux1: progressBefore, aux2: seenUBefore } = parseKey(key);
        let progress = progressBefore + 1;
        let seenU = seenUBefore;
        let dist = new Map([[keyOf(mask, progress, seenU), prob]]);

        if (progress === 200) {
          const after200 = new Map();
          dist.forEach((dProb, dKey) => {
            const st = parseKey(dKey);
            const dMask = st.mask;
            const dSeenU = st.aux2;
            const seenSelected = selected.reduce((c, name) => c + (((dMask & bitOf[name]) !== 0) ? 1 : 0), 0);
            const missingSelectedBits = Object.keys(bitOf)
              .map((name) => bitOf[name])
              .filter((bit) => (dMask & bit) === 0);
            const unseenUnselected = Math.max(0, n - m - dSeenU);
            const unseenTotal = missingSelectedBits.length + unseenUnselected;
            if (unseenTotal <= 0) {
              push(after200, dMask, 200, dSeenU, dProb);
              return;
            }
            missingSelectedBits.forEach((bit) => {
              push(after200, dMask | bit, 200, dSeenU, dProb * (1 / unseenTotal));
            });
            if (unseenUnselected > 0) {
              push(after200, dMask, 200, dSeenU + 1, dProb * (unseenUnselected / unseenTotal));
            }
          });
          dist = after200;
        }

        if (progress === 500) {
          const after500 = new Map();
          dist.forEach((dProb, dKey) => {
            const st = parseKey(dKey);
            const dMask = st.mask;
            const missingBits = Object.keys(bitOf)
              .map((name) => bitOf[name])
              .filter((bit) => (dMask & bit) === 0);
            if (missingBits.length > 0) {
              const each = dProb / missingBits.length;
              missingBits.forEach((bit) => {
                push(after500, dMask | bit, 0, 0, each);
              });
            } else {
              push(after500, dMask, 0, 0, dProb);
            }
          });
          dist = after500;
        }

        dist.forEach((v, k) => progressed.set(k, (progressed.get(k) || 0) + v));
      });
      next = progressed;
    } else if (pool.progressionType === "accumulated_target") {
      if (draw === cap) {
        const afterGuarantee = new Map();
        next.forEach((prob, key) => {
          const { mask } = parseKey(key);
          push(afterGuarantee, fullMask, 0, 0, prob);
        });
        next = afterGuarantee;
      }
    } else if (pool.progressionType === "exchange_badge") {
      if (draw === cap) {
        const selectPool = getExchangeSelectPoolForCap(pool, cap);
        const afterSelect = new Map();
        next.forEach((prob, key) => {
          const { mask } = parseKey(key);
          const missingBits = Object.keys(bitOf)
            .filter((name) => selectPool.includes(name))
            .map((name) => bitOf[name])
            .filter((bit) => (mask & bit) === 0);
          if (missingBits.length > 0) {
            const each = prob / missingBits.length;
            missingBits.forEach((bit) => {
              push(afterSelect, mask | bit, 0, 0, each);
            });
          } else {
            push(afterSelect, mask, 0, 0, prob);
          }
        });
        next = afterSelect;
      }
    }

    states = next;

    let anyCDF = 0;
    let allCDF = 0;
    states.forEach((prob, key) => {
      const { mask } = parseKey(key);
      if (mask !== 0) anyCDF += prob;
      if (mask === fullMask) allCDF += prob;
    });
    anyCDF = clamp01(anyCDF);
    allCDF = clamp01(allCDF);
    anyExpected += draw * Math.max(0, anyCDF - prevAnyCDF);
    allExpected += draw * Math.max(0, allCDF - prevAllCDF);
    prevAnyCDF = anyCDF;
    prevAllCDF = allCDF;
    if (draw === cap) allCDFAtCap = allCDF;
  }

  anyExpected += (maxDraw + 1) * Math.max(0, 1 - prevAnyCDF);
  allExpected += (maxDraw + 1) * Math.max(0, 1 - prevAllCDF);
  if (!allCDFAtCap) allCDFAtCap = prevAllCDF;

  return {
    anyExpected,
    allExpected,
    allProbAtCap: clamp01(allCDFAtCap),
  };
}

function getFavoredSetExpectedMetrics(selectedNames) {
  const pool = getCurrentPool();
  const uniq = Array.from(new Set((selectedNames || []).filter(Boolean)));
  if (!uniq.length) return null;
  const hasTargetSpecificMilestones =
    pool.progressionType === "milestone" &&
    (pool.milestones || []).some((m) => m.type === "exchange_target_chance");
  const useCountBasedKey =
    !isChainPool() &&
    (pool.progressionType === "season_inherit" ||
      (pool.progressionType === "milestone" && !hasTargetSpecificMilestones));
  const normalizedNames = useCountBasedKey
    ? (pool.empoweredCards || []).slice(0, uniq.length)
    : uniq.slice().sort();
  const key = useCountBasedKey
    ? `${activePoolKey}|count:${uniq.length}`
    : `${activePoolKey}|${normalizedNames.join(",")}`;
  if (favoredSetMetricsCache[key]) return favoredSetMetricsCache[key];
  const cap = getFavoredProgressCap(pool, normalizedNames);
  const runs = isChainPool() ? 6000 : 4000;
  const simulated = isChainPool()
    ? calcChainFavoredSetMetricsExact(pool, normalizedNames)
    : simulateDrawFavoredSetHitTimes(pool, normalizedNames, runs);
  favoredSetMetricsCache[key] = {
    anyExpected: simulated.anyExpected,
    allExpected: simulated.allExpected,
    allProbAtCap: simulated.allProbAtCap,
    cap,
    unit: isChainPool() ? "档" : "抽",
  };
  return favoredSetMetricsCache[key];
}

function getChainFavoredExpectedTier(targetName) {
  const pool = getCurrentPool();
  if (!targetName) return 0;
  const availableNames = getEmpoweredStatNames();
  if (!availableNames.includes(targetName)) return 0;
  const cacheKey = `${activePoolKey}|${targetName}`;
  if (chainFavoredExpectedTierCache[cacheKey] != null) {
    return chainFavoredExpectedTierCache[cacheKey];
  }
  const expectedTier = calcChainSpecificExpectedTier(targetName, pool);
  chainFavoredExpectedTierCache[cacheKey] = expectedTier;
  return expectedTier;
}

function getCurrentFavoredTargetName() {
  const selectId = isChainPool() ? "chainFavEmpoweredChoice" : "favEmpoweredChoice";
  const select = document.getElementById(selectId);
  if (!select) return "";
  const selected = Array.from(select.selectedOptions || []).map((opt) => opt.value);
  if (selected.length > 0) return selected[0];
  return select.value || "";
}

function getCurrentFavoredTargetNames() {
  const selectId = isChainPool() ? "chainFavEmpoweredChoice" : "favEmpoweredChoice";
  const select = document.getElementById(selectId);
  if (!select) return [];
  const selected = Array.from(select.selectedOptions || [])
    .map((opt) => opt.value)
    .filter(Boolean);
  if (selected.length > 0) return selected;
  if (select.value) return [select.value];
  return [];
}

function renderFavTagSelector(selectId, containerId) {
  const select = document.getElementById(selectId);
  const container = document.getElementById(containerId);
  if (!select || !container) return;
  const selected = new Set(
    Array.from(select.selectedOptions || [])
      .map((opt) => opt.value)
      .filter(Boolean)
  );
  const options = Array.from(select.options || []);
  container.innerHTML = "";
  options.forEach((opt) => {
    const item = document.createElement("span");
    item.className = "fav-tag-item" + (selected.has(opt.value) ? " active" : "");
    item.textContent = opt.textContent || opt.value;
    item.setAttribute("data-value", opt.value);
    item.addEventListener("click", () => {
      opt.selected = !opt.selected;
      item.classList.toggle("active", opt.selected);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    container.appendChild(item);
  });
}

function updateFavSelectAllButton(selectId, buttonId) {
  const select = document.getElementById(selectId);
  const btn = document.getElementById(buttonId);
  if (!select || !btn) return;
  const options = Array.from(select.options || []);
  const selectedCount = Array.from(select.selectedOptions || []).length;
  const allSelected = options.length > 0 && selectedCount === options.length;
  btn.textContent = allSelected ? "取消全选" : "一键全选";
}

function calcBinomialAtLeast(n, p, k) {
  if (k <= 0) return 1;
  if (n <= 0) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (k > n) return 0;

  let pmf = (1 - p) ** n;
  let cdf = pmf;
  for (let i = 1; i < k; i += 1) {
    pmf *= ((n - i + 1) / i) * (p / (1 - p));
    cdf += pmf;
  }
  return clamp01(1 - cdf);
}

function buildIncrementDistribution(probs) {
  let dist = [1];
  probs.forEach((rawP) => {
    const p = clamp01(Number(rawP) || 0);
    if (p <= 0) return;
    const next = new Array(dist.length + 1).fill(0);
    for (let i = 0; i < dist.length; i += 1) {
      next[i] += dist[i] * (1 - p);
      next[i + 1] += dist[i] * p;
    }
    dist = next;
  });
  return dist;
}

function calcMilestoneEmpoweredAtLeastCDF(pool, drawCount, targetCount) {
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  const empoweredCount = (pool.empoweredCards || []).length;
  const drawP = getBaseEmpoweredProbability(pool.poolConfig || []);
  const rewardHitByPull = new Map();

  (pool.milestones || []).forEach((reward) => {
    if ((reward.pulls || 0) > drawCount) return;
    const hit = getMilestoneRewardHitProb(reward, pool, empoweredCount).any;
    if (hit <= 0) return;
    const arr = rewardHitByPull.get(reward.pulls) || [];
    arr.push(hit);
    rewardHitByPull.set(reward.pulls, arr);
  });

  let dist = new Array(targetCount + 1).fill(0);
  dist[0] = 1;

  for (let pull = 1; pull <= drawCount; pull += 1) {
    const probs = [drawP, ...(rewardHitByPull.get(pull) || [])];
    const incDist = buildIncrementDistribution(probs);
    const next = new Array(targetCount + 1).fill(0);

    for (let count = 0; count <= targetCount; count += 1) {
      const baseProb = dist[count];
      if (baseProb <= 0) continue;
      for (let inc = 0; inc < incDist.length; inc += 1) {
        const to = Math.min(targetCount, count + inc);
        next[to] += baseProb * incDist[inc];
      }
    }

    dist = next;
  }

  return clamp01(dist[targetCount]);
}

function calcChainEmpoweredAtLeastCDF(tierCount, targetCount) {
  if (targetCount <= 0) return 1;
  if (tierCount <= 0) return 0;

  const tiers = (getCurrentPool().chainTiers || []).filter((t) => (t.tier || 0) <= tierCount);
  let dist = new Array(targetCount + 1).fill(0);
  dist[0] = 1;

  tiers.forEach((tier) => {
    const probs = [];
    (tier.rewards || []).forEach((kind) => {
      const p = getChainEmpoweredProbForKind(kind, getCurrentPool());
      if (p > 0) probs.push(p);
    });

    const incDist = buildIncrementDistribution(probs);
    const next = new Array(targetCount + 1).fill(0);
    for (let count = 0; count <= targetCount; count += 1) {
      const baseProb = dist[count];
      if (baseProb <= 0) continue;
      for (let inc = 0; inc < incDist.length; inc += 1) {
        const to = Math.min(targetCount, count + inc);
        next[to] += baseProb * incDist[inc];
      }
    }
    dist = next;
  });

  return clamp01(dist[targetCount]);
}

function simulateSeasonEmpoweredAtLeastCDF(drawCount, targetCount) {
  const pool = getCurrentPool();
  const pBase = getBaseEmpoweredProbability(pool.poolConfig || []);
  if (pBase <= 0) return 0;
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  // dp[progress][countCapped]
  let dp = Array.from({ length: 500 }, () => new Array(targetCount + 1).fill(0));
  dp[0][0] = 1;

  for (let draw = 1; draw <= drawCount; draw += 1) {
    const next = Array.from({ length: 500 }, () => new Array(targetCount + 1).fill(0));
    for (let progress = 0; progress < 500; progress += 1) {
      const pAny = clamp01(getSeasonEmpoweredProbByCurrentProgress(progress));
      for (let cnt = 0; cnt <= targetCount; cnt += 1) {
        const base = dp[progress][cnt];
        if (base <= 0) continue;

        // 未中增能
        {
          let nextProgress = progress + 1;
          let nextCnt = cnt;
          if (nextProgress === 200) nextCnt = Math.min(targetCount, nextCnt + 1);
          if (nextProgress === 500) {
            nextCnt = Math.min(targetCount, nextCnt + 1);
            nextProgress = 0;
          }
          next[nextProgress][nextCnt] += base * (1 - pAny);
        }

        // 中增能
        {
          let nextProgress = progress + 1;
          let nextCnt = Math.min(targetCount, cnt + 1);
          if (nextProgress === 200) nextCnt = Math.min(targetCount, nextCnt + 1);
          if (nextProgress === 500) {
            nextCnt = Math.min(targetCount, nextCnt + 1);
            nextProgress = 0;
          }
          next[nextProgress][nextCnt] += base * pAny;
        }
      }
    }
    dp = next;
  }

  let cdf = 0;
  for (let progress = 0; progress < 500; progress += 1) {
    cdf += dp[progress][targetCount];
  }
  return clamp01(cdf);
}

function getEmpoweredAtLeastProbabilityByDrawCount(drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  const cacheKey = `${activePoolKey}|${drawCount}|${targetCount}`;
  if (empoweredCountProbabilityCache[cacheKey] != null) {
    return empoweredCountProbabilityCache[cacheKey];
  }

  const pool = getCurrentPool();
  let cdf = 0;
  if (isSeasonPool()) {
    cdf = simulateSeasonEmpoweredAtLeastCDF(drawCount, targetCount);
  } else if (isChainPool()) {
    cdf = calcChainEmpoweredAtLeastCDF(drawCount, targetCount);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else {
    const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
    cdf = calcBinomialAtLeast(drawCount, pAny, targetCount);
  }

  empoweredCountProbabilityCache[cacheKey] = clamp01(cdf);
  return empoweredCountProbabilityCache[cacheKey];
}

function getBeforeProgress(progress) {
  return Math.max(0, Math.floor(Number(progress) || 0) - 1);
}

function getSpecificCountAtLeastProbabilityByDrawCount(drawCount, targetName, targetCount) {
  const pool = getCurrentPool();
  const names = isChainPool() ? getEmpoweredStatNames() : pool.empoweredCards || [];
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (!names.length || drawCount <= 0 || !targetName || !names.includes(targetName)) return 0;

  const cacheKey = `${activePoolKey}|${targetName}|${drawCount}|${targetCount}|count`;
  if (specificCountProbabilityCache[cacheKey] != null) {
    return specificCountProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (pool.progressionType === "accumulated_target") {
    cdf = calcAccumulatedGuaranteeSpecificCountAtLeastCDF(pool, drawCount, targetCount);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount);
  } else {
    const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
    const pSpecific = names.length > 0 ? pAny / names.length : 0;
    cdf = calcBinomialAtLeast(drawCount, pSpecific, targetCount);
  }

  specificCountProbabilityCache[cacheKey] = clamp01(cdf);
  return specificCountProbabilityCache[cacheKey];
}

function getExceedPercentForSpecificByProgress(progress, targetName) {
  if (!targetName) return 100;
  const beforeProgress = getBeforeProgress(progress);
  const hitProb = getSpecificHitProbabilityByDrawCount(beforeProgress, targetName);
  return clamp01(1 - hitProb) * 100;
}

function getExceedPercentForSpecificCountByProgress(progress, targetName, targetCount) {
  const currentProgress = Math.max(0, Math.floor(Number(progress) || 0));
  const currentCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (!targetName) return 100;
  const probMore = getSpecificCountAtLeastProbabilityByDrawCount(
    currentProgress,
    targetName,
    currentCount + 1
  );
  return clamp01(1 - probMore) * 100;
}

function getExceedPercentForEmpoweredCountByProgress(progress, targetCount) {
  const currentProgress = Math.max(0, Math.floor(Number(progress) || 0));
  const currentCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  // 评价“比你多”的人：P(X > currentCount) = P(X >= currentCount + 1)
  const probMore = getEmpoweredAtLeastProbabilityByDrawCount(
    currentProgress,
    currentCount + 1
  );
  return clamp01(1 - probMore) * 100;
}

function getCurrentUniqueEmpoweredCount() {
  const names = getEmpoweredStatNames();
  let count = 0;
  names.forEach((name) => {
    if ((Number(state.empoweredCounts[name]) || 0) > 0) count += 1;
  });
  return count;
}

function simulateUniqueEmpoweredAtLeastCDF(progressCount, targetUniqueCount, runs = 8000) {
  const pool = getCurrentPool();
  const allNames = getEmpoweredStatNames();
  if (targetUniqueCount <= 0) return 1;
  if (progressCount <= 0 || allNames.length <= 0) return 0;
  if (targetUniqueCount > allNames.length) return 0;

  if (pool.progressionType === "accumulated_target") {
    if (targetUniqueCount > 1) return 0;
    return calcAccumulatedGuaranteeSpecificCDF(pool, progressCount);
  }

  const addRandomName = (setObj, candidateNames) => {
    if (!candidateNames || candidateNames.length <= 0) return;
    const picked = randomFromArray(candidateNames);
    if (picked) setObj.add(picked);
  };
  const addSelectNamePreferNew = (setObj, candidateNames) => {
    if (!candidateNames || candidateNames.length <= 0) return;
    const missing = candidateNames.filter((name) => !setObj.has(name));
    if (missing.length > 0) {
      setObj.add(missing[0]);
      return;
    }
    setObj.add(candidateNames[0]);
  };

  let hit = 0;
  for (let r = 0; r < runs; r += 1) {
    const got = new Set();

    if (isChainPool()) {
      let sideRemain = (pool.sidePoolCards || []).slice();
      const tiers = (pool.chainTiers || []).filter((t) => (t.tier || 0) <= progressCount);
      for (const tier of tiers) {
        const rewards = tier.rewards || [];
        for (const kind of rewards) {
          const parsed = parseChainRewardKind(kind, pool);
          if (!parsed) continue;
          const cards = getChainPoolCards(pool, parsed.poolKey);
          if (parsed.rewardType === "chance") {
            if (Math.random() < (parsed.chance || 0)) addRandomName(got, cards);
          } else if (parsed.rewardType === "random") {
            addRandomName(got, cards);
          } else if (parsed.rewardType === "select") {
            addSelectNamePreferNew(got, cards);
          } else if (parsed.rewardType === "box") {
            if (sideRemain.length > 0) {
              const idx = Math.floor(Math.random() * sideRemain.length);
              const name = sideRemain.splice(idx, 1)[0];
              if (name) got.add(name);
            }
          }
        }
      }
    } else if (isSeasonPool()) {
      let seasonProgress = 0;
      for (let draw = 1; draw <= progressCount; draw += 1) {
        const pAny = getSeasonEmpoweredProbByCurrentProgress(seasonProgress);
        if (Math.random() < pAny) addRandomName(got, pool.empoweredCards || []);
        seasonProgress += 1;
        if (seasonProgress === 200) {
          const missing = (pool.empoweredCards || []).filter((name) => !got.has(name));
          addRandomName(got, missing.length > 0 ? missing : (pool.empoweredCards || []));
        }
        if (seasonProgress === 500) {
          addSelectNamePreferNew(got, pool.empoweredCards || []);
          seasonProgress = 0;
        }
      }
    } else if (pool.progressionType === "accumulated_target") {
      const cap = getAccumulatedGuaranteeProgressCap(pool);
      for (let draw = 1; draw <= progressCount; draw += 1) {
        const pAny = getAccumulatedGuaranteeProbByCurrentProgress(draw - 1, pool);
        if (Math.random() < pAny) addRandomName(got, pool.empoweredCards || []);
        if (draw === cap) {
          const targetName = getAccumulatedGuaranteeConfig(pool)?.targetName || "";
          addSelectNamePreferNew(got, targetName ? [targetName] : (pool.empoweredCards || []));
        }
      }
    } else if (pool.progressionType === "exchange_badge") {
      const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
      const cap = getExchangeConfig().fixedSelect42 ? 420 : 470;
      const selectPool = getExchangeSelectPoolForCap(pool, cap);
      for (let draw = 1; draw <= progressCount; draw += 1) {
        if (Math.random() < pAny) addRandomName(got, pool.empoweredCards || []);
        if (draw === cap) {
          addSelectNamePreferNew(got, selectPool);
        }
      }
    } else {
      const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
      const milestoneByPull = new Map(
        (pool.milestones || []).map((m) => [Number(m.pulls || 0), m])
      );
      const selectedCfg = pool.poolConfig.find((p) => p.type === "selected");
      const hasSelected = Boolean(selectedCfg);
      for (let draw = 1; draw <= progressCount; draw += 1) {
        if (Math.random() < pAny) addRandomName(got, pool.empoweredCards || []);
        const reward = milestoneByPull.get(draw);
        if (!reward) continue;
        if (reward.type === "empowered_chance") {
          if (pool.bonusHitMode === "empowered_only") {
            if (Math.random() < (reward.chance || 0)) addRandomName(got, pool.empoweredCards || []);
          } else {
            const empWeight = (pool.empoweredCards || []).length;
            const selWeight = hasSelected ? Number(pool.selectedCardCountForBonus || 0) : 0;
            const totalWeight = empWeight + selWeight;
            const empHitProb =
              totalWeight > 0 ? (reward.chance || 0) * (empWeight / totalWeight) : 0;
            if (Math.random() < empHitProb) addRandomName(got, pool.empoweredCards || []);
          }
        } else if (reward.type === "empowered_random") {
          addRandomName(got, pool.empoweredCards || []);
        } else if (reward.type === "empowered_select") {
          addSelectNamePreferNew(got, pool.empoweredCards || []);
        } else if (reward.type === "exchange_target_chance") {
          if (Math.random() < (reward.chance || 0)) {
            addSelectNamePreferNew(got, reward.targetName ? [reward.targetName] : (pool.empoweredCards || []));
          }
        }
      }
    }

    if (got.size >= targetUniqueCount) hit += 1;
  }
  return clamp01(hit / runs);
}

function getUniqueEmpoweredAtLeastProbabilityByProgress(progressCount, targetUniqueCount) {
  progressCount = Math.max(0, Math.floor(Number(progressCount) || 0));
  targetUniqueCount = Math.max(0, Math.floor(Number(targetUniqueCount) || 0));
  if (targetUniqueCount <= 0) return 1;
  if (progressCount <= 0) return 0;

  const cacheKey = `${activePoolKey}|${progressCount}|${targetUniqueCount}|unique`;
  if (uniqueEmpoweredCountProbabilityCache[cacheKey] != null) {
    return uniqueEmpoweredCountProbabilityCache[cacheKey];
  }
  const cdf = simulateUniqueEmpoweredAtLeastCDF(progressCount, targetUniqueCount);
  uniqueEmpoweredCountProbabilityCache[cacheKey] = cdf;
  return cdf;
}

function getExceedPercentForUniqueEmpoweredCountByProgress(progress, uniqueCount) {
  const currentProgress = Math.max(0, Math.floor(Number(progress) || 0));
  const currentUniqueCount = Math.max(0, Math.floor(Number(uniqueCount) || 0));
  const probMore = getUniqueEmpoweredAtLeastProbabilityByProgress(
    currentProgress,
    currentUniqueCount + 1
  );
  return clamp01(1 - probMore) * 100;
}

function consumePendingFavoredHitEvent() {
  const event = pendingFavoredHitEvent;
  pendingFavoredHitEvent = null;
  return event;
}

function showFavoredHitAnimationIfNeeded() {
  const event = consumePendingFavoredHitEvent();
  if (!event) return;
  const animationMode = getCurrentAnimationMode();
  if (animationMode === ANIMATION_MODES.NONE) return;
  if (event.kind === "all_empowered") {
    openCinematicHitModal(event);
    return;
  }

  const hitProb = getSpecificHitProbabilityByDrawCount(
    getBeforeProgress(event.totalDraws || 0),
    event.targetName || ""
  );
  const exceedPercent = (1 - hitProb) * 100;
  openCinematicHitModal({
    kind: "favored_only",
    targetName: event.targetName,
    totalDraws: event.totalDraws,
    exceedPercent,
    progressUnit: event.progressUnit || "draw",
    isFavored: true,
  });
}

function getExpectedDrawMetrics() {
  const pool = getCurrentPool();
  const empoweredCount = (pool.empoweredCards || []).length;
  if (!empoweredCount) {
    return null;
  }

  if (isChainPool()) {
    const chainMetrics = calcChainExpectedTierMetrics(pool);
    return {
      chainMainSpecificTier: chainMetrics.mainSpecificTier,
      chainSideSpecificTier: chainMetrics.sideSpecificTier,
    };
  }

  if (isSeasonPool()) {
    const base = calcSeasonBaseExpected(0, empoweredCount);
    const withGift = calcSeasonWithGiftExpected(0, empoweredCount, {
      p200: false,
      p500: false,
    });
    const refTarget = (pool.empoweredCards || [])[0] || "";
    const singleTargetMetrics = refTarget
      ? getFavoredSetExpectedMetrics([refTarget])
      : null;
    return {
      baseAny: base.any,
      baseSpecific: base.specific,
      giftAny: withGift.any,
      giftSpecific:
        singleTargetMetrics && Number(singleTargetMetrics.allExpected) > 0
          ? singleTargetMetrics.allExpected
          : withGift.specific,
    };
  }

  if (isAccumulatedGuaranteePool()) {
    const baseAny = getBaseEmpoweredProbability(pool.poolConfig || []) > 0
      ? 1 / getBaseEmpoweredProbability(pool.poolConfig || [])
      : 0;
    const withGift = calcAccumulatedGuaranteeExpected(pool);
    return {
      baseAny,
      baseSpecific: baseAny,
      giftAny: withGift.any,
      giftSpecific: withGift.specific,
    };
  }

  const empoweredProb = getBaseEmpoweredProbability(pool.poolConfig || []);
  const baseAny = empoweredProb > 0 ? 1 / empoweredProb : 0;
  const baseSpecific = empoweredProb > 0 ? 1 / (empoweredProb / empoweredCount) : 0;

  if (pool.progressionType === "milestone") {
    const withGift = calcMilestoneWithGiftExpected(pool, empoweredCount);
    return {
      baseAny,
      baseSpecific,
      giftAny: withGift.any,
      giftSpecific: withGift.specific,
    };
  }

  if (pool.progressionType === "exchange_badge") {
    const withGift = calcExchangeWithGiftExpected(pool);
    return {
      baseAny,
      baseSpecific,
      giftAny: withGift.any,
      giftSpecific: withGift.specific,
    };
  }

  return { baseAny, baseSpecific, giftAny: baseAny, giftSpecific: baseSpecific };
}

function renderExpectedDrawInfo() {
  const expectedDrawInfo = document.getElementById("expectedDrawInfo");
  if (!expectedDrawInfo) return;
  expectedDrawInfo.innerHTML = "";
}

function getFavoredExpectedSpecific() {
  const metrics = getExpectedDrawMetrics();
  if (!metrics) return 0;
  if (
    isSeasonPool() ||
    isAccumulatedGuaranteePool() ||
    getCurrentPool().progressionType === "milestone" ||
    getCurrentPool().progressionType === "exchange_badge"
  ) {
    return metrics.giftSpecific;
  }
  return metrics.baseSpecific;
}

function renderFavExpectedInfo() {
  const info = document.getElementById("favExpectedInfo");
  const chainInfo = document.getElementById("chainFavExpectedInfo");
  if (info) info.textContent = "";
  if (chainInfo) chainInfo.textContent = "";

  const selectedNames = getCurrentFavoredTargetNames();
  if (!selectedNames.length) return;
  const setMetrics = getFavoredSetExpectedMetrics(selectedNames);
  if (!setMetrics) return;
  const toDisplayValue = (expectedValue) => {
    if (
      isChainPool() &&
      (Number(expectedValue) || 0) > (Number(setMetrics.cap) || 0)
    ) {
      return `超${setMetrics.cap}${setMetrics.unit}`;
    }
    return `${formatExpectedDrawValue(expectedValue)}${setMetrics.unit}`;
  };
  const anyText = toDisplayValue(setMetrics.anyExpected);
  const allText = toDisplayValue(setMetrics.allExpected);
  const extra = `（${setMetrics.cap}${setMetrics.unit}内集齐概率 <span class="expected-value">${(
    (setMetrics.allProbAtCap || 0) * 100
  ).toFixed(2)}%</span>）`;
  const html =
    `期望${isChainPool() ? "档位" : "抽数"}：任意心仪 <span class="expected-value">${anyText}</span>；` +
    `集齐心仪 <span class="expected-value">${allText}</span>${extra}`;

  if (isChainPool()) {
    if (!chainInfo) return;
    chainInfo.innerHTML = html;
    return;
  }

  if (!info) return;
  info.innerHTML = html;
}

function openFavHitModal(event) {
  const modal = document.getElementById("favHitModal");
  const title = document.querySelector("#favHitModal .fav-hit-title");
  const line1 = document.getElementById("favHitLine1");
  const line2 = document.getElementById("favHitLine2");
  const line3 = document.getElementById("favHitLine3");
  if (!modal || !line1 || !line2 || !line3) return;

  favHitLineTimers.forEach((id) => window.clearTimeout(id));
  favHitLineTimers = [];

  line1.classList.remove("show");
  line2.classList.remove("show");
  line3.classList.remove("show");

  const queueTypewriterLine = (el, text, startDelay = 0, charDelay = 150, className = "") => {
    if (!el) return 0;
    const content = String(text || "");
    favHitLineTimers.push(
      window.setTimeout(() => {
        el.classList.add("show");
        if (className) {
          el.innerHTML = `<span class="${className}"></span>`;
        } else {
          el.textContent = "";
        }
      }, startDelay)
    );
    for (let i = 0; i < content.length; i += 1) {
      favHitLineTimers.push(
        window.setTimeout(() => {
          if (className) {
            const target = el.querySelector(`.${className}`);
            if (target) target.textContent += content[i];
          } else {
            el.textContent += content[i];
          }
        }, startDelay + (i + 1) * charDelay)
      );
    }
    return startDelay + content.length * charDelay;
  };

  if (event.kind === "all_empowered") {
    if (title) title.textContent = "出货啦！";
    line1.innerHTML = "出的是~";
    line2.innerHTML = "";
    const progressUnit = event.progressUnit === "tier" ? "档" : "抽";
    line3.innerHTML =
      (event.isFavored ? "<span class=\"fav-hit-inline-note\">恭喜你获得心仪球员！</span>" : "") +
      `你已在 <span class="expected-value">${event.totalDraws}</span> ${progressUnit}内获得了 ` +
      `<span class="expected-value">${event.empoweredCount}</span> 个增能球员，` +
      `超过了 <span class="expected-value">${event.exceedPercent.toFixed(2)}%</span> 的玩家！`;

    modal.classList.remove("hidden");
    const nameLineDoneAt = queueTypewriterLine(
      line2,
      `${event.targetName}！！！`,
      900,
      320,
      "expected-value"
    );
    favHitLineTimers.push(
      window.setTimeout(() => line3.classList.add("show"), nameLineDoneAt + 420)
    );
    favHitLineTimers.push(window.setTimeout(() => line1.classList.add("show"), 80));
    return;
  } else {
    if (title) title.textContent = "出货啦！";
    line1.innerHTML = `恭喜你获得 <span class="expected-value">${event.targetName}</span>！！！`;
    const progressUnit = event.progressUnit === "tier" ? "档" : "抽";
    line2.innerHTML = `仅用 <span class="expected-value">${event.totalDraws}</span> ${progressUnit}`;
    line3.innerHTML = `超过了 <span class="expected-value">${event.exceedPercent.toFixed(2)}%</span> 的玩家！`;
  }

  modal.classList.remove("hidden");

  const hasLine2 = line2.textContent.trim().length > 0;
  const line2Delay = hasLine2 ? 620 : 0;
  const line3Delay = hasLine2 ? 1120 : 620;
  favHitLineTimers.push(
    window.setTimeout(() => line1.classList.add("show"), 80),
    window.setTimeout(() => {
      if (hasLine2) {
        line2.classList.add("show");
      }
    }, line2Delay),
    window.setTimeout(() => line3.classList.add("show"), line3Delay)
  );
}

function closeFavHitModal() {
  const modal = document.getElementById("favHitModal");
  if (!modal) return;
  favHitLineTimers.forEach((id) => window.clearTimeout(id));
  favHitLineTimers = [];
  modal.classList.add("hidden");
  if (continueOpenAllRewards && state.rewards.length > 0) {
    openAllRewards();
    return;
  }
  maybeAutoOpenRewards();
}

function isFavHitModalOpen() {
  const modal = document.getElementById("favHitModal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function isCinematicModalOpen() {
  const modal = document.getElementById("cinematicDemoModal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function isAnyHitModalOpen() {
  return isFavHitModalOpen() || isCinematicModalOpen();
}

function getTimestamp() {
  const d = new Date();
  return d.toLocaleTimeString("zh-CN", { hour12: false });
}

function addKeyMoment(text) {
  if (!text) return;
  if (!Array.isArray(state.keyMoments)) {
    state.keyMoments = [];
  }
  const marker = isChainPool()
    ? `第${state.chainTierProgress || 0}档`
    : `第${state.totalPulls || 0}抽`;
  state.keyMoments.unshift({
    time: getTimestamp(),
    text,
    marker,
  });
  if (state.keyMoments.length > 40) {
    state.keyMoments = state.keyMoments.slice(0, 40);
  }
}

function closeMomentReplayModal() {
  const modal = document.getElementById("momentReplayModal");
  const text = document.getElementById("momentReplayText");
  momentReplayTimers.forEach((id) => window.clearTimeout(id));
  momentReplayTimers = [];
  if (modal) modal.classList.add("hidden");
  if (text) text.textContent = "";
}

function openMomentReplayModal() {
  const modal = document.getElementById("momentReplayModal");
  const text = document.getElementById("momentReplayText");
  if (!modal || !text) return;
  const moments = (state.keyMoments || []).slice(0, 8).reverse();
  if (!moments.length) {
    text.textContent = "本轮还没有出货节点，先抽几发试试。";
    modal.classList.remove("hidden");
    return;
  }

  closeMomentReplayModal();
  modal.classList.remove("hidden");
  text.textContent = "";

  let delay = 120;
  moments.forEach((m) => {
    const line = `${m.time} · ${m.text}`;
    momentReplayTimers.push(
      window.setTimeout(() => {
        text.textContent += (text.textContent ? "\n" : "") + line;
      }, delay)
    );
    delay += 520;
  });
}

function resetEmpoweredDetailPanel() {
  const container = document.getElementById("empoweredDetailContent");
  const hint = document.getElementById("empoweredDetailHint");
  if (!container || !hint) return;
  container.innerHTML = "";
  hint.textContent = "点击上表中任意一行，可查看该增能卡的出卡记录。";
}

function updatePoolHeader() {
  const nameSpan = document.getElementById("poolNameText");
  if (nameSpan) {
    const pool = getCurrentPool();
    nameSpan.textContent = pool.displayName || pool.name;
  }

  const poolTypeChoice = document.getElementById("poolTypeChoice");
  if (poolTypeChoice) {
    poolTypeChoice.value = getCurrentPool().poolType || "carnival_gift";
  }

  const poolSwitchChoice = document.getElementById("poolSwitchChoice");
  if (poolSwitchChoice) {
    const activeGroup = getCurrentPool().switchGroup || "";
    const options = Array.from(poolSwitchChoice.options || []);
    const matched = options.find(
      (opt) =>
        opt.value === activePoolKey ||
        (activeGroup && (POOLS[opt.value]?.switchGroup || "") === activeGroup)
    );
    if (matched) {
      poolSwitchChoice.value = matched.value;
    }
  }
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString("zh-CN");
}

function renderModeInfo() {
  const modeSelect = document.getElementById("modeSwitchSelect");
  const skinModeSelect = document.getElementById("skinModeSelect");
  const realModeInfo = document.getElementById("realModeInfo");
  const remainingGoldTop = document.getElementById("remainingGoldTop");
  const globalSpentGoldTop = document.getElementById("globalSpentGoldTop");
  const totalRechargeTop = document.getElementById("totalRechargeTop");

  if (modeSelect) {
    modeSelect.value = activeModeKey;
  }
  if (skinModeSelect) {
    skinModeSelect.value = activeSkinKey;
  }
  if (realModeInfo) {
    if (activeModeKey === REAL_MODE_KEY) {
      realModeInfo.classList.remove("hidden");
    } else {
      realModeInfo.classList.add("hidden");
    }
  }
  if (remainingGoldTop) {
    const remaining = realModeMeta.remainingGold == null ? 0 : realModeMeta.remainingGold;
    remainingGoldTop.textContent = formatNumber(remaining);
  }
  if (globalSpentGoldTop) {
    globalSpentGoldTop.textContent = formatNumber(realModeMeta.totalSpentGold);
  }
  if (totalRechargeTop) {
    totalRechargeTop.textContent = formatNumber(realModeMeta.totalRechargeRmb);
  }
}

function applySkinModeToDocument() {
  const body = document.body;
  if (!body) return;
  body.classList.remove("theme-light", "theme-dark");
  // Force a repaint so fixed background layers update immediately.
  void body.offsetWidth;
  body.classList.add(activeSkinKey === "dark" ? "theme-dark" : "theme-light");
}

function setSkinMode(modeKey) {
  if (!VALID_SKIN_MODES.includes(modeKey)) return;
  activeSkinKey = modeKey;
  applySkinModeToDocument();
  try {
    window.localStorage.setItem(SKIN_MODE_STORAGE_KEY, modeKey);
  } catch (_) {}
  renderModeInfo();
}

function loadSkinMode() {
  let stored = null;
  try {
    stored = window.localStorage.getItem(SKIN_MODE_STORAGE_KEY);
  } catch (_) {}
  if (VALID_SKIN_MODES.includes(stored)) {
    activeSkinKey = stored;
  } else {
    activeSkinKey = "light";
  }
  applySkinModeToDocument();
}

function canAffordPulls(count) {
  if (activeModeKey !== REAL_MODE_KEY) return true;
  const remaining = realModeMeta.remainingGold || 0;
  return remaining >= count * GOLD_PER_PULL;
}

function spendGoldForPulls(count) {
  if (activeModeKey !== REAL_MODE_KEY) return true;
  const cost = count * GOLD_PER_PULL;
  if (!spendGoldAmount(cost)) {
    openInsufficientGoldModal();
    return false;
  }
  return true;
}

function spendGoldAmount(cost) {
  if (activeModeKey !== REAL_MODE_KEY) return true;
  const need = Number(cost);
  if (!Number.isFinite(need) || need <= 0) return true;
  const remaining = realModeMeta.remainingGold || 0;
  if (remaining < need) {
    return false;
  }
  realModeMeta.remainingGold = remaining - need;
  realModeMeta.totalSpentGold += need;
  return true;
}

function switchPool(targetPoolKey) {
  if (!POOLS[targetPoolKey] || targetPoolKey === activePoolKey) return;
  activePoolKey = targetPoolKey;
  state = getStateForModeAndPool(activeModeKey, activePoolKey);
  ensureChainPoolStateInitialized();
  updatePoolHeader();
  resetEmpoweredDetailPanel();
  renderAll();
}

function switchMode(targetModeKey) {
  if (!["unlimited", REAL_MODE_KEY].includes(targetModeKey)) return false;
  if (targetModeKey === activeModeKey) return true;

  if (targetModeKey === REAL_MODE_KEY && realModeMeta.remainingGold == null) {
    return false;
  }

  activeModeKey = targetModeKey;
  state = getStateForModeAndPool(activeModeKey, activePoolKey);
  ensureChainPoolStateInitialized();
  // 切换模式后，清空当前模式当前卡池的抽卡记录
  state.resultsHistory = [];
  Object.keys(state.empoweredDetails).forEach((name) => {
    state.empoweredDetails[name] = [];
  });
  resetEmpoweredDetailPanel();
  renderAll();
  return true;
}

function getPoolKeysByType(poolType) {
  return POOL_KEYS.filter((key) => (POOLS[key].poolType || "carnival_gift") === poolType);
}

function getPoolSwitchChoicesByType(poolType) {
  const keys = getPoolKeysByType(poolType);
  const seenGroups = new Set();
  const entries = [];

  keys.forEach((key) => {
    const pool = POOLS[key];
    const group = pool.switchGroup || "";
    if (group) {
      if (seenGroups.has(group)) return;
      seenGroups.add(group);
    }
    entries.push({
      value: key,
      label: pool.displayName || pool.name,
      group,
    });
  });

  return entries;
}

function populatePoolTypeChoices() {
  const poolTypeChoice = document.getElementById("poolTypeChoice");
  if (!poolTypeChoice) return;

  const currentType = getCurrentPool().poolType || "carnival_gift";
  poolTypeChoice.innerHTML = "";
  Object.entries(POOL_TYPE_LABELS).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    poolTypeChoice.appendChild(option);
  });
  poolTypeChoice.value = currentType;
}

function populatePoolSwitchChoicesByType(poolType) {
  const poolSwitchChoice = document.getElementById("poolSwitchChoice");
  if (!poolSwitchChoice) return;

  poolSwitchChoice.innerHTML = "";
  const entries = getPoolSwitchChoicesByType(poolType);
  entries.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    poolSwitchChoice.appendChild(option);
  });
  const activeGroup = getCurrentPool().switchGroup || "";
  const activeEntry = entries.find(
    (entry) => entry.value === activePoolKey || (activeGroup && entry.group === activeGroup)
  );
  if (activeEntry) {
    poolSwitchChoice.value = activeEntry.value;
  }
}

function onPoolTypeChoiceChange() {
  const poolTypeChoice = document.getElementById("poolTypeChoice");
  const poolSwitchChoice = document.getElementById("poolSwitchChoice");
  if (!poolTypeChoice) return;
  const type = poolTypeChoice.value;
  populatePoolSwitchChoicesByType(type);

  const entries = getPoolSwitchChoicesByType(type);
  if (!entries.length) return;

  const activeGroup = getCurrentPool().switchGroup || "";
  const activeEntry = entries.find(
    (entry) => entry.value === activePoolKey || (activeGroup && entry.group === activeGroup)
  );
  const nextKey = activeEntry ? activePoolKey : entries[0].value;
  if (poolSwitchChoice) {
    poolSwitchChoice.value = activeEntry ? activeEntry.value : nextKey;
  }
  if (nextKey !== activePoolKey) {
    switchPool(nextKey);
  }
}

function onPoolSwitchChoiceChange() {
  const poolSwitchChoice = document.getElementById("poolSwitchChoice");
  if (!poolSwitchChoice) return;

  const targetKey = poolSwitchChoice.value;
  if (!targetKey || targetKey === activePoolKey) {
    return;
  }

  switchPool(targetKey);
}

function openRechargeModal() {
  if (activeModeKey !== REAL_MODE_KEY) return;
  const modal = document.getElementById("rechargeModal");
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeRechargeModal() {
  const modal = document.getElementById("rechargeModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function openInsufficientGoldModal() {
  const modal = document.getElementById("insufficientGoldModal");
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeInsufficientGoldModal() {
  const modal = document.getElementById("insufficientGoldModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function openBadgeInsufficientModal(need, current) {
  const modal = document.getElementById("badgeInsufficientModal");
  const text = document.getElementById("badgeInsufficientText");
  if (!modal || !text) return;
  text.textContent = `徽章不够哦，需要 ${need} 个，当前仅 ${current} 个。`;
  modal.classList.remove("hidden");
}

function closeBadgeInsufficientModal() {
  const modal = document.getElementById("badgeInsufficientModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function getFallbackPlayerImageDataUrl() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="720">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/>` +
    `</linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `<text x="50%" y="46%" text-anchor="middle" fill="#93c5fd" font-size="34" font-family="sans-serif">球员图片</text>` +
    `<text x="50%" y="54%" text-anchor="middle" fill="#64748b" font-size="28" font-family="sans-serif">未找到资源</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function setPlayerImageFromAssets(imgEl, playerName) {
  if (!imgEl) return;
  const fallback = getFallbackPlayerImageDataUrl();
  const name = (playerName || "").trim();
  if (!name) {
    imgEl.src = fallback;
    return;
  }
  const exts = ["webp", "png", "jpg", "jpeg"];
  const encodedName = encodeURIComponent(name);
  let idx = 0;
  const tryNext = () => {
    if (idx >= exts.length) {
      imgEl.onerror = null;
      imgEl.src = fallback;
      return;
    }
    const ext = exts[idx];
    idx += 1;
    imgEl.onerror = () => {
      tryNext();
    };
    imgEl.src = `assets/${encodedName}.${ext}`;
  };
  tryNext();
}

function setNamedImageFromFolder(imgEl, folder, name, fallback = "") {
  if (!imgEl) return;
  const cleanName = (name || "").trim();
  if (!cleanName) {
    if (fallback) imgEl.src = fallback;
    return;
  }
  const exts = ["webp", "png", "jpg", "jpeg"];
  const encodedName = encodeURIComponent(cleanName);
  let idx = 0;
  const tryNext = () => {
    if (idx >= exts.length) {
      imgEl.onerror = null;
      if (fallback) imgEl.src = fallback;
      return;
    }
    const ext = exts[idx];
    idx += 1;
    imgEl.onerror = () => {
      tryNext();
    };
    imgEl.src = `${folder}/${encodedName}.${ext}`;
  };
  tryNext();
}

function shouldUseCinematicHitAnimation() {
  return true;
}

function getCinematicPlayerMeta(poolKey, playerName) {
  const poolMeta = POOL_PLAYER_META[poolKey] || {};
  const item = poolMeta[playerName];
  if (item) {
    return { typeName: item.type || "史诗", position: item.position || "中锋" };
  }
  return { typeName: "史诗", position: "中锋" };
}

function getCinematicPlayerImageFolder(poolKey) {
  return POOL_CINEMATIC_ASSET_FOLDERS[poolKey] || ["assets"];
}

function setPlayerImageByPool(imgEl, poolKey, playerName) {
  if (!imgEl) return;
  const folders = getCinematicPlayerImageFolder(poolKey);
  const fallback = getFallbackPlayerImageDataUrl();
  const cleanName = String(playerName || "").trim();
  if (!cleanName) {
    imgEl.src = fallback;
    return;
  }
  const folderList = Array.isArray(folders) ? folders.slice() : [String(folders)];
  if (!folderList.includes("assets")) folderList.push("assets");
  const exts = ["webp", "png", "jpg", "jpeg"];
  const encodedName = encodeURIComponent(cleanName);
  let folderIdx = 0;
  let extIdx = 0;
  const tryNext = () => {
    if (folderIdx >= folderList.length) {
      imgEl.onerror = null;
      imgEl.src = fallback;
      return;
    }
    const folder = folderList[folderIdx];
    const ext = exts[extIdx];
    imgEl.onerror = () => {
      extIdx += 1;
      if (extIdx >= exts.length) {
        extIdx = 0;
        folderIdx += 1;
      }
      tryNext();
    };
    imgEl.src = `${folder}/${encodedName}.${ext}`;
  };
  tryNext();
}

function getProgressUnitText(progressUnit) {
  return progressUnit === "tier" ? "档" : "抽";
}

function buildCinematicStatsLine(ctx) {
  const unitText = getProgressUnitText(ctx.progressUnit);
  if (ctx.kind === "all_empowered") {
    return (
      `你已在 <span class="expected-value">${ctx.totalDraws}</span> ${unitText}内获得了 ` +
      `<span class="expected-value">${ctx.empoweredCount}</span> 个增能球员，` +
      `超过了 <span class="expected-value">${ctx.exceedPercent.toFixed(2)}%</span> 的玩家！`
    );
  }
  return (
    `仅用 <span class="expected-value">${ctx.totalDraws}</span> ${unitText}，` +
    `超过了 <span class="expected-value">${ctx.exceedPercent.toFixed(2)}%</span> 的玩家！`
  );
}

function openCinematicDemoModal(previewType = "史诗") {
  const modal = document.getElementById("cinematicDemoModal");
  const stage = modal ? modal.querySelector(".cinematic-stage") : null;
  const btnCinematicClose = document.getElementById("btnCinematicClose");
  if (!modal || !stage) return;
  cinematicDemoPreviewType = previewType || "史诗";
  modal.classList.remove("hidden");
  if (btnCinematicClose) {
    btnCinematicClose.textContent = "确认出货！";
  }
  replayCinematicDemoModal({ mode: "preview", previewType: cinematicDemoPreviewType });
}

function openCinematicHitModal(event) {
  if (!event || !event.targetName) return;
  const modal = document.getElementById("cinematicDemoModal");
  const stage = modal ? modal.querySelector(".cinematic-stage") : null;
  const btnCinematicClose = document.getElementById("btnCinematicClose");
  if (!modal || !stage) return;
  modal.classList.remove("hidden");
  if (btnCinematicClose) {
    btnCinematicClose.textContent = "确认出货！";
  }
  replayCinematicDemoModal({ mode: "live", event });
}

function openLightningLabModal() {
  const modal = document.getElementById("lightningLabModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  replayLightningLab();
}

function replayLightningLab() {
  const stage = document.getElementById("lightningLabStage");
  if (!stage) return;
  stage.classList.remove("play");
  void stage.offsetWidth;
  stage.classList.add("play");
}

function closeLightningLabModal() {
  const modal = document.getElementById("lightningLabModal");
  const stage = document.getElementById("lightningLabStage");
  if (stage) {
    stage.classList.remove("play");
  }
  if (!modal) return;
  modal.classList.add("hidden");
}

function openTurtleLabModal() {
  const modal = document.getElementById("turtleLabModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  replayTurtleLab();
}

function replayTurtleLab() {
  const stage = document.getElementById("turtleLabStage");
  if (!stage) return;
  stage.classList.remove("play");
  void stage.offsetWidth;
  stage.classList.add("play");
}

function closeTurtleLabModal() {
  const modal = document.getElementById("turtleLabModal");
  const stage = document.getElementById("turtleLabStage");
  if (stage) {
    stage.classList.remove("play");
  }
  if (!modal) return;
  modal.classList.add("hidden");
}

function finishCinematicDemoInstantly() {
  const modal = document.getElementById("cinematicDemoModal");
  const stage = modal ? modal.querySelector(".cinematic-stage") : null;
  const ownedInfo = document.getElementById("cinematicOwnedInfo");
  const line1 = document.getElementById("cinematicLine1");
  const line2 = document.getElementById("cinematicLine2");
  const line3 = document.getElementById("cinematicLine3");
  const line4 = document.getElementById("cinematicLine4");
  const line5 = document.getElementById("cinematicLine5");
  const line6 = document.getElementById("cinematicLine6");
  const ctx = cinematicDemoContext;
  if (!modal || !stage || !ctx) return;

  cinematicDemoTimers.forEach((id) => window.clearTimeout(id));
  cinematicDemoTimers = [];

  line1.innerHTML = "<span class=\"expected-value\">出货啦！</span>";
  line2.innerHTML = `类型是~ <span class="cinematic-line-name">${ctx.targetTypeName}！</span>`;
  line3.innerHTML = `注册位置是~ <span class="cinematic-line-name">${ctx.targetPosition}！</span>`;
  line4.innerHTML = `他就是！ <span class="cinematic-line-name">${ctx.targetPlayerName}！！！</span>`;
  line5.innerHTML = ctx.isFavored ? "恭喜你获得心仪球员！" : "";
  line6.innerHTML = buildCinematicStatsLine(ctx);

  [line1, line2, line3, line4, line6].forEach((line) => {
    if (line) line.classList.add("show");
  });
  if (line5) {
    if (ctx.isFavored) {
      line5.classList.add("show");
    } else {
      line5.classList.remove("show");
    }
  }

  if (ownedInfo) {
    ownedInfo.classList.add("show");
  }

  stage.classList.add("finish");
  cinematicDemoDone = true;
}

function replayCinematicDemoModal(options = {}) {
  const modal = document.getElementById("cinematicDemoModal");
  const stage = modal ? modal.querySelector(".cinematic-stage") : null;
  const playerImg = document.getElementById("cinematicPlayerImage");
  const peekImg = document.getElementById("cinematicPeekImage");
  const typeDisplayImg = document.getElementById("cinematicTypeDisplayImage");
  const ownedInfo = document.getElementById("cinematicOwnedInfo");
  const btnCinematicClose = document.getElementById("btnCinematicClose");
  if (!modal || !stage) return;
  const line1 = document.getElementById("cinematicLine1");
  const line2 = document.getElementById("cinematicLine2");
  const line3 = document.getElementById("cinematicLine3");
  const line4 = document.getElementById("cinematicLine4");
  const line5 = document.getElementById("cinematicLine5");
  const line6 = document.getElementById("cinematicLine6");

  cinematicDemoTimers.forEach((id) => window.clearTimeout(id));
  cinematicDemoTimers = [];
  cinematicDemoDone = false;
  stage.classList.remove("finish");
  stage.classList.remove("peek-fx-st", "peek-fx-epic", "peek-fx-bt");
  if (btnCinematicClose) {
    btnCinematicClose.textContent = "确认出货！";
  }

  [line1, line2, line3, line4, line5, line6].forEach((line) => {
    if (!line) return;
    line.textContent = "";
    line.innerHTML = "";
    line.classList.remove("show");
  });
  if (ownedInfo) {
    ownedInfo.classList.remove("show");
  }
  stage.classList.remove("play");
  const isLiveEvent = Boolean(options && options.mode === "live" && options.event);
  const event = isLiveEvent ? options.event : null;
  const targetPlayerName = isLiveEvent
    ? String(event.targetName || "").trim() || "克鲁伊夫"
    : "克鲁伊夫";
  const meta = getCinematicPlayerMeta(activePoolKey, targetPlayerName);
  const targetTypeName = isLiveEvent
    ? meta.typeName
    : (options.previewType || cinematicDemoPreviewType || "史诗");
  const targetPosition = isLiveEvent ? meta.position : "中锋";
  const isFavored = isLiveEvent ? Boolean(event.isFavored || event.kind === "favored_only") : true;
  const kind = isLiveEvent ? event.kind || "favored_only" : "all_empowered";
  const totalDraws = isLiveEvent ? Math.max(0, Number(event.totalDraws) || 0) : 123;
  const empoweredCount = isLiveEvent ? Math.max(1, Number(event.empoweredCount) || 1) : 2;
  const exceedPercent = isLiveEvent
    ? clamp01((Number(event.exceedPercent) || 0) / 100) * 100
    : 87.65;
  const progressUnit = isLiveEvent ? (event.progressUnit || "draw") : "draw";
  const normalizedType = String(targetTypeName || "").trim();
  if (normalizedType === "史诗") {
    stage.classList.add("peek-fx-epic");
  } else if (normalizedType === "BT") {
    stage.classList.add("peek-fx-bt");
  } else {
    stage.classList.add("peek-fx-st");
  }
  cinematicDemoContext = {
    targetPlayerName,
    targetTypeName,
    targetPosition,
    isFavored,
    kind,
    totalDraws,
    empoweredCount,
    exceedPercent,
    progressUnit,
    isLiveEvent,
    rawEvent: isLiveEvent ? { ...event } : null,
    previewType: isLiveEvent ? null : targetTypeName,
  };
  if (ownedInfo) {
    const ownedCount = Math.max(0, Number(state.empoweredCounts[targetPlayerName]) || 0);
    ownedInfo.textContent = ownedCount <= 1 ? "首次获得" : `第 ${ownedCount} 张`;
  }
  setNamedImageFromFolder(typeDisplayImg, "assets/types", targetTypeName, "");
  if (isLiveEvent) {
    setPlayerImageByPool(playerImg, activePoolKey, targetPlayerName);
    setPlayerImageByPool(peekImg, activePoolKey, targetPlayerName);
  } else {
    setPlayerImageFromAssets(playerImg, targetPlayerName);
    setPlayerImageFromAssets(peekImg, targetPlayerName);
  }
  const schedule = (delay, fn) => {
    cinematicDemoTimers.push(window.setTimeout(fn, delay));
  };
  const showLine = (el, html, delay) => {
    if (!el) return;
    schedule(delay, () => {
      el.innerHTML = html;
      el.classList.add("show");
    });
  };
  const showLineWithPausedHighlight = (el, prefix, highlightText, delayStart, delayHighlight, charDelay = 180) => {
    if (!el) return;
    schedule(delayStart, () => {
      el.innerHTML = `${prefix}<span class="cinematic-line-name"></span>`;
      el.classList.add("show");
    });
    for (let i = 0; i < highlightText.length; i += 1) {
      schedule(delayHighlight + i * charDelay, () => {
        const holder = el.querySelector(".cinematic-line-name");
        if (holder) holder.textContent += highlightText[i];
      });
    }
    return delayHighlight + highlightText.length * charDelay;
  };

  stage.classList.remove("play");
  void stage.offsetWidth;
  stage.classList.add("play");
  showLine(line1, "<span class=\"expected-value\">出货啦！</span>", 280);
  // 关键词出现与右侧图片节点严格对齐：
  // 类型 2.3s（类型图），位置 5.1s（开角图），名字 7.9s（完整图）
  showLineWithPausedHighlight(
    line2,
    "类型是~ ",
    `${targetTypeName}！`,
    1200,
    2300,
    200
  );
  showLineWithPausedHighlight(
    line3,
    "注册位置是~ ",
    `${targetPosition}！`,
    4000,
    5100,
    200
  );
  const line4DoneAt = showLineWithPausedHighlight(
    line4,
    "他就是！ ",
    `${targetPlayerName}！！！`,
    6800,
    7900,
    230
  );
  if (isFavored) {
    showLine(line5, "恭喜你获得心仪球员！", line4DoneAt + 220);
  }
  showLine(line6, buildCinematicStatsLine(cinematicDemoContext), line4DoneAt + 520);
  if (ownedInfo) {
    schedule(line4DoneAt + 120, () => {
      ownedInfo.classList.add("show");
    });
  }
  schedule(line4DoneAt + 760, () => {
    cinematicDemoDone = true;
  });
}

function closeCinematicDemoModal() {
  const modal = document.getElementById("cinematicDemoModal");
  const stage = modal ? modal.querySelector(".cinematic-stage") : null;
  const btnCinematicClose = document.getElementById("btnCinematicClose");
  const shouldResumeAutoRewards = Boolean(cinematicDemoContext && cinematicDemoContext.isLiveEvent);
  cinematicDemoTimers.forEach((id) => window.clearTimeout(id));
  cinematicDemoTimers = [];
  cinematicDemoDone = false;
  if (!modal) return;
  if (stage) {
    stage.classList.remove("play");
    stage.classList.remove("finish");
    stage.classList.remove("peek-fx-st", "peek-fx-epic", "peek-fx-bt");
  }
  if (btnCinematicClose) {
    btnCinematicClose.textContent = "确认出货！";
  }
  modal.classList.add("hidden");
  if (continueOpenAllRewards && state.rewards.length > 0) {
    openAllRewards();
    return;
  }
  if (shouldResumeAutoRewards) {
    maybeAutoOpenRewards();
  }
}

function openRealModeInitModal() {
  const modal = document.getElementById("realModeInitModal");
  const input = document.getElementById("realModeGoldInput");
  if (!modal || !input) return;
  input.value = "";
  modal.classList.remove("hidden");
  input.focus();
}

function closeRealModeInitModal() {
  const modal = document.getElementById("realModeInitModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function confirmRealModeInit() {
  const input = document.getElementById("realModeGoldInput");
  const modeSwitchSelect = document.getElementById("modeSwitchSelect");

  if (!input) return;

  const value = Number(input.value.trim());
  if (!Number.isFinite(value) || value < 0) {
    window.alert("请输入大于等于 0 的数字。");
    return;
  }

  realModeMeta.remainingGold = Math.floor(value);
  closeRealModeInitModal();

  if (pendingModeSwitch === REAL_MODE_KEY) {
    pendingModeSwitch = null;
    switchMode(REAL_MODE_KEY);
    return;
  }

  if (modeSwitchSelect) {
    modeSwitchSelect.value = activeModeKey;
  }
}

function rechargeGold(amount, rmbAmount) {
  const delta = Number(amount);
  const rmb = Number(rmbAmount || 0);
  if (!Number.isFinite(delta) || delta <= 0) return;
  if (realModeMeta.remainingGold == null) {
    realModeMeta.remainingGold = 0;
  }
  realModeMeta.remainingGold += delta;
  if (Number.isFinite(rmb) && rmb > 0) {
    realModeMeta.totalRechargeRmb += rmb;
  }
  renderModeInfo();
  closeRechargeModal();
}

// 抽一张基础卡（不处理保底、里程碑）
function getSeasonBoostMultiplier(progressPulls) {
  if (progressPulls >= 80) return 4;
  if (progressPulls >= 60) return 3;
  if (progressPulls >= 40) return 2;
  if (progressPulls >= 20) return 1;
  return 0;
}

function getCurrentRollPoolConfig() {
  const pool = getCurrentPool();
  if (!isSeasonPool() && !isAccumulatedGuaranteePool()) {
    return pool.poolConfig;
  }

  const boostedConfig = pool.poolConfig.map((item) => ({ ...item }));
  const empowered = boostedConfig.find((item) => item.type === "empowered");
  const star4 = boostedConfig.find((item) => item.type === "star4");
  if (!empowered || !star4) {
    return pool.poolConfig;
  }

  const baseEmpoweredProb = empowered.probability;
  const boostedEmpoweredProb = isSeasonPool()
    ? baseEmpoweredProb * (1 + getSeasonBoostMultiplier(state.seasonProgressPulls || 0))
    : getAccumulatedGuaranteeProbByCurrentProgress(state.totalPulls || 0, pool);
  const diff = boostedEmpoweredProb - baseEmpoweredProb;
  empowered.probability = boostedEmpoweredProb;
  star4.probability = Math.max(0, star4.probability - diff);
  return boostedConfig;
}

function rollBaseCard() {
  const { empoweredCards } = getCurrentPool();
  const poolConfig = getCurrentRollPoolConfig();
  const r = Math.random();
  let cumulative = 0;

  for (const item of poolConfig) {
    cumulative += item.probability;
    if (r < cumulative) {
      if (item.type === "empowered") {
        const name = randomFromArray(empoweredCards);
        return { type: "empowered", name };
      }
      return { type: item.type, name: item.label };
    }
  }

  // 如果概率和不是 1，兜底给一张三星普卡
  return { type: "star3", name: "三星普卡" };
}

// 强制生成一张五星普卡（用于保底和奖励）
function createFiveStarCard() {
  const { poolConfig } = getCurrentPool();
  const star5Config = poolConfig.find((p) => p.type === "star5");
  return { type: "star5", name: star5Config ? star5Config.label : "五星普卡" };
}

// 生成一张随机增能卡
function createEmpoweredCard(specifiedName) {
  const { empoweredCards } = getCurrentPool();
  const name = specifiedName || randomFromArray(empoweredCards);
  return { type: "empowered", name };
}

// 用于累抽概率奖励命中后的出卡
function createBonusHitCard() {
  const pool = getCurrentPool();

  if (pool.bonusHitMode === "empowered_only") {
    return createEmpoweredCard();
  }

  const selectedConfig = pool.poolConfig.find((p) => p.type === "selected");
  const empoweredWeight = pool.empoweredCards.length;
  const selectedWeight = pool.selectedCardCountForBonus || 0;
  const totalWeight = empoweredWeight + selectedWeight;

  if (totalWeight <= 0 || Math.random() < empoweredWeight / totalWeight) {
    return createEmpoweredCard();
  }

  return {
    type: "selected",
    name: selectedConfig ? selectedConfig.label : "精选卡",
  };
}

// ================= 状态更新 =================

function recordSingleDraw(card, source = "normal", options = {}) {
  const { countTowardsTotal = true, milestonePulls = null } = options;
  const favoredTargetNames = getCurrentFavoredTargetNames();
  const favoredTargetName = favoredTargetNames[0] || "";

  if (countTowardsTotal) {
    state.totalPulls += 1;
    if (isSeasonPool()) {
      state.seasonProgressPulls = (state.seasonProgressPulls || 0) + 1;
    }
  }

  switch (card.type) {
    case "empowered":
      state.stats.empowered += 1;
      if (card.name) {
        const prevCount = state.empoweredCounts[card.name] || 0;
        if (state.empoweredCounts[card.name] == null) {
          state.empoweredCounts[card.name] = 0;
        }
        state.empoweredCounts[card.name] += 1;
        if (!state.empoweredDetails[card.name]) {
          state.empoweredDetails[card.name] = [];
        }
        state.empoweredDetails[card.name].push({
          time: getTimestamp(),
          source,
          pullIndex: countTowardsTotal ? state.totalPulls : null,
          milestonePulls,
        });
        if (isSeasonPool()) {
          state.seasonObtainedEmpoweredNames[card.name] = true;
        }
        const animationMode = getCurrentAnimationMode();
        if (animationMode === ANIMATION_MODES.ALL_EMPOWERED) {
          if (!pendingFavoredHitEvent) {
            const totalDraws = getCurrentAnimationProgressDraws();
            const empoweredCount = state.stats.empowered || 0;
            pendingFavoredHitEvent = {
              kind: "all_empowered",
              targetName: card.name,
              totalDraws,
              empoweredCount,
              exceedPercent: getExceedPercentForEmpoweredCountByProgress(
                totalDraws,
                empoweredCount
              ),
              isFavored: Boolean(favoredTargetNames.includes(card.name)),
              progressUnit: isChainPool() ? "tier" : "draw",
            };
          }
        } else if (
          animationMode === ANIMATION_MODES.FAVORED_ONLY &&
          favoredTargetNames.includes(card.name) &&
          prevCount === 0
        ) {
          pendingFavoredHitEvent = {
            kind: "favored_only",
            targetName: card.name,
            totalDraws: getCurrentAnimationProgressDraws(),
            progressUnit: isChainPool() ? "tier" : "draw",
          };
        }
      }
      break;
    case "selected":
      state.stats.selected += 1;
      break;
    case "star5":
      state.stats.star5 += 1;
      break;
    case "star4":
      state.stats.star4 += 1;
      break;
    case "star3":
      state.stats.star3 += 1;
      break;
    default:
      break;
  }

  // 记录抽卡历史（包括奖励和自选，但不一定计入总抽数）
  state.resultsHistory.unshift({
    card,
    time: getTimestamp(),
    source,
    pullIndex: countTowardsTotal ? state.totalPulls : null,
    milestonePulls,
  });
  if (card.type === "empowered" && card.name) {
    const latest = state.resultsHistory[0];
    const where = latest ? getEntryWhereText(latest) : "奖励/其他来源";
    addKeyMoment(`${where} 出货：${card.name}`);
  }

  // 检查是否解锁新的累积奖励
  if (countTowardsTotal) {
    processProgressionRewardsIfNeeded();
  }
}

function processProgressionRewardsIfNeeded() {
  const pool = getCurrentPool();
  if (pool.progressionType === "exchange_badge") {
    unlockBadgesIfNeeded();
    return;
  }
  if (pool.progressionType === "season_inherit") {
    unlockSeasonRewardsIfNeeded();
    return;
  }
  if (pool.progressionType === "accumulated_target") {
    unlockAccumulatedGuaranteeIfNeeded();
    return;
  }
  unlockMilestonesIfNeeded();
}

function unlockAccumulatedGuaranteeIfNeeded() {
  const cfg = getAccumulatedGuaranteeConfig();
  const cap = getAccumulatedGuaranteeProgressCap();
  if (!cfg || state.totalPulls < cap) return;
  if (state.accumulatedGuaranteeGranted) return;
  state.accumulatedGuaranteeGranted = true;
  state.rewards.push({
    id: `accumulated-${cap}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    pulls: cap,
    type: "empowered_select_fixed",
    fixedName: cfg.targetName,
    label: `${cfg.targetName}必得`,
    sourceLabel: `${cap}抽定向必得`,
  });
  maybeAutoOpenRewards();
}

function unlockSeasonRewardsIfNeeded() {
  const progress = state.seasonProgressPulls || 0;
  const flags = state.seasonRewardFlags;
  const makeId = (prefix) =>
    `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  let addedReward = false;

  if (progress >= 20) flags.p20 = true;
  if (progress >= 40) flags.p40 = true;
  if (progress >= 60) flags.p60 = true;
  if (progress >= 80) flags.p80 = true;

  if (progress >= 200 && !flags.p200) {
    flags.p200 = true;
    state.rewards.push({
      id: makeId("season-200"),
      pulls: 200,
      type: "season_random_non_repeat",
      label: "随机不重复增能卡",
      sourceLabel: "200抽随机不重复增能卡奖励",
    });
    addedReward = true;
  }

  if (progress >= 500 && !flags.p500) {
    flags.p500 = true;
    state.rewards.push({
      id: makeId("season-500"),
      pulls: 500,
      type: "empowered_select",
      label: "增能卡自选券",
      sourceLabel: "500抽增能卡自选券",
    });
    addedReward = true;

    // 到 500 抽后，赛季累抽进度进入下一轮，概率重置；统计数据不重置
    state.seasonProgressPulls = 0;
    state.seasonRewardFlags = {
      p20: false,
      p40: false,
      p60: false,
      p80: false,
      p200: false,
      p500: false,
    };
  }

  if (addedReward) {
    maybeAutoOpenRewards();
  }
}

function unlockMilestonesIfNeeded() {
  const milestones = getCurrentPool().milestones;
  let addedReward = false;
  while (
    state.nextMilestoneIndex < milestones.length &&
    state.totalPulls >= milestones[state.nextMilestoneIndex].pulls
  ) {
    const m = milestones[state.nextMilestoneIndex];
    const id = `milestone-${m.pulls}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2, 8)}`;
    state.rewards.push({
      id,
      ...m,
    });
    addedReward = true;
    state.nextMilestoneIndex += 1;
  }
  if (addedReward) {
    maybeAutoOpenRewards();
  }
}

function unlockBadgesIfNeeded() {
  while (state.totalPulls >= state.nextBadgeMilestone) {
    state.badges += 1;
    state.nextBadgeMilestone += 10;
  }
}

function getRewardOpenMode() {
  return rewardOpenModeSetting === "auto" ? "auto" : "manual";
}

function setRewardOpenMode(mode) {
  rewardOpenModeSetting = mode === "auto" ? "auto" : "manual";
  renderRewards();
  maybeAutoOpenRewards();
}

function getRewardsSortedForOpen() {
  return state.rewards.slice().sort((a, b) => {
    if (isChainPool()) {
      return (a.tier || 0) - (b.tier || 0);
    }
    return (a.pulls || 0) - (b.pulls || 0);
  });
}

function maybeAutoOpenRewards() {
  if (getRewardOpenMode() !== "auto") return;
  if (!state.rewards.length) return;
  if (isAnyHitModalOpen()) return;

  // 自动开启按“收到一个，开一个”执行，遇到弹窗即暂停
  while (getRewardOpenMode() === "auto" && state.rewards.length > 0) {
    if (isAnyHitModalOpen()) return;
    const nextReward = getRewardsSortedForOpen()[0];
    if (!nextReward) return;
    openRewardById(nextReward.id);
    if (isAnyHitModalOpen()) return;
  }
}

// ================= 抽卡入口 =================

function singlePull() {
  pendingFavoredHitEvent = null;
  if (!spendGoldForPulls(1)) return;
  const card = rollBaseCard();
  recordSingleDraw(card, "single");
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

// 十连抽：可选开启“至少 1 张五星及以上”保底（只对本次十连生效）
function tenPull() {
  pendingFavoredHitEvent = null;
  if (!spendGoldForPulls(10)) return;
  const batch = [];

  for (let i = 0; i < 10; i += 1) {
    batch.push(rollBaseCard());
  }

  if (TEN_PULL_GUARANTEE_ENABLED) {
    const hasFiveOrAbove = batch.some((c) =>
      ["empowered", "selected", "star5"].includes(c.type)
    );
    if (!hasFiveOrAbove) {
      batch[batch.length - 1] = createFiveStarCard();
    }
  }

  for (const card of batch) {
    recordSingleDraw(card, "ten-pull");
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) {
      break;
    }
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

// 一键抽到指定累计抽数
function autoToTargetTotal(target) {
  pendingFavoredHitEvent = null;
  target = Number(target);
  if (!Number.isFinite(target) || target <= 0) return;

  const currentProgress = isSeasonPool()
    ? (state.seasonProgressPulls || 0)
    : state.totalPulls;
  if (target <= currentProgress) return;

  const need = target - currentProgress;
  let didDraw = false;
  for (let i = 0; i < need; i += 1) {
    if (!spendGoldForPulls(1)) break;
    const card = rollBaseCard();
    recordSingleDraw(card, "auto");
    didDraw = true;
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) {
      break;
    }
  }

  if (didDraw) {
    renderAll();
  }

  showFavoredHitAnimationIfNeeded();
}

function autoToTargetBadges(targetBadges) {
  pendingFavoredHitEvent = null;
  targetBadges = Number(targetBadges);
  if (!Number.isFinite(targetBadges) || targetBadges <= 0) return;
  if (!isExchangePool()) return;

  const currentBadges = Math.max(0, Number(state.badges) || 0);
  if (targetBadges <= currentBadges) return;

  let didDraw = false;
  const MAX_AUTO_DRAWS = 300000;
  for (let i = 0; i < MAX_AUTO_DRAWS; i += 1) {
    if ((Number(state.badges) || 0) >= targetBadges) break;
    if (!spendGoldForPulls(1)) break;
    const card = rollBaseCard();
    recordSingleDraw(card, "auto-badge");
    didDraw = true;
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
  }

  if (didDraw) {
    renderAll();
  }
  showFavoredHitAnimationIfNeeded();
}

function autoDrawCount(count) {
  pendingFavoredHitEvent = null;
  count = Number(count);
  if (!Number.isFinite(count) || count <= 0) return;
  let didDraw = false;
  for (let i = 0; i < count; i += 1) {
    if (!spendGoldForPulls(1)) break;
    const card = rollBaseCard();
    recordSingleDraw(card, "auto-count");
    didDraw = true;
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
  }
  if (didDraw) {
    renderAll();
  }
  showFavoredHitAnimationIfNeeded();
}

function hasSelectRewardAvailable() {
  if (state.pendingSelectRewardCount > 0) return true;
  return state.rewards.some((r) =>
    ["empowered_select", "empowered_select_with_skin", "empowered_select_maincourse"].includes(r.type)
  );
}

function canExchangeToFavored(targetName) {
  if (!isExchangePool()) return false;
  const cfg = getExchangeConfig();
  if (cfg.fixedSelect42 && targetName === cfg.fixedSelect42) {
    return state.badges >= 42;
  }
  if (Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0) {
    return cfg.select47Players.includes(targetName) && state.badges >= 47;
  }
  return state.badges >= 47;
}

function autoToFavoredEmpowered() {
  pendingFavoredHitEvent = null;
  const targetNames = getCurrentFavoredTargetNames();
  if (!targetNames.length) return;
  const missingTargets = targetNames.filter(
    (name) => (state.empoweredCounts[name] || 0) <= 0
  );

  // 全部心仪已获得时，不再继续抽
  if (!missingTargets.length) {
    return;
  }
  const missingSet = new Set(missingTargets);

  // 已有可补齐心仪的自选/兑换时，不再继续抽
  if (
    hasSelectRewardAvailable() ||
    missingTargets.some((name) => canExchangeToFavored(name))
  ) {
    return;
  }

  let didDraw = false;
  const MAX_AUTO_DRAWS = 200000;

  for (let i = 0; i < MAX_AUTO_DRAWS; i += 1) {
    if (!spendGoldForPulls(1)) break;

    const card = rollBaseCard();
    recordSingleDraw(card, "auto-favored");
    didDraw = true;

    if (card.type === "empowered" && missingSet.has(card.name)) {
      break;
    }
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) {
      break;
    }
    if (
      hasSelectRewardAvailable() ||
      missingTargets.some((name) => canExchangeToFavored(name))
    ) {
      break;
    }
  }

  if (didDraw) {
    renderAll();
  }
  showFavoredHitAnimationIfNeeded();
}

// 重置当前卡池状态
function resetAll() {
  const prevResetCount = Math.max(0, Number(state.resetCount) || 0);
  stateByModeAndPool[activeModeKey][activePoolKey] = createInitialState(
    getCurrentPool().empoweredCards
  );
  state = stateByModeAndPool[activeModeKey][activePoolKey];
  state.resetCount = prevResetCount + 1;
  ensureChainPoolStateInitialized();
  resetEmpoweredDetailPanel();
  renderAll();
}

function toRewardSourceText(reward) {
  if (reward && reward.sourceLabel) {
    if (reward.tier != null) {
      return `exchange:第${reward.tier}档${reward.sourceLabel}`;
    }
    return `exchange:${reward.sourceLabel}`;
  }
  return `reward-${reward.pulls}`;
}

function getEntrySourceText(entry) {
  if (typeof entry.source === "string" && entry.source.startsWith("exchange:")) {
    return entry.source.slice("exchange:".length);
  }
  return "";
}

function getEntryWhereText(entry) {
  if (entry.pullIndex != null) {
    return `第 ${entry.pullIndex} 抽`;
  }

  const exchangeText = getEntrySourceText(entry);
  if (exchangeText) {
    return exchangeText;
  }

  if (entry.milestonePulls != null) {
    if (entry.source === "select-reward") {
      return `${entry.milestonePulls} 抽自选奖励`;
    }
    return `${entry.milestonePulls} 抽累抽奖励`;
  }

  return "奖励/其他来源";
}

function isExchangePool() {
  return getCurrentPool().progressionType === "exchange_badge";
}

function isChainPool() {
  return getCurrentPool().progressionType === "chain_tier";
}

function isSeasonPool() {
  return getCurrentPool().progressionType === "season_inherit";
}

function isAccumulatedGuaranteePool() {
  return getCurrentPool().progressionType === "accumulated_target";
}

function getChainTierSpentGold() {
  if (!isChainPool()) return 0;
  const tiers = getCurrentPool().chainTiers || [];
  const unlocked = Math.max(0, state.chainTierProgress || 0);
  return tiers
    .filter((t) => t.tier <= unlocked)
    .reduce((sum, t) => sum + (Number(t.costGold) || 0), 0);
}

function getEmpoweredStatNames() {
  const pool = getCurrentPool();
  const base = (pool.empoweredCards || []).slice();
  if (!isChainPool()) return base;

  const merged = [];
  const pushUnique = (name) => {
    if (!name || merged.includes(name)) return;
    merged.push(name);
  };

  if (pool.chainSubPools) {
    Object.keys(pool.chainSubPools).forEach((poolKey) => {
      (pool.chainSubPools[poolKey]?.cards || []).forEach(pushUnique);
    });
    return merged;
  }

  (pool.empoweredCards || []).forEach(pushUnique);
  (pool.sidePoolCards || []).forEach(pushUnique);
  return merged;
}

function ensureChainPoolStateInitialized() {
  if (!isChainPool()) return;
  if (!Array.isArray(state.chainSidePoolRemaining) || state.chainSidePoolRemaining.length === 0) {
    state.chainSidePoolRemaining = (getCurrentPool().sidePoolCards || []).slice();
  }
}

function getExchangeConfig() {
  const pool = getCurrentPool();
  return (
    pool.exchangeConfig || {
      specificPlayers: pool.exchangeSpecificPlayers || [],
      fixedSelect42: null,
      select47Players: null,
      hasSkin52: false,
    }
  );
}

function createChainRewardToken(kind) {
  const pool = getCurrentPool();
  if (kind === "side_box") {
    const sideName = pool.sidePoolName || "副池";
    return {
      type: "chain_side_box",
      label: `${sideName}箱式随机券`,
      sourceLabel: `${sideName}箱式随机券`,
    };
  }
  const parsed = parseChainRewardKind(kind, pool);
  if (!parsed) return null;
  const poolName = getChainPoolDisplayName(pool, parsed.poolKey);
  const candidateNames = getChainPoolCards(pool, parsed.poolKey);
  if (!candidateNames.length) return null;

  if (parsed.rewardType === "chance") {
    const rate = Math.round((parsed.chance || 0) * 100);
    return {
      type: "chain_pool_chance",
      chance: parsed.chance,
      poolKey: parsed.poolKey,
      candidateNames,
      label: `${rate}%${poolName}随机增能卡券`,
      sourceLabel: `${rate}%${poolName}随机增能卡券`,
    };
  }
  if (parsed.rewardType === "random") {
    return {
      type: "chain_pool_random",
      poolKey: parsed.poolKey,
      candidateNames,
      label: `${poolName}随机增能必得券`,
      sourceLabel: `${poolName}随机增能必得券`,
    };
  }
  if (parsed.rewardType === "select") {
    return {
      type: "chain_pool_select",
      poolKey: parsed.poolKey,
      candidateNames,
      label: `${poolName}增能自选券`,
      sourceLabel: `${poolName}增能自选券`,
    };
  }
  return null;
}

function unlockChainTier(tierNumber) {
  const pool = getCurrentPool();
  const tiers = pool.chainTiers || [];
  const tierConfig = tiers.find((t) => t.tier === tierNumber);
  if (!tierConfig) return false;
  if (state.chainTierProgress + 1 !== tierNumber) return false;

  if (!spendGoldAmount(tierConfig.costGold)) {
    openInsufficientGoldModal();
    return false;
  }

  state.chainTierProgress = tierNumber;
  (tierConfig.rewards || []).forEach((kind) => {
    const token = createChainRewardToken(kind);
    if (token) {
      addExchangeReward({
        ...token,
        tier: tierNumber,
        pulls: tierNumber,
      });
    }
  });
  return true;
}

function drawNextChainTier() {
  if (!isChainPool()) return;
  ensureChainPoolStateInitialized();
  const nextTier = state.chainTierProgress + 1;
  const maxTier = (getCurrentPool().chainTiers || []).length;
  if (nextTier > maxTier) return;
  if (unlockChainTier(nextTier)) {
    renderAll();
  }
}

function drawToChainTier(targetTier) {
  if (!isChainPool()) return;
  targetTier = Number(targetTier);
  if (!Number.isFinite(targetTier) || targetTier <= state.chainTierProgress) return;
  const maxTier = (getCurrentPool().chainTiers || []).length;
  targetTier = Math.min(targetTier, maxTier);

  let changed = false;
  while (state.chainTierProgress < targetTier) {
    const ok = unlockChainTier(state.chainTierProgress + 1);
    if (!ok) break;
    changed = true;
  }
  if (changed) {
    renderAll();
  }
}

function consumeBadges(cost) {
  if (!isExchangePool()) return false;
  if (state.badges < cost) {
    openBadgeInsufficientModal(cost, state.badges);
    return false;
  }
  state.badges -= cost;
  return true;
}

function addExchangeReward(reward) {
  const id = `exchange-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  state.rewards.push({
    id,
    fromExchange: true,
    pulls: state.totalPulls,
    ...reward,
  });
  maybeAutoOpenRewards();
}

function openChainSideBoxCard() {
  ensureChainPoolStateInitialized();
  if (!Array.isArray(state.chainSidePoolRemaining) || state.chainSidePoolRemaining.length === 0) {
    return createFiveStarCard();
  }
  const idx = Math.floor(Math.random() * state.chainSidePoolRemaining.length);
  const name = state.chainSidePoolRemaining.splice(idx, 1)[0];
  return { type: "empowered", name };
}

function createSeasonNonDuplicateEmpoweredCard() {
  const allNames = getCurrentPool().empoweredCards || [];
  const seen = state.seasonObtainedEmpoweredNames || {};
  const remain = allNames.filter((name) => !seen[name]);
  return createEmpoweredCard(randomFromArray(remain.length > 0 ? remain : allNames));
}

function exchangeSpecificChanceReward() {
  const cfg = getExchangeConfig();
  const select = document.getElementById("exchangeSpecificChoice");
  const targetName = select ? select.value : "";
  if (!targetName || !(cfg.specificPlayers || []).includes(targetName)) return;
  if (!consumeBadges(6)) return;
  addExchangeReward({
    type: "exchange_target_chance",
    targetName,
    chance: 0.1,
    label: `10% ${targetName}增能球员卡`,
    sourceLabel: `10%${targetName}兑换券`,
  });
  renderAll();
}

function exchangeRandomEmpoweredReward() {
  if (!consumeBadges(25)) return;
  addExchangeReward({
    type: "empowered_random",
    label: "随机增能卡必得券",
    sourceLabel: "随机增能卡必得券",
  });
  renderAll();
}

function exchangeDBSelectReward() {
  const cfg = getExchangeConfig();
  if (!cfg.fixedSelect42) return;
  if (!consumeBadges(42)) return;
  addExchangeReward({
    type: "empowered_select_fixed",
    fixedName: cfg.fixedSelect42,
    label: `${cfg.fixedSelect42}自选`,
    sourceLabel: "增能自选券",
  });
  renderAll();
}

function exchangeAnySelectReward() {
  const cfg = getExchangeConfig();
  const selectPlayers = cfg.select47Players;
  if (!consumeBadges(47)) return;
  if (Array.isArray(selectPlayers) && selectPlayers.length > 0) {
    addExchangeReward({
      type: "empowered_select_maincourse",
      candidateNames: selectPlayers.slice(),
      label: "主菜自选券",
      sourceLabel: "主菜自选券",
    });
    renderAll();
    return;
  }
  addExchangeReward({
    type: "empowered_select",
    label: "任意增能卡自选",
    sourceLabel: "增能自选券",
  });
  renderAll();
}

function exchangeAnySelectWithSkinReward() {
  const cfg = getExchangeConfig();
  if (!cfg.hasSkin52) return;
  if (!consumeBadges(52)) return;
  addExchangeReward({
    type: "empowered_select_with_skin",
    label: "任意自选 + 维埃拉皮肤",
    sourceLabel: "增能自选券",
  });
  renderAll();
}

// ================= 奖励开包 =================

function openRewardById(id) {
  pendingFavoredHitEvent = null;
  const idx = state.rewards.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const reward = state.rewards[idx];

  // 从未开启奖励列表中移除
  state.rewards.splice(idx, 1);

  switch (reward.type) {
    case "five_star": {
      const card = createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "empowered_chance": {
      const isEmpowered = Math.random() < (reward.chance || 0);
      const card = isEmpowered ? createBonusHitCard() : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "empowered_random": {
      const card = createEmpoweredCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "empowered_select": {
      state.pendingSelectRewardCount += 1;
      state.pendingSelectMilestones.push({
        pulls: reward.pulls,
        sourceLabel: reward.sourceLabel || null,
        candidateNames: reward.candidateNames || null,
      });
      break;
    }
    case "season_random_non_repeat": {
      const card = createSeasonNonDuplicateEmpoweredCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "exchange_target_chance": {
      const isHit = Math.random() < (reward.chance || 0.1);
      const card = isHit
        ? createEmpoweredCard(reward.targetName)
        : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "empowered_select_fixed": {
      const card = createEmpoweredCard(reward.fixedName);
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "empowered_select_with_skin": {
      state.pendingSelectRewardCount += 1;
      state.pendingSelectMilestones.push({
        pulls: reward.pulls,
        sourceLabel: reward.sourceLabel || null,
        candidateNames: reward.candidateNames || null,
      });
      state.vieiraSkinCount += 1;
      break;
    }
    case "empowered_select_maincourse": {
      state.pendingSelectRewardCount += 1;
      state.pendingSelectMilestones.push({
        pulls: reward.pulls,
        sourceLabel: reward.sourceLabel || null,
        candidateNames: reward.candidateNames || null,
      });
      break;
    }
    case "chain_main_chance": {
      const isHit = Math.random() < (reward.chance || 0);
      const card = isHit ? createEmpoweredCard() : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "chain_main_random": {
      const card = createEmpoweredCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "chain_main_select": {
      const chainSourceLabel =
        reward.tier != null && reward.sourceLabel
          ? `第${reward.tier}档${reward.sourceLabel}`
          : reward.sourceLabel || null;
      state.pendingSelectRewardCount += 1;
      state.pendingSelectMilestones.push({
        pulls: reward.pulls,
        sourceLabel: chainSourceLabel,
        candidateNames: reward.candidateNames || null,
      });
      break;
    }
    case "chain_side_box": {
      const card = openChainSideBoxCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "chain_pool_chance": {
      const isHit = Math.random() < (reward.chance || 0);
      const names = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
      const target = names.length ? randomFromArray(names) : randomFromArray(getCurrentPool().empoweredCards || []);
      const card = isHit ? createEmpoweredCard(target) : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "chain_pool_random": {
      const names = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
      const target = names.length ? randomFromArray(names) : randomFromArray(getCurrentPool().empoweredCards || []);
      const card = createEmpoweredCard(target);
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "chain_pool_select": {
      const chainSourceLabel =
        reward.tier != null && reward.sourceLabel
          ? `第${reward.tier}档${reward.sourceLabel}`
          : reward.sourceLabel || null;
      state.pendingSelectRewardCount += 1;
      state.pendingSelectMilestones.push({
        pulls: reward.pulls,
        sourceLabel: chainSourceLabel,
        candidateNames: reward.candidateNames || null,
      });
      break;
    }
    default:
      break;
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function openAllRewards() {
  pendingFavoredHitEvent = null;
  continueOpenAllRewards = false;
  if (!state.rewards.length) return;

  const rewardsToOpen = state.rewards
    .slice()
    .sort((a, b) => a.pulls - b.pulls);

  for (const reward of rewardsToOpen) {
    const idx = state.rewards.findIndex((r) => r.id === reward.id);
    if (idx === -1) continue;
    state.rewards.splice(idx, 1);

    switch (reward.type) {
      case "five_star": {
        const card = createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "empowered_chance": {
        const isEmpowered = Math.random() < (reward.chance || 0);
        const card = isEmpowered ? createBonusHitCard() : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "empowered_random": {
        const card = createEmpoweredCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "empowered_select": {
        state.pendingSelectRewardCount += 1;
        state.pendingSelectMilestones.push({
          pulls: reward.pulls,
          sourceLabel: reward.sourceLabel || null,
          candidateNames: reward.candidateNames || null,
        });
        break;
      }
      case "season_random_non_repeat": {
        const card = createSeasonNonDuplicateEmpoweredCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "exchange_target_chance": {
        const isHit = Math.random() < (reward.chance || 0.1);
        const card = isHit
          ? createEmpoweredCard(reward.targetName)
          : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "empowered_select_fixed": {
        const card = createEmpoweredCard(reward.fixedName);
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "empowered_select_with_skin": {
        state.pendingSelectRewardCount += 1;
        state.pendingSelectMilestones.push({
          pulls: reward.pulls,
          sourceLabel: reward.sourceLabel || null,
          candidateNames: reward.candidateNames || null,
        });
        state.vieiraSkinCount += 1;
        break;
      }
      case "empowered_select_maincourse": {
        state.pendingSelectRewardCount += 1;
        state.pendingSelectMilestones.push({
          pulls: reward.pulls,
          sourceLabel: reward.sourceLabel || null,
          candidateNames: reward.candidateNames || null,
        });
        break;
      }
      case "chain_main_chance": {
        const isHit = Math.random() < (reward.chance || 0);
        const card = isHit ? createEmpoweredCard() : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "chain_main_random": {
        const card = createEmpoweredCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "chain_main_select": {
        const chainSourceLabel =
          reward.tier != null && reward.sourceLabel
            ? `第${reward.tier}档${reward.sourceLabel}`
            : reward.sourceLabel || null;
        state.pendingSelectRewardCount += 1;
        state.pendingSelectMilestones.push({
          pulls: reward.pulls,
          sourceLabel: chainSourceLabel,
          candidateNames: reward.candidateNames || null,
        });
        break;
      }
      case "chain_side_box": {
        const card = openChainSideBoxCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "chain_pool_chance": {
        const isHit = Math.random() < (reward.chance || 0);
        const names = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
        const target = names.length ? randomFromArray(names) : randomFromArray(getCurrentPool().empoweredCards || []);
        const card = isHit ? createEmpoweredCard(target) : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "chain_pool_random": {
        const names = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
        const target = names.length ? randomFromArray(names) : randomFromArray(getCurrentPool().empoweredCards || []);
        const card = createEmpoweredCard(target);
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "chain_pool_select": {
        const chainSourceLabel =
          reward.tier != null && reward.sourceLabel
            ? `第${reward.tier}档${reward.sourceLabel}`
            : reward.sourceLabel || null;
        state.pendingSelectRewardCount += 1;
        state.pendingSelectMilestones.push({
          pulls: reward.pulls,
          sourceLabel: chainSourceLabel,
          candidateNames: reward.candidateNames || null,
        });
        break;
      }
      default:
        break;
    }
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) {
      continueOpenAllRewards = true;
      break;
    }
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function confirmSelectReward() {
  pendingFavoredHitEvent = null;
  if (state.pendingSelectRewardCount <= 0) return;
  const select = document.getElementById("selectRewardChoice");
  if (!select) return;
  const pendingInfo = state.pendingSelectMilestones[0] ?? null;
  const allowedNames =
    pendingInfo &&
    typeof pendingInfo === "object" &&
    Array.isArray(pendingInfo.candidateNames) &&
    pendingInfo.candidateNames.length > 0
      ? pendingInfo.candidateNames
      : getCurrentPool().empoweredCards;
  const preferredName = select.value || randomFromArray(allowedNames);
  const name = allowedNames.includes(preferredName)
    ? preferredName
    : randomFromArray(allowedNames);

  // 取出对应的自选来源信息
  const usedInfo = state.pendingSelectMilestones.shift() ?? null;
  const milestonePulls =
    usedInfo && typeof usedInfo === "object" ? usedInfo.pulls : usedInfo;
  const sourceLabel =
    usedInfo && typeof usedInfo === "object" ? usedInfo.sourceLabel : null;
  const source = sourceLabel ? `exchange:${sourceLabel}` : "select-reward";

  const card = createEmpoweredCard(name);
  // 标记来源为自选包
  recordSingleDraw(card, source, {
    countTowardsTotal: false,
    milestonePulls,
  });

  state.pendingSelectRewardCount -= 1;
  if (state.pendingSelectRewardCount < 0) {
    state.pendingSelectRewardCount = 0;
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

// ================= 渲染 =================

function renderProbabilities() {
  const { poolConfig, empoweredCards } = getCurrentPool();
  const tbody = document.getElementById("probabilityTableBody");
  const namesSpan = document.getElementById("empoweredNames");
  const probabilitySectionTitle = document.getElementById("probabilitySectionTitle");
  const empoweredNamesTitle = document.getElementById("empoweredNamesTitle");
  const colName = document.getElementById("probabilityColName");
  const colValue = document.getElementById("probabilityColValue");
  const hasProbabilityDom =
    !!tbody &&
    !!namesSpan &&
    !!probabilitySectionTitle &&
    !!empoweredNamesTitle &&
    !!colName &&
    !!colValue;

  if (hasProbabilityDom) {
    tbody.innerHTML = "";
    if (isChainPool()) {
      const pool = getCurrentPool();
      probabilitySectionTitle.textContent = "卡池球员名单";
      empoweredNamesTitle.textContent = "各子池球员 概率平分";
      colName.textContent = "卡池";
      colValue.textContent = "球员名单";

      const rows = pool.chainSubPools
        ? Object.keys(pool.chainSubPools).map((poolKey) => ({
            poolName: getChainPoolDisplayName(pool, poolKey),
            names: pool.chainSubPools[poolKey]?.cards || [],
          }))
        : [
            {
              poolName: pool.mainPoolName || "主池",
              names: pool.empoweredCards || [],
            },
            {
              poolName: pool.sidePoolName || "小池",
              names: pool.sidePoolCards || [],
            },
          ];

      rows.forEach((row) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdValue = document.createElement("td");
        tdName.textContent = row.poolName;
        tdValue.textContent = row.names.join(" / ");
        tr.appendChild(tdName);
        tr.appendChild(tdValue);
        tbody.appendChild(tr);
      });

      namesSpan.textContent = "";
    } else if (isSeasonPool()) {
      const currentConfig = getCurrentRollPoolConfig();
      const baseEmpowered =
        (poolConfig.find((item) => item.type === "empowered") || {}).probability || 0;
      const currentEmpowered =
        (currentConfig.find((item) => item.type === "empowered") || {}).probability || 0;
      const boostPercent = Math.round(
        ((currentEmpowered - baseEmpowered) / (baseEmpowered || 1)) * 100
      );

      probabilitySectionTitle.textContent = "当前卡池概率";
      empoweredNamesTitle.textContent = "增能卡名单（概率平分）：";
      colName.textContent = "卡牌类型";
      colValue.textContent = "概率";

      currentConfig.forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent = formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent = `${empoweredCards.join(" / ")}（当前增能概率提升${boostPercent}%）`;
    } else if (isAccumulatedGuaranteePool()) {
      const currentConfig = getCurrentRollPoolConfig();
      const baseEmpowered =
        (poolConfig.find((item) => item.type === "empowered") || {}).probability || 0;
      const currentEmpowered =
        (currentConfig.find((item) => item.type === "empowered") || {}).probability || 0;
      const boostPercent = Math.round(
        ((currentEmpowered - baseEmpowered) / (baseEmpowered || 1)) * 100
      );

      probabilitySectionTitle.textContent = "当前卡池概率";
      empoweredNamesTitle.textContent = "定向球员：";
      colName.textContent = "卡牌类型";
      colValue.textContent = "概率";

      currentConfig.forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent = formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent = `${empoweredCards.join(" / ")}（当前定向概率提升${boostPercent}%）`;
    } else {
      probabilitySectionTitle.textContent = "当前卡池概率";
      empoweredNamesTitle.textContent = "增能卡名单（概率平分）：";
      colName.textContent = "卡牌类型";
      colValue.textContent = "概率";
      poolConfig.forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent = formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent = empoweredCards.join(" / ");
    }
  }

  // 填充自选下拉框
  const select = document.getElementById("selectRewardChoice");
  const favSelect = document.getElementById("favEmpoweredChoice");
  const chainFavSelect = document.getElementById("chainFavEmpoweredChoice");
  const favoredName = getCurrentFavoredTargetName();
  if (select) {
    const pendingInfo = state.pendingSelectMilestones[0] ?? null;
    const candidateNames =
      pendingInfo &&
      typeof pendingInfo === "object" &&
      Array.isArray(pendingInfo.candidateNames) &&
      pendingInfo.candidateNames.length > 0
        ? pendingInfo.candidateNames
        : empoweredCards;
    const previousValue = select.value;
    select.innerHTML = "";
    candidateNames.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    const favoredNames = getCurrentFavoredTargetNames();
    const firstMissingFavored = favoredNames.find(
      (name) =>
        candidateNames.includes(name) && (Number(state.empoweredCounts[name]) || 0) <= 0
    );
    const firstFavoredInCandidates = favoredNames.find((name) =>
      candidateNames.includes(name)
    );

    if (firstMissingFavored) {
      select.value = firstMissingFavored;
    } else if (firstFavoredInCandidates) {
      select.value = firstFavoredInCandidates;
    } else if (candidateNames.includes(favoredName)) {
      select.value = favoredName;
    } else if (candidateNames.includes(previousValue)) {
      select.value = previousValue;
    }
  }

  if (favSelect) {
    const currentValues = Array.from(favSelect.selectedOptions || []).map((o) => o.value);
    favSelect.innerHTML = "";
    empoweredCards.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (currentValues.includes(name)) {
        opt.selected = true;
      }
      favSelect.appendChild(opt);
    });
    renderFavTagSelector("favEmpoweredChoice", "favEmpoweredTags");
    updateFavSelectAllButton("favEmpoweredChoice", "btnFavSelectAll");
  }

  if (chainFavSelect) {
    const currentValues = Array.from(chainFavSelect.selectedOptions || []).map((o) => o.value);
    const chainChoices = getEmpoweredStatNames();
    chainFavSelect.innerHTML = "";
    chainChoices.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (currentValues.includes(name)) {
        opt.selected = true;
      }
      chainFavSelect.appendChild(opt);
    });
    renderFavTagSelector("chainFavEmpoweredChoice", "chainFavEmpoweredTags");
    updateFavSelectAllButton("chainFavEmpoweredChoice", "btnChainFavSelectAll");
  }
}

function renderAccumulatedTargetSwitch() {
  const row = document.getElementById("accumulatedTargetSwitchRow");
  const choice = document.getElementById("accumulatedTargetChoice");
  if (!row || !choice) return;

  if (!isAccumulatedGuaranteePool()) {
    row.classList.add("hidden");
    choice.innerHTML = "";
    return;
  }

  const pools = getAccumulatedSwitchPools(getCurrentPool());
  if (pools.length <= 1) {
    row.classList.add("hidden");
    choice.innerHTML = "";
    return;
  }

  row.classList.remove("hidden");
  choice.innerHTML = "";

  pools.forEach((key) => {
    const pool = POOLS[key];
    const targetName = (pool.empoweredCards || [])[0] || "";
    const option = document.createElement("option");
    option.value = key;
    option.textContent = pool.switchButtonLabel || targetName;
    choice.appendChild(option);
  });
  choice.value = activePoolKey;
}

function renderStats() {
  const totalPulls = state.totalPulls;
  const goldCost = isChainPool() ? getChainTierSpentGold() : totalPulls * 100;
  const diamondCost = Math.floor(goldCost * 0.9);
  const statBadgeItem = document.getElementById("statBadgeItem");
  const statEmpoweredEl = document.getElementById("statEmpowered");

  const ids = {
    statTotalPulls: totalPulls,
    statBadges: state.badges,
    statSelected: state.stats.selected,
    statNormal: (state.stats.star5 || 0) + (state.stats.star4 || 0) + (state.stats.star3 || 0),
    costGold: goldCost,
    costDiamond: diamondCost,
  };
  Object.entries(ids).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  });

  if (statEmpoweredEl) {
    const empoweredCount = Math.max(0, Math.floor(Number(state.stats.empowered) || 0));
    const progressCount = isChainPool()
      ? Math.max(0, Math.floor(Number(state.chainTierProgress) || 0))
      : Math.max(0, Math.floor(Number(state.totalPulls) || 0));
    const exceedPercent = getExceedPercentForEmpoweredCountByProgress(
      progressCount,
      empoweredCount
    );
    const avgGoldPerEmpowered =
      empoweredCount > 0 ? Math.floor(goldCost / empoweredCount) : "-";
    statEmpoweredEl.innerHTML =
      `<span class="stat-main">${empoweredCount}</span>` +
      `<span class="stat-exceed-note">平均 <span class="expected-value">${avgGoldPerEmpowered}</span> 金币/增能卡，` +
      `超过 <span class="expected-value">${exceedPercent.toFixed(2)}%</span> 的玩家</span>`;
  }

  if (statBadgeItem) {
    if (isExchangePool()) {
      statBadgeItem.classList.remove("hidden");
    } else {
      statBadgeItem.classList.add("hidden");
    }
  }

  const totalPullsSpan = document.getElementById("totalPulls");
  if (totalPullsSpan) {
    totalPullsSpan.textContent = String(state.totalPulls);
  }
  const totalPullsChainSpan = document.getElementById("totalPullsChain");
  if (totalPullsChainSpan) {
    totalPullsChainSpan.textContent = String(state.totalPulls);
  }
  const poolResetCountSpan = document.getElementById("poolResetCount");
  if (poolResetCountSpan) {
    poolResetCountSpan.textContent = String(Math.max(0, Number(state.resetCount) || 0));
  }
  const poolResetCountChainSpan = document.getElementById("poolResetCountChain");
  if (poolResetCountChainSpan) {
    poolResetCountChainSpan.textContent = String(Math.max(0, Number(state.resetCount) || 0));
  }

  const tbody = document.getElementById("empoweredStatsBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const favoredNames = new Set(getCurrentFavoredTargetNames());
  getEmpoweredStatNames().forEach((name) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdCount = document.createElement("td");
    const count = state.empoweredCounts[name] || 0;
    tdName.textContent = name;
    if (favoredNames.has(name)) {
      if (count > 0) {
        const firstHit = (state.empoweredDetails[name] || [])[0] || null;
        let progressAtFirst = 0;
        if (firstHit && firstHit.pullIndex != null) {
          progressAtFirst = Math.max(0, Math.floor(Number(firstHit.pullIndex) || 0));
        } else if (firstHit && firstHit.milestonePulls != null) {
          progressAtFirst = Math.max(0, Math.floor(Number(firstHit.milestonePulls) || 0));
        }
        const exceedSpecific = getExceedPercentForSpecificByProgress(progressAtFirst, name);
        const specificGrade = getLuckGradeByExceedPercent(exceedSpecific);
        tdCount.innerHTML = `${count} <span class="stat-exceed-note-inline"><span class="expected-value">${specificGrade}</span> | 超过 <span class="expected-value">${exceedSpecific.toFixed(
          2
        )}%</span> 的玩家</span>`;
      } else {
        tdCount.innerHTML = `${count} <span class="stat-exceed-note-inline">未获得</span>`;
      }
    } else {
      tdCount.textContent = String(count);
    }
    if (count > 0) {
      tdCount.style.color = "#fbbf24";
      tdCount.style.fontWeight = "600";
    }
    tr.appendChild(tdName);
    tr.appendChild(tdCount);
    tr.addEventListener("click", () => {
      showEmpoweredDetail(name);
    });
    tbody.appendChild(tr);
  });
}

function renderLuckScore() {
  const el = document.getElementById("luckScoreText");
  if (!el) return;
  const progressCount = isChainPool()
    ? Math.max(0, Math.floor(Number(state.chainTierProgress) || 0))
    : Math.max(0, Math.floor(Number(state.totalPulls) || 0));
  if (progressCount <= 0) {
    el.textContent = "等待抽卡";
    return;
  }
  const uniqueEmpoweredCount = getCurrentUniqueEmpoweredCount();
  const exceedPercent = getExceedPercentForUniqueEmpoweredCountByProgress(
    progressCount,
    uniqueEmpoweredCount
  );
  const grade = getLuckGradeByExceedPercent(exceedPercent);
  el.textContent = `${grade}｜${uniqueEmpoweredCount} 张不同名卡，超过（大于等于） ${exceedPercent.toFixed(2)}% 的玩家`;
}

function getLuckGradeByExceedPercent(exceedPercent) {
  exceedPercent = clamp01((Number(exceedPercent) || 0) / 100) * 100;
  if (exceedPercent >= 80) return "很欧";
  if (exceedPercent >= 60) return "偏欧";
  if (exceedPercent >= 40) return "正常";
  if (exceedPercent >= 20) return "偏黑";
  return "很黑";
}

function renderPityTracker() {
  const panel = document.getElementById("pityTrackerPanel");
  const textEl = document.getElementById("pityTrackerText");
  const fillEl = document.getElementById("pityTrackerFill");
  const modeSelect = document.getElementById("modeSwitchSelect");
  const currentMode = modeSelect ? modeSelect.value : activeModeKey;
  if (panel) {
    if (currentMode !== REAL_MODE_KEY) {
      panel.classList.add("hidden");
      return;
    }
    panel.classList.remove("hidden");
  }
  if (!textEl || !fillEl) return;

  if (isChainPool()) {
    const tiers = getCurrentPool().chainTiers || [];
    const maxTier = tiers.length;
    const currentTier = Math.max(0, Number(state.chainTierProgress) || 0);
    if (currentTier >= maxTier) {
      textEl.textContent = "当前已拉满七档，连锁礼包进度已完成。";
      fillEl.style.width = "100%";
      return;
    }
    const nextTierConfig = tiers[currentTier] || null;
    const nextTier = currentTier + 1;
    const needGold = Number(nextTierConfig?.costGold || 0);
    textEl.textContent = `距离下一档还差：第${nextTier}档（需要 ${needGold} 金币）`;
    fillEl.style.width = `${maxTier > 0 ? (currentTier / maxTier) * 100 : 0}%`;
    return;
  }

  if (isExchangePool()) {
    const total = Math.max(0, Number(state.totalPulls) || 0);
    const nextBadge = Math.max(10, Number(state.nextBadgeMilestone) || 10);
    const prevBadge = Math.max(0, nextBadge - 10);
    const need = Math.max(0, nextBadge - total);
    const percent = Math.max(0, Math.min(100, ((total - prevBadge) / 10) * 100));
    textEl.textContent = `距离下一枚徽章还差 ${need} 抽（当前徽章 ${state.badges || 0}）`;
    fillEl.style.width = `${percent}%`;
    return;
  }

  if (isAccumulatedGuaranteePool()) {
    const marks = [20, 60, 80, 100, 120, 140, getAccumulatedGuaranteeProgressCap()];
    const total = Math.max(0, Number(state.totalPulls) || 0);
    const next = marks.find((m) => m > total);
    if (!next) {
      textEl.textContent = "当前定向必得节点已完成。";
      fillEl.style.width = "100%";
      return;
    }
    const prev = marks.filter((m) => m <= total).slice(-1)[0] || 0;
    const need = next - total;
    const percent = Math.max(0, Math.min(100, ((total - prev) / (next - prev)) * 100));
    textEl.textContent = `距离 ${next} 抽节点还差 ${need} 抽`;
    fillEl.style.width = `${percent}%`;
    return;
  }

  if (isSeasonPool()) {
    const marks = [20, 40, 60, 80, 200, 500];
    const progress = Math.max(0, Number(state.seasonProgressPulls) || 0);
    const next = marks.find((m) => m > progress);
    if (!next) {
      textEl.textContent = "当前轮次节点已完成，达到500后会进入下一轮。";
      fillEl.style.width = "100%";
      return;
    }
    const prev = marks.filter((m) => m <= progress).slice(-1)[0] || 0;
    const need = next - progress;
    const percent = Math.max(0, Math.min(100, ((progress - prev) / (next - prev)) * 100));
    textEl.textContent = `本轮距离 ${next} 抽节点还差 ${need} 抽`;
    fillEl.style.width = `${percent}%`;
    return;
  }

  const milestones = (getCurrentPool().milestones || []).slice().sort((a, b) => a.pulls - b.pulls);
  const total = Math.max(0, Number(state.totalPulls) || 0);
  const nextMilestone = milestones.find((m) => (m.pulls || 0) > total);
  if (!nextMilestone) {
    textEl.textContent = "当前累抽奖励已全部解锁。";
    fillEl.style.width = "100%";
    return;
  }
  const prevMilestone = milestones
    .filter((m) => (m.pulls || 0) <= total)
    .slice(-1)[0];
  const prevPulls = prevMilestone ? prevMilestone.pulls : 0;
  const nextPulls = nextMilestone.pulls || total;
  const need = Math.max(0, nextPulls - total);
  const percent = Math.max(
    0,
    Math.min(100, ((total - prevPulls) / Math.max(1, nextPulls - prevPulls)) * 100)
  );
  textEl.textContent = `距离 ${nextPulls} 抽奖励还差 ${need} 抽`;
  fillEl.style.width = `${percent}%`;
}

function renderMomentPreview() {
  const el = document.getElementById("momentPreview");
  if (!el) return;
  const moments = (state.keyMoments || []).slice(0, 2);
  if (!moments.length) {
    el.textContent = "出货节点预告：抽到增能卡时会记录在这里。";
    return;
  }
  el.textContent = moments
    .map((m) => `${m.time} · ${m.text}`)
    .join(" ｜ ");
}

function showEmpoweredDetail(name) {
  const container = document.getElementById("empoweredDetailContent");
  const hint = document.getElementById("empoweredDetailHint");
  if (!container || !hint) return;

  const list = state.empoweredDetails[name] || [];
  container.innerHTML = "";
  hint.textContent = `【${name}】的出卡记录：`;

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "当前尚未抽到该增能卡。";
    container.appendChild(empty);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "empowered-detail-list";

  list.forEach((entry, index) => {
    const li = document.createElement("li");
    const where = getEntryWhereText(entry);
    li.textContent = `${index + 1}. ${where}`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function renderResults() {
  const ul = document.getElementById("resultsList");
  if (!ul) return;

  ul.innerHTML = "";
  state.resultsHistory.forEach((entry) => {
    const li = document.createElement("li");

    const main = document.createElement("div");
    main.className = "result-main";

    const tag = document.createElement("span");
    tag.className = "tag " + entry.card.type;
    switch (entry.card.type) {
      case "empowered":
        tag.textContent = "增能";
        break;
      case "selected":
        tag.textContent = "精选";
        break;
      case "star5":
        tag.textContent = "五星";
        break;
      case "star4":
        tag.textContent = "四星";
        break;
      case "star3":
        tag.textContent = "三星";
        break;
      default:
        tag.textContent = entry.card.type || "";
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "result-name";
    nameSpan.textContent =
      entry.card.type === "empowered" ? entry.card.name : entry.card.name || "";

    main.appendChild(tag);
    main.appendChild(nameSpan);

    const meta = document.createElement("span");
    meta.className = "result-meta";

    const where = getEntryWhereText(entry);
    meta.textContent = `${entry.time} · ${where}`;

    li.appendChild(main);
    li.appendChild(meta);

    ul.appendChild(li);
  });
}

function renderRewards() {
  const ul = document.getElementById("rewardsList");
  const hint = document.getElementById("noRewardsHint");
  const rewardsTitle = document.getElementById("rewardsTitle");
  const rewardOpenModeSelect = document.getElementById("rewardOpenModeSelect");
  const selectPanel = document.getElementById("selectRewardContainer");
  const selectCountSpan = document.getElementById("selectRewardCount");
  const exchangePanel = document.getElementById("exchangePanel");
  const badgeCountDisplay = document.getElementById("badgeCountDisplay");
  const exchangeSpecificChoice = document.getElementById("exchangeSpecificChoice");
  const btnExchangeRandomEmpowered = document.getElementById(
    "btnExchangeRandomEmpowered"
  );
  const btnExchangeDBSelect = document.getElementById("btnExchangeDBSelect");
  const btnExchangeAnySelect = document.getElementById("btnExchangeAnySelect");
  const btnExchangeAnySelectSkin = document.getElementById(
    "btnExchangeAnySelectSkin"
  );

  if (
    !ul ||
    !hint ||
    !rewardsTitle ||
    !rewardOpenModeSelect ||
    !selectPanel ||
    !selectCountSpan ||
    !exchangePanel ||
    !badgeCountDisplay ||
    !exchangeSpecificChoice ||
    !btnExchangeRandomEmpowered ||
    !btnExchangeDBSelect ||
    !btnExchangeAnySelect ||
    !btnExchangeAnySelectSkin
  ) {
    return;
  }

  rewardsTitle.textContent = isExchangePool()
    ? "待开启兑换奖励/自选包"
    : isChainPool()
    ? "待开启礼包奖励 / 自选包"
    : "待开启累抽奖励 / 自选包";
  rewardOpenModeSelect.value = getRewardOpenMode();

  ul.innerHTML = "";
  if (state.rewards.length === 0) {
    hint.classList.remove("hidden");
  } else {
    hint.classList.add("hidden");
  }

  state.rewards
    .slice()
    .sort((a, b) => {
      if (isChainPool()) {
        return (a.tier || 0) - (b.tier || 0);
      }
      return a.pulls - b.pulls;
    })
    .forEach((reward) => {
      const li = document.createElement("li");

      const labelWrapper = document.createElement("div");
      labelWrapper.className = "reward-label";
      const titleSpan = document.createElement("span");
      titleSpan.textContent = isExchangePool()
        ? "兑换奖励"
        : isChainPool()
        ? `第${reward.tier || "?"}档奖励`
        : `${reward.pulls} 抽奖励`;
      const typeSpan = document.createElement("span");
      typeSpan.className = "reward-type";

      let typeText = reward.label || "";
      if (!typeText) {
        typeText = reward.type;
      }
      typeSpan.textContent = typeText;

      labelWrapper.appendChild(titleSpan);
      labelWrapper.appendChild(typeSpan);

      const btn = document.createElement("button");
      btn.textContent = "开包";
      btn.addEventListener("click", () => openRewardById(reward.id));

      li.appendChild(labelWrapper);
      li.appendChild(btn);

      ul.appendChild(li);
    });

  // 自选包面板
  if (state.pendingSelectRewardCount > 0) {
    selectPanel.classList.remove("hidden");
  } else {
    selectPanel.classList.add("hidden");
  }
  selectCountSpan.textContent = String(state.pendingSelectRewardCount);

  if (isExchangePool()) {
    const cfg = getExchangeConfig();
    exchangePanel.classList.remove("hidden");
    badgeCountDisplay.textContent = String(state.badges);
    const specificPlayers = cfg.specificPlayers || [];
    const currentValue = exchangeSpecificChoice.value;
    exchangeSpecificChoice.innerHTML = "";
    specificPlayers.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      exchangeSpecificChoice.appendChild(opt);
    });
    if (specificPlayers.includes(currentValue)) {
      exchangeSpecificChoice.value = currentValue;
    }

    btnExchangeRandomEmpowered.textContent = "25 徽章兑换随机增能卡必得券";
    if (cfg.fixedSelect42) {
      btnExchangeDBSelect.classList.remove("hidden");
      btnExchangeDBSelect.textContent = `42 徽章兑换${cfg.fixedSelect42}自选`;
    } else {
      btnExchangeDBSelect.classList.add("hidden");
    }

    if (Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0) {
      btnExchangeAnySelect.textContent = "47 徽章兑换主菜自选券";
    } else {
      btnExchangeAnySelect.textContent = "47 徽章兑换任意增能卡自选";
    }

    if (cfg.hasSkin52) {
      btnExchangeAnySelectSkin.classList.remove("hidden");
      btnExchangeAnySelectSkin.textContent = "52 徽章兑换任意自选 + 维埃拉皮肤";
    } else {
      btnExchangeAnySelectSkin.classList.add("hidden");
    }
  } else {
    exchangePanel.classList.add("hidden");
  }
}

function renderMilestonesTable() {
  const tbody = document.getElementById("milestoneTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (isChainPool()) {
    const tiers = getCurrentPool().chainTiers || [];
    tiers.forEach((tier) => {
      const tr = document.createElement("tr");
      const tdPulls = document.createElement("td");
      const tdLabel = document.createElement("td");
      tdPulls.textContent = `第${tier.tier}档（${tier.costGold}金币）`;
      const rewardCounts = {};
      (tier.rewards || []).forEach((kind) => {
        rewardCounts[kind] = (rewardCounts[kind] || 0) + 1;
      });
      const rewardText = Object.keys(rewardCounts)
        .map((kind) => {
          const name = getChainRewardKindLabel(kind, getCurrentPool());
          const count = rewardCounts[kind];
          return count > 1 ? `${name}*${count}` : name;
        })
        .join(" + ");

      tdLabel.textContent = rewardText;
      tr.appendChild(tdPulls);
      tr.appendChild(tdLabel);
      tbody.appendChild(tr);
    });
    return;
  }

  if (isSeasonPool()) {
    const rows = [
      { pulls: "20 抽", text: "增能卡概率提升100%" },
      { pulls: "40 抽", text: "增能卡概率提升200%" },
      { pulls: "60 抽", text: "增能卡概率提升300%" },
      { pulls: "80 抽", text: "增能卡概率提升400%" },
      { pulls: "200 抽", text: "随机不重复增能卡" },
      { pulls: "500 抽", text: "增能卡自选券（到达后进入下一轮）" },
    ];
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const tdPulls = document.createElement("td");
      const tdLabel = document.createElement("td");
      tdPulls.textContent = row.pulls;
      tdLabel.textContent = row.text;
      tr.appendChild(tdPulls);
      tr.appendChild(tdLabel);
      tbody.appendChild(tr);
    });
    return;
  }

  if (isAccumulatedGuaranteePool()) {
    const rows = [
      { pulls: "20 抽", text: "定向球员概率提升200%" },
      { pulls: "60 抽", text: "定向球员概率提升300%" },
      { pulls: "80 抽", text: "定向球员概率提升800%" },
      { pulls: "100 抽", text: "定向球员概率提升1000%" },
      { pulls: "120 抽", text: "定向球员概率提升1500%" },
      { pulls: "140 抽", text: "定向球员概率提升5000%" },
      { pulls: "160 抽", text: `必得${getAccumulatedGuaranteeConfig()?.targetName || "定向球员"}` },
    ];
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const tdPulls = document.createElement("td");
      const tdLabel = document.createElement("td");
      tdPulls.textContent = row.pulls;
      tdLabel.textContent = row.text;
      tr.appendChild(tdPulls);
      tr.appendChild(tdLabel);
      tbody.appendChild(tr);
    });
    return;
  }

  if (isExchangePool()) {
    const cfg = getExchangeConfig();
    const specificText = (cfg.specificPlayers || []).join("/");
    const exchangeRows = [
      { pulls: "每 10 抽", text: "赠送 1 个徽章" },
      { pulls: "6 徽章", text: `兑换 10% 特定增能球员卡（${specificText}）` },
      { pulls: "25 徽章", text: "兑换随机增能卡必得券" },
    ];
    if (cfg.fixedSelect42) {
      exchangeRows.push({ pulls: "42 徽章", text: `兑换${cfg.fixedSelect42}自选` });
    }
    if (Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0) {
      exchangeRows.push({
        pulls: "47 徽章",
        text: `兑换主菜自选券（${cfg.select47Players.join("/")}）`,
      });
    } else {
      exchangeRows.push({ pulls: "47 徽章", text: "兑换任意增能卡自选" });
    }
    if (cfg.hasSkin52) {
      exchangeRows.push({ pulls: "52 徽章", text: "兑换任意自选 + 维埃拉皮肤" });
    }
    exchangeRows.forEach((row) => {
      const tr = document.createElement("tr");
      const tdPulls = document.createElement("td");
      const tdLabel = document.createElement("td");
      tdPulls.textContent = row.pulls;
      tdLabel.textContent = row.text;
      tr.appendChild(tdPulls);
      tr.appendChild(tdLabel);
      tbody.appendChild(tr);
    });
    return;
  }

  getCurrentPool().milestones.forEach((m) => {
    const tr = document.createElement("tr");
    const tdPulls = document.createElement("td");
    const tdLabel = document.createElement("td");
    tdPulls.textContent = `${m.pulls} 抽`;

    let text = m.label || "";
    if (m.type === "empowered_random") {
      text ||= "必得随机增能卡";
    } else if (m.type === "empowered_select") {
      text ||= "自选增能卡签约";
    } else if (m.type === "five_star") {
      text ||= "五星普卡签约";
    }
    tdLabel.textContent = text;

    tr.appendChild(tdPulls);
    tr.appendChild(tdLabel);
    tbody.appendChild(tr);
  });
}

function renderQuickButtonsByPool() {
  const btnQuick60 = document.getElementById("btnQuick60");
  const btnQuick250 = document.getElementById("btnQuick250");
  const btnQuick420 = document.getElementById("btnQuick420");
  const btnQuick470 = document.getElementById("btnQuick470");
  const btnQuick520 = document.getElementById("btnQuick520");
  if (!btnQuick60 || !btnQuick250 || !btnQuick420 || !btnQuick470 || !btnQuick520) {
    return;
  }

  const pool = getCurrentPool();
  const setBtn = (btn, text, drawCount, targetTotal, targetBadges, hidden = false) => {
    btn.textContent = text;
    if (drawCount == null) {
      btn.removeAttribute("data-draw-count");
    } else {
      btn.setAttribute("data-draw-count", String(drawCount));
    }
    if (targetTotal == null) {
      btn.removeAttribute("data-target-total");
    } else {
      btn.setAttribute("data-target-total", String(targetTotal));
    }
    if (targetBadges == null) {
      btn.removeAttribute("data-target-badges");
    } else {
      btn.setAttribute("data-target-badges", String(targetBadges));
    }
    if (hidden) {
      btn.classList.add("hidden");
    } else {
      btn.classList.remove("hidden");
    }
  };

  if (pool.progressionType === "milestone") {
    if (activePoolKey === "defense_guardians_gift") {
      setBtn(btnQuick60, "一键到 60 抽", null, 60, null);
      setBtn(btnQuick250, "一键到 100 抽", null, 100, null);
      setBtn(btnQuick420, "一键到 200 抽", null, 200, null);
      setBtn(btnQuick470, "一键到 420 抽", null, 420, null);
      setBtn(btnQuick520, "一键到 420 抽", null, 420, null, true);
      return;
    }
    // 狂欢赠礼卡池：恢复原来的“一键到多少”
    setBtn(btnQuick60, "一键到 60 抽", null, 60, null);
    setBtn(btnQuick250, "一键到 100 抽", null, 100, null);
    setBtn(btnQuick420, "一键到 200 抽", null, 200, null);
    setBtn(btnQuick470, "一键到 500 抽", null, 500, null);
    setBtn(btnQuick520, "一键到 850 抽", null, 850, null);
    return;
  }

  if (isSeasonPool()) {
    // 赛季累抽继承：按每轮累抽进度“一键到多少”，最高到 500
    setBtn(btnQuick60, "一键到 60 抽", null, 60, null);
    setBtn(btnQuick250, "一键到 100 抽", null, 100, null);
    setBtn(btnQuick420, "一键到 200 抽", null, 200, null);
    setBtn(btnQuick470, "一键到 500 抽", null, 500, null);
    setBtn(btnQuick520, "一键到 500 抽", null, 500, null, true);
    return;
  }

  if (isExchangePool()) {
    const cfg = getExchangeConfig();
    setBtn(btnQuick60, "一键抽到徽章 6", null, null, 6);
    setBtn(btnQuick250, "一键抽到徽章 25", null, null, 25);
    if (cfg.fixedSelect42) {
      setBtn(btnQuick420, "一键抽到徽章 42", null, null, 42);
      setBtn(btnQuick470, "一键抽到徽章 47", null, null, 47);
      if (cfg.hasSkin52) {
        setBtn(btnQuick520, "一键抽到徽章 52", null, null, 52);
      } else {
        setBtn(btnQuick520, "一键抽到徽章 47", null, null, 47, true);
      }
    } else {
      setBtn(btnQuick420, "一键抽到徽章 47", null, null, 47);
      setBtn(btnQuick470, "一键抽到徽章 47", null, null, 47, true);
      setBtn(btnQuick520, "一键抽到徽章 47", null, null, 47, true);
    }
    return;
  }

  if (isAccumulatedGuaranteePool()) {
    setBtn(btnQuick60, "一键抽 20", 20, null, null);
    setBtn(btnQuick250, "一键抽 60", 60, null, null);
    setBtn(btnQuick420, "一键抽 100", 100, null, null);
    setBtn(btnQuick470, "一键抽 140", 140, null, null);
    setBtn(btnQuick520, "一键抽 160", 160, null, null);
    return;
  }

  if (activePoolKey === "lucky_drop_exchange") {
    setBtn(btnQuick60, "一键抽 60", 60, null, null);
    setBtn(btnQuick250, "一键抽 250", 250, null, null);
    setBtn(btnQuick420, "一键抽 420", 420, null, null, true);
    setBtn(btnQuick470, "一键抽 470", 470, null, null);
    setBtn(btnQuick520, "一键抽 520", 520, null, null, true);
  } else {
    setBtn(btnQuick60, "一键抽 60", 60, null, null);
    setBtn(btnQuick250, "一键抽 250", 250, null, null);
    setBtn(btnQuick420, "一键抽 420", 420, null, null);
    setBtn(btnQuick470, "一键抽 470", 470, null, null);
    setBtn(btnQuick520, "一键抽 520", 520, null, null);
  }
}

function renderDrawPanelByPool() {
  const normal = document.getElementById("normalDrawPanel");
  const chain = document.getElementById("chainDrawPanel");
  const chainTierStatus = document.getElementById("chainTierStatus");
  const chainTierProgressBar = document.getElementById("chainTierProgressBar");
  const chainTierProgressFill = document.getElementById("chainTierProgressFill");
  const seasonRoundInfo = document.getElementById("seasonRoundInfo");
  if (!normal || !chain || !chainTierStatus || !chainTierProgressBar || !chainTierProgressFill) return;

  if (isChainPool()) {
    normal.classList.add("hidden");
    chain.classList.remove("hidden");
    if (seasonRoundInfo) {
      seasonRoundInfo.classList.add("hidden");
    }
    const maxTier = (getCurrentPool().chainTiers || []).length;
    chainTierProgressBar.innerHTML = "";
    for (let i = 1; i <= maxTier; i += 1) {
      const step = document.createElement("div");
      step.className = "chain-step";
      if (i < state.chainTierProgress) {
        step.classList.add("done");
      } else if (i === state.chainTierProgress) {
        step.classList.add("current");
      }
      step.textContent = `第${i}档`;
      chainTierProgressBar.appendChild(step);
    }
    if (state.chainTierProgress >= maxTier) {
      chainTierStatus.textContent = "拉满七档！";
    } else if (state.chainTierProgress <= 0) {
      chainTierStatus.textContent = "第 0 档（未开始）";
    } else {
      chainTierStatus.textContent = "第 " + state.chainTierProgress + " 档";
    }

    const progressPercent = maxTier > 0
      ? Math.min(state.chainTierProgress, maxTier) / maxTier * 100
      : 0;
    chainTierProgressFill.style.width = progressPercent + "%";
  } else {
    chain.classList.add("hidden");
    normal.classList.remove("hidden");
    chainTierProgressBar.innerHTML = "";
    chainTierProgressFill.style.width = "0%";
    if (seasonRoundInfo) {
      if (isSeasonPool()) {
        const progress = state.seasonProgressPulls || 0;
        seasonRoundInfo.textContent = `当前轮次进度：${progress} / 500`;
        seasonRoundInfo.classList.remove("hidden");
      } else if (isAccumulatedGuaranteePool()) {
        seasonRoundInfo.textContent = `当前定向进度：${state.totalPulls || 0} / ${getAccumulatedGuaranteeProgressCap()}`;
        seasonRoundInfo.classList.remove("hidden");
      } else {
        seasonRoundInfo.classList.add("hidden");
      }
    }
  }
}

function renderAll() {
  updatePoolHeader();
  renderModeInfo();
  renderExpectedDrawInfo();
  renderProbabilities();
  renderAccumulatedTargetSwitch();
  renderFavExpectedInfo();
  renderStats();
  renderLuckScore();
  renderPityTracker();
  renderRewards();
  renderMilestonesTable();
  renderQuickButtonsByPool();
  renderDrawPanelByPool();
  renderResults();
  renderMomentPreview();
}

// ================= 事件绑定 =================

function bindEvents() {
  const btnSingle = document.getElementById("btnSingle");
  const btnTen = document.getElementById("btnTen");
  const btnFifty = document.getElementById("btnFifty");
  const btnReset = document.getElementById("btnReset");
  const btnResetChain = document.getElementById("btnResetChain");
  const quickButtons = document.querySelectorAll(
    ".quick-buttons button[data-target-total], .quick-buttons button[data-draw-count], .quick-buttons button[data-target-badges]"
  );
  const chainTierButtons = document.querySelectorAll(
    ".quick-buttons button[data-chain-target-tier]"
  );
  const btnChainNext = document.getElementById("btnChainNext");
  const btnConfirmSelect = document.getElementById("btnConfirmSelect");
  const btnOpenAllRewards = document.getElementById("btnOpenAllRewards");
  const rewardOpenModeSelect = document.getElementById("rewardOpenModeSelect");
  const btnAutoToFav = document.getElementById("btnAutoToFav");
  const btnFavSelectAll = document.getElementById("btnFavSelectAll");
  const btnChainFavSelectAll = document.getElementById("btnChainFavSelectAll");
  const favEmpoweredChoice = document.getElementById("favEmpoweredChoice");
  const chainFavEmpoweredChoice = document.getElementById("chainFavEmpoweredChoice");
  const accumulatedTargetChoice = document.getElementById("accumulatedTargetChoice");
  const poolTypeChoice = document.getElementById("poolTypeChoice");
  const poolSwitchChoice = document.getElementById("poolSwitchChoice");
  const modeSwitchSelect = document.getElementById("modeSwitchSelect");
  const animationModeSelect = document.getElementById("animationModeSelect");
  const btnRechargeToggle = document.getElementById("btnRechargeToggle");
  const btnRechargeCancel = document.getElementById("btnRechargeCancel");
  const rechargeButtons = document.querySelectorAll(
    "#rechargeModal button[data-recharge-gold]"
  );
  const btnInsufficientCancel = document.getElementById("btnInsufficientCancel");
  const btnInsufficientRecharge = document.getElementById(
    "btnInsufficientRecharge"
  );
  const btnBadgeInsufficientClose = document.getElementById(
    "btnBadgeInsufficientClose"
  );
  const btnDemoCinematicEpic = document.getElementById("btnDemoCinematicEpic");
  const btnDemoCinematicST = document.getElementById("btnDemoCinematicST");
  const btnDemoCinematicBT = document.getElementById("btnDemoCinematicBT");
  const btnLightningLab = document.getElementById("btnLightningLab");
  const btnTurtleLab = document.getElementById("btnTurtleLab");
  const btnCinematicReplay = document.getElementById("btnCinematicReplay");
  const btnCinematicClose = document.getElementById("btnCinematicClose");
  const cinematicDemoModal = document.getElementById("cinematicDemoModal");
  const lightningLabModal = document.getElementById("lightningLabModal");
  const turtleLabModal = document.getElementById("turtleLabModal");
  const btnLightningReplay = document.getElementById("btnLightningReplay");
  const btnLightningClose = document.getElementById("btnLightningClose");
  const btnTurtleReplay = document.getElementById("btnTurtleReplay");
  const btnTurtleClose = document.getElementById("btnTurtleClose");
  const btnRealModeInitCancel = document.getElementById("btnRealModeInitCancel");
  const btnRealModeInitConfirm = document.getElementById("btnRealModeInitConfirm");
  const realModeGoldInput = document.getElementById("realModeGoldInput");
  const btnFavHitClose = document.getElementById("btnFavHitClose");
  const btnReplayMoments = document.getElementById("btnReplayMoments");
  const btnMomentReplayClose = document.getElementById("btnMomentReplayClose");
  const btnExchangeSpecific10 = document.getElementById("btnExchangeSpecific10");
  const btnExchangeRandomEmpowered = document.getElementById(
    "btnExchangeRandomEmpowered"
  );
  const btnExchangeDBSelect = document.getElementById("btnExchangeDBSelect");
  const btnExchangeAnySelect = document.getElementById("btnExchangeAnySelect");
  const btnExchangeAnySelectSkin = document.getElementById(
    "btnExchangeAnySelectSkin"
  );

  if (btnSingle) {
    btnSingle.addEventListener("click", () => {
      singlePull();
    });
  }
  if (btnTen) {
    btnTen.addEventListener("click", () => {
      tenPull();
    });
  }
  if (btnFifty) {
    btnFifty.addEventListener("click", () => {
      autoDrawCount(50);
    });
  }
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      resetAll();
    });
  }
  if (btnResetChain) {
    btnResetChain.addEventListener("click", () => {
      resetAll();
    });
  }
  quickButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const drawCount = btn.getAttribute("data-draw-count");
      if (drawCount != null) {
        autoDrawCount(drawCount);
        return;
      }
      const targetBadges = btn.getAttribute("data-target-badges");
      if (targetBadges != null) {
        autoToTargetBadges(targetBadges);
        return;
      }
      const target = btn.getAttribute("data-target-total");
      autoToTargetTotal(target);
    });
  });
  if (btnChainNext) {
    btnChainNext.addEventListener("click", () => {
      drawNextChainTier();
    });
  }
  chainTierButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTier = btn.getAttribute("data-chain-target-tier");
      drawToChainTier(targetTier);
    });
  });
  if (btnConfirmSelect) {
    btnConfirmSelect.addEventListener("click", () => {
      confirmSelectReward();
    });
  }
  if (btnOpenAllRewards) {
    btnOpenAllRewards.addEventListener("click", () => {
      openAllRewards();
    });
  }
  if (rewardOpenModeSelect) {
    rewardOpenModeSelect.addEventListener("change", () => {
      setRewardOpenMode(rewardOpenModeSelect.value);
    });
  }
  if (btnAutoToFav) {
    btnAutoToFav.addEventListener("click", () => {
      autoToFavoredEmpowered();
    });
  }
  if (favEmpoweredChoice) {
    favEmpoweredChoice.addEventListener("change", () => {
      renderFavTagSelector("favEmpoweredChoice", "favEmpoweredTags");
      updateFavSelectAllButton("favEmpoweredChoice", "btnFavSelectAll");
      renderFavExpectedInfo();
      renderStats();
    });
  }
  if (btnFavSelectAll && favEmpoweredChoice) {
    btnFavSelectAll.addEventListener("click", () => {
      const options = Array.from(favEmpoweredChoice.options || []);
      const selectedCount = Array.from(favEmpoweredChoice.selectedOptions || []).length;
      const allSelected = options.length > 0 && selectedCount === options.length;
      options.forEach((opt) => {
        opt.selected = !allSelected;
      });
      favEmpoweredChoice.dispatchEvent(new Event("change"));
    });
  }
  if (chainFavEmpoweredChoice) {
    chainFavEmpoweredChoice.addEventListener("change", () => {
      renderFavTagSelector("chainFavEmpoweredChoice", "chainFavEmpoweredTags");
      updateFavSelectAllButton("chainFavEmpoweredChoice", "btnChainFavSelectAll");
      renderFavExpectedInfo();
      renderStats();
    });
  }
  if (btnChainFavSelectAll && chainFavEmpoweredChoice) {
    btnChainFavSelectAll.addEventListener("click", () => {
      const options = Array.from(chainFavEmpoweredChoice.options || []);
      const selectedCount = Array.from(chainFavEmpoweredChoice.selectedOptions || []).length;
      const allSelected = options.length > 0 && selectedCount === options.length;
      options.forEach((opt) => {
        opt.selected = !allSelected;
      });
      chainFavEmpoweredChoice.dispatchEvent(new Event("change"));
    });
  }
  if (poolTypeChoice) {
    poolTypeChoice.addEventListener("change", () => {
      onPoolTypeChoiceChange();
    });
  }
  if (poolSwitchChoice) {
    poolSwitchChoice.addEventListener("change", () => {
      onPoolSwitchChoiceChange();
    });
  }
  if (accumulatedTargetChoice) {
    accumulatedTargetChoice.addEventListener("change", () => {
      const targetKey = accumulatedTargetChoice.value;
      if (!targetKey || targetKey === activePoolKey) return;
      switchPool(targetKey);
    });
  }
  if (modeSwitchSelect) {
    modeSwitchSelect.addEventListener("change", () => {
      const target = modeSwitchSelect.value;
      if (target === REAL_MODE_KEY && realModeMeta.remainingGold == null) {
        pendingModeSwitch = REAL_MODE_KEY;
        modeSwitchSelect.value = activeModeKey;
        openRealModeInitModal();
        return;
      }
      const success = switchMode(target);
      if (!success) {
        modeSwitchSelect.value = activeModeKey;
      }
    });
  }
  if (skinModeSelect) {
    skinModeSelect.addEventListener("change", () => {
      setSkinMode(skinModeSelect.value);
    });
    skinModeSelect.addEventListener("input", () => {
      setSkinMode(skinModeSelect.value);
    });
  }
  if (animationModeSelect) {
    animationModeSelect.addEventListener("change", () => {
      closeFavHitModal();
      pendingFavoredHitEvent = null;
    });
  }
  if (btnRechargeToggle) {
    btnRechargeToggle.addEventListener("click", () => {
      openRechargeModal();
    });
  }
  if (btnRechargeCancel) {
    btnRechargeCancel.addEventListener("click", () => {
      closeRechargeModal();
    });
  }
  rechargeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const gold = Number(btn.getAttribute("data-recharge-gold"));
      const rmb = Number(btn.getAttribute("data-recharge-rmb"));
      rechargeGold(gold, rmb);
    });
  });
  if (btnInsufficientCancel) {
    btnInsufficientCancel.addEventListener("click", () => {
      closeInsufficientGoldModal();
    });
  }
  if (btnInsufficientRecharge) {
    btnInsufficientRecharge.addEventListener("click", () => {
      closeInsufficientGoldModal();
      openRechargeModal();
    });
  }
  if (btnBadgeInsufficientClose) {
    btnBadgeInsufficientClose.addEventListener("click", () => {
      closeBadgeInsufficientModal();
    });
  }
  if (btnDemoCinematicEpic) {
    btnDemoCinematicEpic.addEventListener("click", () => {
      openCinematicDemoModal("史诗");
    });
  }
  if (btnDemoCinematicST) {
    btnDemoCinematicST.addEventListener("click", () => {
      openCinematicDemoModal("ST");
    });
  }
  if (btnDemoCinematicBT) {
    btnDemoCinematicBT.addEventListener("click", () => {
      openCinematicDemoModal("BT");
    });
  }
  if (btnLightningLab) {
    btnLightningLab.addEventListener("click", () => {
      openLightningLabModal();
    });
  }
  if (btnTurtleLab) {
    btnTurtleLab.addEventListener("click", () => {
      openTurtleLabModal();
    });
  }
  if (btnLightningReplay) {
    btnLightningReplay.addEventListener("click", () => {
      replayLightningLab();
    });
  }
  if (btnLightningClose) {
    btnLightningClose.addEventListener("click", () => {
      closeLightningLabModal();
    });
  }
  if (btnTurtleReplay) {
    btnTurtleReplay.addEventListener("click", () => {
      replayTurtleLab();
    });
  }
  if (btnTurtleClose) {
    btnTurtleClose.addEventListener("click", () => {
      closeTurtleLabModal();
    });
  }
  if (btnCinematicReplay) {
    btnCinematicReplay.addEventListener("click", () => {
      if (cinematicDemoContext && cinematicDemoContext.isLiveEvent && cinematicDemoContext.rawEvent) {
        replayCinematicDemoModal({ mode: "live", event: cinematicDemoContext.rawEvent });
      } else {
        replayCinematicDemoModal({
          mode: "preview",
          previewType: (cinematicDemoContext && cinematicDemoContext.previewType) || cinematicDemoPreviewType,
        });
      }
    });
  }
  if (btnCinematicClose) {
    btnCinematicClose.addEventListener("click", () => {
      if (!cinematicDemoDone) {
        finishCinematicDemoInstantly();
        return;
      }
      closeCinematicDemoModal();
    });
  }
  if (cinematicDemoModal) {
    cinematicDemoModal.addEventListener("click", (event) => {
      if (event.target === cinematicDemoModal) {
        closeCinematicDemoModal();
      }
    });
  }
  if (lightningLabModal) {
    lightningLabModal.addEventListener("click", (event) => {
      if (event.target === lightningLabModal) {
        closeLightningLabModal();
      }
    });
  }
  if (turtleLabModal) {
    turtleLabModal.addEventListener("click", (event) => {
      if (event.target === turtleLabModal) {
        closeTurtleLabModal();
      }
    });
  }
  if (btnRealModeInitCancel) {
    btnRealModeInitCancel.addEventListener("click", () => {
      pendingModeSwitch = null;
      closeRealModeInitModal();
    });
  }
  if (btnRealModeInitConfirm) {
    btnRealModeInitConfirm.addEventListener("click", () => {
      confirmRealModeInit();
    });
  }
  if (realModeGoldInput) {
    realModeGoldInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        confirmRealModeInit();
      }
    });
  }
  if (btnFavHitClose) {
    btnFavHitClose.addEventListener("click", () => {
      closeFavHitModal();
    });
  }
  if (btnReplayMoments) {
    btnReplayMoments.addEventListener("click", () => {
      openMomentReplayModal();
    });
  }
  if (btnMomentReplayClose) {
    btnMomentReplayClose.addEventListener("click", () => {
      closeMomentReplayModal();
    });
  }
  if (btnExchangeSpecific10) {
    btnExchangeSpecific10.addEventListener("click", () => {
      exchangeSpecificChanceReward();
    });
  }
  if (btnExchangeRandomEmpowered) {
    btnExchangeRandomEmpowered.addEventListener("click", () => {
      exchangeRandomEmpoweredReward();
    });
  }
  if (btnExchangeDBSelect) {
    btnExchangeDBSelect.addEventListener("click", () => {
      exchangeDBSelectReward();
    });
  }
  if (btnExchangeAnySelect) {
    btnExchangeAnySelect.addEventListener("click", () => {
      exchangeAnySelectReward();
    });
  }
  if (btnExchangeAnySelectSkin) {
    btnExchangeAnySelectSkin.addEventListener("click", () => {
      exchangeAnySelectWithSkinReward();
    });
  }
}

// ================= 初始化 =================

document.addEventListener("DOMContentLoaded", () => {
  checkAppSync();
  loadSkinMode();
  populatePoolTypeChoices();
  populatePoolSwitchChoicesByType(getCurrentPool().poolType || "carnival_gift");
  bindEvents();
  renderAll();
});
