// ================= 配置区域：多卡池 =================
const APP_VERSION =
  (document.currentScript &&
    new URL(document.currentScript.src, window.location.href).searchParams.get("v")) ||
  "2026.08.02.1";

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

function createAccumulatedGiftMilestones(config = {}) {
  const genericLabel = config.genericLabel || "5星签约 10%含钢铁防线史诗";
  const genericTargets = config.genericTargets || [
    "布冯",
    "德尔皮耶罗",
    "科库",
    "贝隆",
    "巴雷西",
    "埃托奥",
    "加西亚",
  ];
  const firstTarget = config.firstTarget || "布冯";
  const firstLabel = config.firstLabel || "5星签约 10%含吉安路易吉·布冯";
  const secondTarget = config.secondTarget || "科库";
  const secondLabel = config.secondLabel || "5星签约 10%含菲利普·科库";
  const rows = [
    { pulls: 30, candidateNames: genericTargets, label: genericLabel },
    { pulls: 60, candidateNames: genericTargets, label: genericLabel },
    { pulls: 90, targetName: firstTarget, label: firstLabel },
    { pulls: 120, candidateNames: genericTargets, label: genericLabel },
    { pulls: 150, candidateNames: genericTargets, label: genericLabel },
    { pulls: 180, targetName: secondTarget, label: secondLabel },
    { pulls: 210, candidateNames: genericTargets, label: genericLabel },
    { pulls: 240, candidateNames: genericTargets, label: genericLabel },
    { pulls: 270, targetName: firstTarget, label: firstLabel },
    { pulls: 300, candidateNames: genericTargets, label: genericLabel },
    { pulls: 330, candidateNames: genericTargets, label: genericLabel },
    { pulls: 360, targetName: secondTarget, label: secondLabel },
    { pulls: 390, candidateNames: genericTargets, label: genericLabel },
    { pulls: 420, candidateNames: genericTargets, label: genericLabel },
  ];
  return rows.map((row) => ({
    pulls: row.pulls,
    type: "exchange_target_chance",
    chance: 0.1,
    targetName: row.targetName,
    candidateNames: row.candidateNames || null,
    label: row.label,
  }));
}

function createDefenseGiftMilestones() {
  return createAccumulatedGiftMilestones();
}

const SPRING_SHOP_PLAYERS = [
  "麦孔",
  "弗莱彻",
  "菲戈",
  "迪达",
  "科尔",
  "贝林厄姆",
  "居莱尔",
  "楚阿梅尼",
  "凯塞多",
  "卢卡库",
];

const SPRING_SHOP_ALL_SELECT_PLAYERS = ["瓦拉内", ...SPRING_SHOP_PLAYERS];

const GERMAN_GLORY_BOX_MILESTONES = [
  [5, "glory_highlight_box", "荣耀高光礼盒"],
  [10, "glory_dream_box", "高光梦幻箱式"],
  [20, "glory_highlight_box", "荣耀高光礼盒"],
  [25, "glory_highlight_box", "荣耀高光礼盒"],
  [35, "glory_dream_box", "高光梦幻箱式"],
  [40, "glory_highlight_box", "荣耀高光礼盒"],
  [50, "glory_highlight_box", "荣耀高光礼盒"],
  [55, "glory_dream_box", "高光梦幻箱式"],
  [65, "glory_highlight_box", "荣耀高光礼盒"],
  [70, "glory_highlight_box", "荣耀高光礼盒"],
  [80, "glory_dream_box", "高光梦幻箱式"],
  [85, "glory_highlight_box", "荣耀高光礼盒"],
  [95, "glory_highlight_box", "荣耀高光礼盒"],
  [100, "glory_dream_box", "高光梦幻箱式"],
  [110, "glory_highlight_box", "荣耀高光礼盒"],
  [115, "glory_highlight_box", "荣耀高光礼盒"],
  [125, "glory_dream_box", "高光梦幻箱式"],
  [130, "glory_highlight_box", "荣耀高光礼盒"],
  [140, "glory_highlight_box", "荣耀高光礼盒"],
  [145, "glory_dream_box", "高光梦幻箱式"],
].map(([pulls, type, label]) => ({ pulls, type, label }));

const STAR_PACK_TEAR_PROBABILITIES = {
  potential: 0.4,
  signing: 0.25,
  tear: 0.35,
};
const STAR_PACK_SIGNING_RATES = [0.05, 0.1, 0.3, 1];
const STAR_PACK_MAX_TILES = 9;
const STAR_PACK_LUCKY_STAR_RATE = 0.33;
// 与“每包至少1颗”的补发保底合并后，所有九宫格长度加权为综合33%。
const STAR_PACK_LUCKY_STAR_BASE_RATE = 0.31047719769203075;

function calcStarPackRouteMetrics() {
  const metrics = {
    validProbability: 0,
    signingTierWeights: [0, 0, 0, 0],
    potentialTierWeights: [0, 0, 0, 0],
    lengthWeights: new Array(STAR_PACK_MAX_TILES + 1).fill(0),
  };

  const visit = (length, probability, potential, signing, tear) => {
    if (tear >= 2 || length >= STAR_PACK_MAX_TILES) {
      const potentialTier = Math.min(3, Math.floor(potential / 2));
      const signingTier = Math.min(3, Math.floor(signing / 2));
      if (tear >= 2 && (potentialTier > 0 || signingTier > 0)) {
        metrics.validProbability += probability;
        metrics.signingTierWeights[signingTier] += probability;
        metrics.potentialTierWeights[potentialTier] += probability;
        metrics.lengthWeights[length] += probability;
      }
      return;
    }

    visit(
      length + 1,
      probability * STAR_PACK_TEAR_PROBABILITIES.potential,
      potential + 1,
      signing,
      tear
    );
    visit(
      length + 1,
      probability * STAR_PACK_TEAR_PROBABILITIES.signing,
      potential,
      signing + 1,
      tear
    );
    visit(
      length + 1,
      probability * STAR_PACK_TEAR_PROBABILITIES.tear,
      potential,
      signing,
      tear + 1
    );
  };

  visit(0, 1, 0, 0, 0);
  const normalize = (weights) =>
    weights.map((weight) => weight / metrics.validProbability);
  metrics.signingTierWeights = normalize(metrics.signingTierWeights);
  metrics.potentialTierWeights = normalize(metrics.potentialTierWeights);
  metrics.lengthWeights = normalize(metrics.lengthWeights);
  metrics.expectedCoreRate = metrics.signingTierWeights.reduce(
    (sum, weight, tier) => sum + weight * STAR_PACK_SIGNING_RATES[tier],
    0
  );
  metrics.expectedRouteLength = metrics.lengthWeights.reduce(
    (sum, weight, length) => sum + weight * length,
    0
  );
  metrics.expectedLuckyStarsPerPack = metrics.lengthWeights.reduce(
    (sum, weight, length) =>
      sum +
      weight *
        (length * STAR_PACK_LUCKY_STAR_BASE_RATE +
          (1 - STAR_PACK_LUCKY_STAR_BASE_RATE) ** length),
    0
  );
  return metrics;
}

const STAR_PACK_ROUTE_METRICS = calcStarPackRouteMetrics();

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
  rooster_lions_star_pack: {
    poolType: "star_pack",
    progressionType: "star_pack",
    name: "雄鸡与三狮 球星卡包",
    pricePerPull: 800,
    poolConfig: [
      {
        type: "empowered",
        label: "单包平均出核心概率（九宫格路线加权）",
        probability: STAR_PACK_ROUTE_METRICS.expectedCoreRate,
      },
      {
        type: "star5",
        label: "单包平均出五星普卡概率（九宫格路线加权）",
        probability: 1 - STAR_PACK_ROUTE_METRICS.expectedCoreRate,
      },
    ],
    empoweredCards: [
      "登贝莱",
      "姆巴佩",
      "凯恩",
      "孔德",
      "格列兹曼",
      "坎特",
      "里贝里",
      "鲁尼",
      "贝克汉姆",
      "马克莱莱",
      "佩蒂特",
      "欧文",
      "维埃拉",
    ],
    starPackConfig: {
      luckyStarRate: STAR_PACK_LUCKY_STAR_RATE,
      luckyBoxCost: 15,
      vieiraName: "维埃拉",
      vieiraMilestonePacks: 100,
      directPlayers: [
        "登贝莱",
        "姆巴佩",
        "凯恩",
        "孔德",
        "格列兹曼",
        "坎特",
        "里贝里",
        "鲁尼",
        "贝克汉姆",
        "马克莱莱",
        "佩蒂特",
        "欧文",
      ],
      packCategories: [
        {
          id: "epic",
          label: "史诗高光包",
          weight: 1 / 3,
          players: ["里贝里", "鲁尼", "贝克汉姆", "马克莱莱", "佩蒂特", "欧文"],
        },
        {
          id: "st",
          label: "梦幻精选包",
          weight: 1 / 3,
          players: ["登贝莱", "姆巴佩", "凯恩", "孔德", "格列兹曼", "坎特"],
        },
        {
          id: "mixed",
          label: "史诗+ST混合包",
          weight: 1 / 3,
          players: [
            "里贝里",
            "鲁尼",
            "贝克汉姆",
            "马克莱莱",
            "佩蒂特",
            "欧文",
            "登贝莱",
            "姆巴佩",
            "凯恩",
            "孔德",
            "格列兹曼",
            "坎特",
          ],
        },
      ],
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  german_chariot_glory_box: {
    poolType: "glory_box",
    progressionType: "glory_box",
    name: "德国战车荣耀礼盒",
    pricePerPull: 1000,
    poolConfig: [
      { type: "glory_value", label: "荣耀值", probability: 0.006 },
    ],
    empoweredCards: [
      "拉姆",
      "克洛泽",
      "盖德穆勒",
      "格策",
      "穆夏拉",
      "施洛特贝克",
      "托马斯穆勒",
      "巴蒂斯图塔",
    ],
    gloryConfig: {
      mainPrize: "拉姆",
      highlightTarget: "克洛泽",
      highlightFallback: "巴蒂斯图塔",
      dreamBoxPlayers: ["盖德穆勒", "格策", "穆夏拉", "施洛特贝克", "托马斯穆勒"],
      milestones: GERMAN_GLORY_BOX_MILESTONES,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
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
  summer_pearls_gift: createCarnivalPool({
    name: "盛夏遗珠狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "麦克马纳曼",
      "迪马尔科",
      "奥巴梅扬",
      "贝斯特",
      "k77",
      "奥斯梅恩",
      "多纳鲁马",
      "埃基蒂克",
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
  new_king_road_two_gift: createCarnivalPool({
    name: "新王之路贰狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "维尼修斯",
      "阿尔瓦雷斯",
      "哲凯赖什",
      "拉亚",
      "范德文",
      "恩梅查",
      "加克波",
      "巴尔德",
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
  dream_milan_carnival: createCarnivalPool({
    name: "梦入米兰城 狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "莫德里奇",
      "费里",
      "埃托奥",
      "因扎吉",
      "西多夫",
      "范巴斯滕",
      "巴雷西",
      "伊布拉希莫维奇",
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
  british_rivalry: createCarnivalPool({
    name: "英伦争霸狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "维埃拉",
      "亚亚图雷",
      "博格坎普",
      "费尔马伦",
      "罗西基",
      "萨卡",
      "多纳鲁马",
      "切尔基",
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
  double_end_reunion: createCarnivalPool({
    name: "双端齐聚狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (8 / 48) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (40 / 48) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "伊涅斯塔",
      "马特乌斯",
      "鲁梅尼格",
      "德塞利",
      "贝克汉姆",
      "卡福",
      "卡恩",
      "托雷斯",
    ],
    milestones: createMilestones({
      chance10: "10% 增能卡券",
      chance30: "30% 增能卡券",
      empoweredRandom: "随机增能卡必得券",
      empoweredSelect: "增能卡自选券",
    }),
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
      description: "高光券：10% 概率获得增能卡。该卡池实际不能用券",
    },
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  }),
  next_year_rematch: createCarnivalPool({
    name: "来年再战狂欢赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (8 / 48) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (40 / 48) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "格列兹曼",
      "路易斯迪亚斯",
      "阿劳霍",
      "布拉欣迪亚斯",
      "维尼修斯",
      "索博斯洛伊",
      "阿尔瓦雷斯",
      "穆西亚拉",
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
  golden_generation_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "黄金一代兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: ["内德维德", "皮尔洛", "切赫", "阿德里亚诺", "萨内蒂", "罗西基", "博扬"],
    exchangeConfig: {
      specificPlayers: ["内德维德", "皮尔洛", "切赫"],
      fixedSelect42: null,
      select47Players: ["内德维德", "皮尔洛", "切赫"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["内德维德", "皮尔洛", "切赫"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  wall_of_sighs_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "叹息之墙兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: ["巴雷西", "图拉姆", "舒梅切尔", "马克思", "兰帕德", "基耶利尼", "范布隆克霍斯特"],
    exchangeConfig: {
      specificPlayers: ["巴雷西", "图拉姆", "舒梅切尔", "马克思"],
      fixedSelect42: null,
      select47Players: ["巴雷西", "图拉姆", "舒梅切尔", "马克思"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["巴雷西", "图拉姆", "舒梅切尔", "马克思"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  red_black_eternal_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "红黑不熄兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: ["马尔蒂尼", "帕托", "加图索", "拜亚", "巴蒂斯图塔", "德科", "奥多"],
    exchangeConfig: {
      specificPlayers: ["马尔蒂尼", "帕托", "加图索"],
      fixedSelect42: null,
      select47Players: ["马尔蒂尼", "帕托", "加图索"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["马尔蒂尼", "帕托", "加图索"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  team_cornerstone_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "球队基石兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["鲁尼", "布冯", "普拉蒂尼", "里贝里", "哈维", "阿隆索", "加西亚"],
    exchangeConfig: {
      specificPlayers: ["布冯", "普拉蒂尼", "里贝里"],
      fixedSelect42: null,
      select47Players: ["布冯", "普拉蒂尼", "里贝里"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["布冯", "普拉蒂尼", "里贝里"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  double_red_meeting_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "双红际会兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["范德萨", "斯塔姆", "蒂亚戈", "阿隆索", "朴智星", "希尔维斯特", "迪乌夫"],
    exchangeConfig: {
      specificPlayers: ["范德萨", "斯塔姆", "蒂亚戈"],
      fixedSelect42: null,
      select47Players: ["范德萨", "斯塔姆", "蒂亚戈"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["范德萨", "斯塔姆", "蒂亚戈"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  muscle_forest_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "肌肉森林兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["古利特", "佩佩", "罗德里", "赖斯", "戴维斯", "里杰卡尔德", "科纳特"],
    exchangeConfig: {
      specificPlayers: ["古利特"],
      fixedSelect42: null,
      select47Players: ["古利特", "佩佩", "罗德里", "赖斯", "戴维斯", "里杰卡尔德", "科纳特"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["古利特"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  all_round_commander_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "全能指挥官兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["卡卡", "切赫", "内德维德", "拉姆", "巴蒂斯图塔", "菲奥雷", "伊涅斯塔"],
    exchangeConfig: {
      specificPlayers: ["卡卡", "切赫", "内德维德", "拉姆"],
      fixedSelect42: null,
      select47Players: ["卡卡", "切赫", "内德维德", "拉姆"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["卡卡", "切赫", "内德维德", "拉姆"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  green_elves_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "绿茵精灵兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["埃托奥", "罗纳尔迪尼奥", "内马尔", "埃德米尔森", "佩德里", "艾泽", "维尔茨"],
    exchangeConfig: {
      specificPlayers: ["埃托奥", "罗纳尔迪尼奥", "内马尔"],
      fixedSelect42: null,
      select47Players: ["埃托奥", "罗纳尔迪尼奥", "内马尔"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["埃托奥", "罗纳尔迪尼奥", "内马尔"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  surface_strongest_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "地表至强兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (8 / 48) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (40 / 48) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "维埃拉",
      "克鲁伊夫",
      "皮克",
      "卡努",
      "费尔马伦",
      "博格坎普",
      "萨维奥拉",
      "瓜迪奥拉",
    ],
    exchangeConfig: {
      specificPlayers: ["维埃拉", "克鲁伊夫", "皮克"],
      fixedSelect42: null,
      select47Players: ["维埃拉", "克鲁伊夫", "皮克"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["维埃拉", "克鲁伊夫", "皮克"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  northern_campaign_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "北伐争五兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    empoweredCards: [
      "索博斯洛伊",
      "B.费尔南德斯",
      "舍斯科",
      "沃尔特马德",
      "R.詹姆斯",
      "罗杰斯",
      "亨德森",
    ],
    exchangeConfig: {
      specificPlayers: ["索博斯洛伊", "B.费尔南德斯", "舍斯科"],
      fixedSelect42: null,
      select47Players: null,
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["索博斯洛伊", "B.费尔南德斯", "舍斯科"],
    exchangeNoRepeatUntilComplete: true,
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
  apennine_glory_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "亚平宁光辉兑换保底",
    poolConfig: [
      { type: "empowered", label: "史诗球员", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["巴雷西", "马特乌斯", "萨内蒂", "巴乔", "加图索", "鲁伊科斯塔", "奥多"],
    exchangeConfig: {
      specificPlayers: ["巴雷西", "萨内蒂", "巴乔"],
      fixedSelect42: null,
      select47Players: ["巴雷西", "萨内蒂", "巴乔"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["巴雷西", "萨内蒂", "巴乔"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    exchangeBonusGiftConfig: {
      everyPulls: 30,
      chance: 0.1,
      label: "10%随机史诗包",
      sourceLabel: "10%随机史诗包",
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  summit_duel_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "巅峰对决兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["赖斯", "帕乔", "萨利巴", "哈基米", "约克雷斯", "登贝莱", "加布里埃尔"],
    exchangeConfig: {
      specificPlayers: ["加布里埃尔", "登贝莱", "萨利巴"],
      fixedSelect42: null,
      select47Players: ["加布里埃尔", "登贝莱", "萨利巴"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["加布里埃尔", "登贝莱", "萨利巴"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  blue_warrior_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "蓝衣战神兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["托蒂", "内斯塔", "博努奇", "佐拉", "维埃里", "塞门约", "麦克托米奈"],
    exchangeConfig: {
      specificPlayers: ["内斯塔", "塞门约", "佐拉"],
      fixedSelect42: null,
      select47Players: ["内斯塔", "塞门约", "佐拉"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["内斯塔", "塞门约", "佐拉"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  rebuild_glory_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "重塑辉煌兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["舍什科", "库尼亚", "姆伯莫", "B.费尔南德斯", "费迪南德", "埃尔文", "罗布森"],
    exchangeConfig: {
      specificPlayers: ["B.费尔南德斯", "费迪南德", "舍什科"],
      fixedSelect42: null,
      select47Players: ["B.费尔南德斯", "费迪南德", "舍什科"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["B.费尔南德斯", "费迪南德", "舍什科"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  pitch_dragon_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "球场游龙兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["阿扎尔", "K77", "多纳多尼", "普斯卡什", "埃基蒂克", "居莱尔", "维蒂尼亚"],
    exchangeConfig: {
      specificPlayers: ["阿扎尔", "K77", "维蒂尼亚"],
      fixedSelect42: null,
      select47Players: ["阿扎尔", "K77", "维蒂尼亚"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["阿扎尔", "K77", "维蒂尼亚"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  pitch_spirit_hall_road: {
    poolType: "hall_road",
    progressionType: "hall_road",
    name: "球场精灵殿堂之路",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.01 },
      { type: "star5", label: "五星普卡", probability: 0.04 },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "内马尔","科曼","德罗西","卡福","巴乔","克鲁伊夫",
      "欧文","安布罗西尼","埃德米尔森","奥多","朴智星","菲奥雷","比利亚","劳尔",
      "范布隆克霍斯特","佩鲁齐","因扎吉","李金羽","郜林","冯潇霆",
      "贝克汉姆","瓜迪奥拉","罗西基","拜亚","阿比亚蒂","埃尔文","加西亚","科斯塔",
      "塞尔吉奥","贝尔","西尔维斯特","阿扎尔","范尼","马克斯","索乌","邓普西",
      "阿布拉杜","科尔","车范根","萨利",
    ],
    hallRoadLegend: "小罗",
    hallRoadSuperstar: ["内马尔","科曼","德罗西","卡福","巴乔","克鲁伊夫"],
    hallRoadSuper: ["欧文","安布罗西尼","埃德米尔森","奥多","朴智星","菲奥雷","比利亚","劳尔","范布隆克霍斯特","佩鲁齐","因扎吉","李金羽","郜林","冯潇霆"],
    hallRoadElite: ["贝克汉姆","瓜迪奥拉","罗西基","拜亚","阿比亚蒂","埃尔文","加西亚","科斯塔","塞尔吉奥","贝尔","西尔维斯特","阿扎尔","范尼","马克斯","索乌","邓普西","阿布拉杜","科尔","车范根","萨利"],
    highlightTicketConfig: { probability: 0.1, batchSize: 10 },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  peak_choice_discount: {
    poolType: "discount_no_guarantee",
    progressionType: "discount_limited",
    name: "巅峰之选7折",
    pricePerPull: 100,
    discountPricePerPull: 70,
    discountPullLimit: 30,
    maxPullsPerReset: 0,
    allowedDrawBatch: 10,
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["阿尔贝蒂尼", "贝尔戈米", "贝肯鲍尔", "弗兰", "哈维", "鲁梅尼格", "普拉蒂尼"],
    highlightTicketConfig: { probability: 0.1, batchSize: 10 },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  knockout_road_discount: {
    poolType: "discount_no_guarantee",
    progressionType: "discount_limited",
    name: "淘汰赛之路7折",
    pricePerPull: 100,
    discountPricePerPull: 70,
    discountPullLimit: 30,
    maxPullsPerReset: 0,
    allowedDrawBatch: 10,
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["阿尔巴", "巴蒂斯图塔", "巴尔胡安", "杰拉德", "卡布伦", "内德维德", "斯塔姆"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  needle_against_wheat_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "针尖对麦芒兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["楚阿梅尼", "厄德高", "哈兰德", "坎通纳", "马克莱莱", "萨利巴", "图拉姆"],
    exchangeConfig: {
      specificPlayers: ["坎通纳", "马克莱莱", "图拉姆"],
      fixedSelect42: null,
      select47Players: ["坎通纳", "马克莱莱", "图拉姆"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["坎通纳", "马克莱莱", "图拉姆"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  final_round_breakout_gift: {
    poolType: "accumulated_gift",
    progressionType: "milestone",
    name: "末轮突围累抽赠礼",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["蒂亚戈", "菲戈", "科尔多巴", "科勒", "里贝里", "马凯", "马克思"],
    exchangeBonusGiftConfig: {
      everyPulls: 30,
      chance: 0.1,
      label: "10%随机增能卡包",
      sourceLabel: "每30抽10%随机增能卡包",
    },
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  missing_shield_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "缺失的坚盾兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["布冯", "托纳利", "卡拉菲奥里", "卡纳瓦罗", "马尔蒂尼", "基耶利尼", "帕努奇"],
    exchangeConfig: {
      specificPlayers: ["布冯", "卡纳瓦罗", "马尔蒂尼"],
      fixedSelect42: null,
      select47Players: ["布冯", "卡纳瓦罗", "马尔蒂尼"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["布冯", "卡纳瓦罗", "马尔蒂尼"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  five_star_samba_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "五星桑巴兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["贝利", "阿德里亚诺", "济科", "里瓦尔多", "卡洛斯", "马塞洛", "麦孔"],
    exchangeConfig: {
      specificPlayers: ["贝利", "阿德里亚诺", "济科"],
      fixedSelect42: null,
      select47Players: ["贝利", "阿德里亚诺", "济科"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["贝利", "阿德里亚诺", "济科"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  lonely_hero_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "孤胆英雄兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["贝尔", "舍甫琴科", "埃托奥", "舒梅切尔", "德罗巴", "德拉甘", "奥谢"],
    exchangeConfig: {
      specificPlayers: ["贝尔", "舒梅切尔", "埃托奥"],
      fixedSelect42: null,
      select47Players: ["贝尔", "舒梅切尔", "埃托奥"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["贝尔", "舒梅切尔", "埃托奥"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  number_eight_shirt_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "8号球衣 兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (8 / 48) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (40 / 48) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "B.费尔南德斯",
      "德塞利",
      "里杰卡尔德",
      "加图索",
      "兰帕德",
      "索博斯洛伊",
      "巴尔韦德",
      "埃利奥特安德森",
    ],
    exchangeConfig: {
      specificPlayers: ["B.费尔南德斯", "德塞利", "里杰卡尔德"],
      fixedSelect42: null,
      select47Players: ["B.费尔南德斯", "德塞利", "里杰卡尔德"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["B.费尔南德斯", "德塞利", "里杰卡尔德"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  new_king_road_one_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "新王之路壹兑换保底",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "亚马尔",
      "贝林厄姆",
      "姆巴佩",
      "德容",
      "尼科帕斯",
      "伊尔迪兹",
      "内托",
      "阿利松",
    ],
    exchangeConfig: {
      specificPlayers: ["亚马尔", "贝林厄姆", "姆巴佩"],
      fixedSelect42: null,
      select47Players: ["亚马尔", "贝林厄姆", "姆巴佩"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["亚马尔", "贝林厄姆", "姆巴佩"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  young_demon_exchange: {
    poolType: "exchange_guarantee",
    progressionType: "exchange_badge",
    name: "小将魔人 兑换保底",
    poolConfig: [
      { type: "empowered", label: "BT/史诗球员", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: [
      "哈兰德",
      "布冯",
      "托蒂",
      "萨内蒂",
      "安布罗西尼",
      "维埃里",
      "巴蒂斯图塔",
    ],
    exchangeConfig: {
      specificPlayers: ["哈兰德", "布冯", "托蒂"],
      fixedSelect42: null,
      select47Players: ["哈兰德", "布冯", "托蒂"],
      hasSkin52: false,
    },
    exchangeSpecificPlayers: ["哈兰德", "布冯", "托蒂"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
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
  world_stage_chain_bundle: {
    poolType: "chain_bundle",
    progressionType: "chain_tier",
    name: "世界舞台连锁礼包",
    mainPoolName: "世界舞台第一弹",
    sidePoolName: "世界舞台第二弹",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    chainSubPools: {
      first: {
        name: "世界舞台第一弹",
        cards: [
          "梅西",
          "德尔皮耶罗",
          "德塞利",
          "卡西利亚斯",
          "贝隆",
          "佩佩",
          "C.罗纳尔多",
          "阿尔贝蒂尼",
          "迪达",
          "弗莱彻",
          "罗西基",
          "范布隆克霍斯特",
          "莫伦特斯",
          "马萨罗",
          "贝尔巴托夫",
          "托雷斯",
          "居莱尔",
          "维尔茨",
          "劳塔罗马丁内斯",
          "切尔基",
          "沃尔特马德",
          "R.詹姆斯",
          "奥尔莫",
          "邓克",
        ],
      },
      second: {
        name: "世界舞台第二弹",
        cards: [
          "梅西",
          "德塞利",
          "贝隆",
          "佩佩",
          "阿隆索",
          "C.罗纳尔多",
          "比利亚",
          "科斯塔库塔",
          "范博梅尔",
          "帕托",
          "科库",
          "马内",
          "贝莱蒂",
          "迪乌夫",
          "图拉姆",
          "格瓦迪奥尔",
          "埃斯特旺",
          "格拉利什",
          "伊沃比",
          "奥努阿楚",
        ],
      },
      third: {
        name: "世界舞台第三弹",
        cards: [
          "梅西",
          "德尔皮耶罗",
          "德塞利",
          "贝隆",
          "佩佩",
          "C.罗纳尔多",
          "罗西基",
          "范布隆克霍斯特",
          "莫伦特斯",
          "托雷斯",
          "图拉姆",
          "维尔茨",
          "格拉利什",
          "奥尔莫",
          "奥努阿楚",
        ],
      },
    },
    empoweredCards: [
      "梅西",
      "德尔皮耶罗",
      "德塞利",
      "卡西利亚斯",
      "贝隆",
      "佩佩",
      "C.罗纳尔多",
      "阿尔贝蒂尼",
      "迪达",
      "弗莱彻",
      "罗西基",
      "范布隆克霍斯特",
      "莫伦特斯",
      "马萨罗",
      "贝尔巴托夫",
      "托雷斯",
      "居莱尔",
      "维尔茨",
      "劳塔罗马丁内斯",
      "切尔基",
      "沃尔特马德",
      "R.詹姆斯",
      "奥尔莫",
      "邓克",
    ],
    sidePoolCards: [],
    chainTiers: [
      { tier: 1, costGold: 1680, rewards: ["first_10", "first_10"] },
      { tier: 2, costGold: 4400, rewards: ["first_30", "first_30"] },
      { tier: 3, costGold: 6800, rewards: ["first_random"] },
      { tier: 4, costGold: 6800, rewards: ["second_random"] },
      { tier: 5, costGold: 11800, rewards: ["first_random", "second_random"] },
      { tier: 6, costGold: 9800, rewards: ["first_random", "third_random"] },
      { tier: 7, costGold: 8800, rewards: ["second_random", "first_select"] },
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
  immortal_legends_chain_bundle: {
    poolType: "chain_bundle",
    progressionType: "chain_tier",
    name: "不朽传奇连锁礼包",
    mainPoolName: "不朽传奇卡池",
    sidePoolName: "世界经典卡池",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    chainSubPools: {
      first: {
        name: "不朽传奇卡池",
        cards: [
          "贝利",
          "克鲁伊夫",
          "普斯卡什",
          "贝肯鲍尔",
          "贝贝托",
          "盖德穆勒",
          "科曼",
          "卡西利亚斯",
          "里瓦尔多",
          "马萨罗",
        ],
      },
      second: {
        name: "世界经典卡池",
        cards: [
          "贝利",
          "普斯卡什",
          "贝贝托",
          "盖德穆勒",
          "科曼",
          "里瓦尔多",
          "马萨罗",
        ],
      },
      third: {
        name: "足球图腾卡池",
        cards: [
          "贝利",
          "克鲁伊夫",
          "普斯卡什",
          "贝肯鲍尔",
          "盖德穆勒",
          "卡西利亚斯",
          "里瓦尔多",
        ],
      },
    },
    empoweredCards: [
      "贝利",
      "克鲁伊夫",
      "普斯卡什",
      "贝肯鲍尔",
      "贝贝托",
      "盖德穆勒",
      "科曼",
      "卡西利亚斯",
      "里瓦尔多",
      "马萨罗",
    ],
    sidePoolCards: [],
    chainTiers: [
      { tier: 1, costGold: 1000, rewards: ["first_10", "first_10"] },
      { tier: 2, costGold: 4400, rewards: ["first_30", "first_30"] },
      { tier: 3, costGold: 6800, rewards: ["first_random"] },
      { tier: 4, costGold: 6800, rewards: ["second_random"] },
      { tier: 5, costGold: 11800, rewards: ["first_random", "second_random"] },
      { tier: 6, costGold: 9800, rewards: ["first_random", "third_random"] },
      { tier: 7, costGold: 8800, rewards: ["first_select", "second_random"] },
    ],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  agile_spirit_chain_bundle: {
    poolType: "chain_bundle",
    progressionType: "chain_tier",
    name: "敏捷灵动连锁礼包",
    mainPoolName: "敏捷灵动",
    sidePoolName: "闪转腾挪",
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.005 },
      { type: "selected", label: "精选卡", probability: 0.008 },
      { type: "star5", label: "五星普卡", probability: 0.024 },
      { type: "star4", label: "四星普卡", probability: 0.363 },
      { type: "star3", label: "三星普卡", probability: 0.6 },
    ],
    chainSubPools: {
      first: {
        name: "敏捷灵动",
        cards: [
          "卡纳瓦罗",
          "苏亚雷斯",
          "普斯卡什",
          "特维斯",
          "多纳多尼",
          "久利",
          "王钰栋",
          "博扬",
          "姆巴佩",
          "内托",
        ],
      },
      second: {
        name: "闪转腾挪",
        cards: ["普斯卡什", "特维斯", "多纳多尼", "久利", "王钰栋", "博扬", "姆巴佩"],
      },
      third: {
        name: "凌波微步",
        cards: ["卡纳瓦罗", "苏亚雷斯", "普斯卡什", "特维斯", "多纳多尼", "博扬", "内托"],
      },
    },
    empoweredCards: [
      "卡纳瓦罗",
      "苏亚雷斯",
      "普斯卡什",
      "特维斯",
      "多纳多尼",
      "久利",
      "王钰栋",
      "博扬",
      "姆巴佩",
      "内托",
    ],
    sidePoolCards: [],
    chainTiers: [
      { tier: 1, costGold: 1680, rewards: ["first_10", "first_10"] },
      { tier: 2, costGold: 4400, rewards: ["first_30", "first_30"] },
      { tier: 3, costGold: 6800, rewards: ["first_random"] },
      { tier: 4, costGold: 6800, rewards: ["second_random"] },
      { tier: 5, costGold: 11800, rewards: ["first_random", "second_random"] },
      { tier: 6, costGold: 9800, rewards: ["first_random", "third_random"] },
      { tier: 7, costGold: 8800, rewards: ["third_random", "first_select"] },
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
  firepower_full_gift: {
    poolType: "accumulated_gift",
    progressionType: "milestone",
    name: "火力全开累抽赠礼",
    progressCap: 420,
    poolConfig: [
      { type: "empowered", label: "史诗球员", probability: 0.005 },
      { type: "star5", label: "5星普通球员", probability: 0.024 },
      { type: "star4", label: "4星普通球员", probability: 0.371 },
      { type: "star3", label: "3星普通球员", probability: 0.6 },
    ],
    empoweredCards: [
      "亚马尔",
      "奥斯梅恩",
      "德尔皮耶罗",
      "托蒂",
      "阿德里亚诺",
      "莫伦特斯",
      "菲奥雷",
    ],
    milestones: createAccumulatedGiftMilestones({
      genericLabel: "5星签约 10%含火力全开史诗",
      genericTargets: [
        "亚马尔",
        "奥斯梅恩",
        "德尔皮耶罗",
        "托蒂",
        "阿德里亚诺",
        "莫伦特斯",
        "菲奥雷",
      ],
      firstTarget: "阿德里亚诺",
      firstLabel: "5星签约 10%含阿德里亚诺",
      secondTarget: "德尔皮耶罗",
      secondLabel: "5星签约 10%含德尔皮耶罗",
    }),
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
  midfield_master_halfprice: {
    poolType: "discount_no_guarantee",
    progressionType: "discount_limited",
    name: "中路致胜5折",
    pricePerPull: 50,
    maxPullsPerReset: 30,
    allowedDrawBatch: 10,
    poolConfig: [
      { type: "empowered", label: "史诗球员", probability: 0.005 },
      { type: "star5", label: "5星普通球员", probability: 0.024 },
      { type: "star4", label: "4星普通球员", probability: 0.371 },
      { type: "star3", label: "3星普通球员", probability: 0.6 },
    ],
    empoweredCards: ["卡纳瓦罗", "普拉蒂尼", "马特乌斯", "贝贝托", "戴维斯", "斯内德", "古蒂"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  era_heroes_discount: {
    poolType: "discount_no_guarantee",
    progressionType: "discount_limited",
    name: "时代英杰7折",
    pricePerPull: 100,
    discountPricePerPull: 70,
    discountPullLimit: 30,
    maxPullsPerReset: 0,
    allowedDrawBatch: 10,
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["盖德穆勒", "斯内德", "弗兰", "贝尔戈米", "古蒂", "费里", "德尼尔森"],
    highlightTicketConfig: {
      probability: 0.1,
      batchSize: 10,
    },
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  first_round_focus_discount: {
    poolType: "discount_no_guarantee",
    progressionType: "discount_limited",
    name: "首轮焦点",
    pricePerPull: 100,
    maxPullsPerReset: 0,
    allowedDrawBatch: 10,
    nonRepeatEmpowered: true,
    bonusFreePullConfig: {
      paidPulls: 20,
      freePulls: 10,
    },
    poolConfig: [
      { type: "empowered", label: "增能卡", probability: 0.05 * (7 / 42) },
      { type: "star5", label: "五星普卡", probability: 0.05 * (35 / 42) },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    empoweredCards: ["赖斯", "范戴克", "阿扎尔", "西多夫", "萨拉赫", "莫德里奇", "埃利奥特安德森"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  infinite_passion_nonrepeat: {
    poolType: "accumulated_nonrepeat_gift",
    progressionType: "accumulated_nonrepeat",
    name: "无限热烈",
    pricePerPull: 80,
    targetPlayers: ["伊涅斯塔", "阿圭罗", "罗梅罗", "内马尔"],
    completionReward: "梅西",
    fallbackPlayer: "巴蒂斯图塔",
    poolConfig: [
      { type: "empowered", label: "指定目标球员", probability: 0.05 / 151 },
      { type: "star5", label: "五星普卡", probability: 0.05 * 150 / 151 },
      { type: "star4", label: "四星普卡", probability: 0.3 },
      { type: "star3", label: "三星普卡", probability: 0.65 },
    ],
    risingProbabilityConfig: {
      guaranteePulls: 191,
      boosts: [
        { pulls: 0, multiplier: 1 },
        { pulls: 30, multiplier: 2 },
        { pulls: 60, multiplier: 3 },
        { pulls: 90, multiplier: 5 },
        { pulls: 120, multiplier: 8 },
        { pulls: 150, multiplier: 10 },
        { pulls: 160, multiplier: 12 },
        { pulls: 170, multiplier: 15 },
        { pulls: 180, multiplier: 50 },
      ],
    },
    specialOfferConfig: {
      discountedPulls: [
        { start: 1, end: 100, pricePerPull: 80 },
        { start: 101, end: 500, pricePerPull: 90 },
      ],
      rewards: [
        { pulls: 100, type: "infinite_messi_chance", chance: 0.05, label: "5%梅西经纪人包" },
        { pulls: 300, type: "infinite_guaranteed_pack", chance: 0.05, label: "96+高光经纪人包" },
        { pulls: 500, type: "infinite_guaranteed_pack", chance: 0.05, label: "96+高光经纪人包" },
      ],
    },
    empoweredCards: ["梅西", "伊涅斯塔", "阿圭罗", "罗梅罗", "内马尔", "巴蒂斯图塔"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
  defense_spring_shop: {
    poolType: "shop_package",
    progressionType: "shop_package",
    name: "防守教学春日礼包",
    packagePriceGold: 688,
    scholarDropProbability: 0.1,
    scholarEveryPacks: 10,
    scholarMilestoneLimit: 10,
    firstSelectPacks: 80,
    allSelectPacks: 120,
    poolConfig: [
      { type: "spring_empowered", label: "春日礼包增能卡", probability: 0.04 },
      { type: "star5", label: "五星普卡", probability: 0.96 },
      { type: "spring_scholar_pack", label: "额外获得学霸礼包", probability: 0.1 },
    ],
    scholarPackConfig: [
      { type: "empowered_fixed", label: "瓦拉内", probability: 0.002, fixedName: "瓦拉内" },
      { type: "spring_random", label: "春日礼包随机球员", probability: 0.15 },
      { type: "gold", label: "返还 2026 金币", probability: 0.006, amount: 2026 },
      { type: "gold", label: "返还 888 金币", probability: 0.036, amount: 888 },
      { type: "gold", label: "返还 666 金币", probability: 0.066, amount: 666 },
      { type: "gold", label: "返还 388 金币", probability: 0.2, amount: 388 },
      { type: "gold", label: "返还 188 金币", probability: 0.3, amount: 188 },
      { type: "token", label: "高级技巧代币", probability: 0.12 },
      { type: "token", label: "随机增能代币", probability: 0.12 },
    ],
    empoweredCards: SPRING_SHOP_ALL_SELECT_PLAYERS,
    springPackagePlayers: SPRING_SHOP_PLAYERS,
    mainCoursePlayers: ["瓦拉内"],
    milestones: [],
    bonusHitMode: "empowered_only",
    selectedCardCountForBonus: 0,
  },
};

const POOL_KEYS = Object.keys(POOLS);
let activePoolKey =
  (POOLS.young_demon_exchange && "young_demon_exchange") ||
  (POOLS.infinite_passion_nonrepeat && "infinite_passion_nonrepeat") ||
  (POOLS.dream_milan_carnival && "dream_milan_carnival") ||
  (POOLS.number_eight_shirt_exchange && "number_eight_shirt_exchange") ||
  (POOLS.rooster_lions_star_pack && "rooster_lions_star_pack") ||
  (POOLS.german_chariot_glory_box && "german_chariot_glory_box") ||
  (POOLS.peak_choice_discount && "peak_choice_discount") ||
  (POOLS.new_king_road_two_gift && "new_king_road_two_gift") ||
  (POOLS.pitch_spirit_hall_road && "pitch_spirit_hall_road") ||
  (POOLS.pitch_dragon_exchange && "pitch_dragon_exchange") ||
  (POOLS.knockout_road_discount && "knockout_road_discount") ||
  (POOLS.needle_against_wheat_exchange && "needle_against_wheat_exchange") ||
  (POOLS.final_round_breakout_gift && "final_round_breakout_gift") ||
  (POOLS.missing_shield_exchange && "missing_shield_exchange") ||
  (POOLS.five_star_samba_exchange && "five_star_samba_exchange") ||
  (POOLS.lonely_hero_exchange && "lonely_hero_exchange") ||
  (POOLS.first_round_focus_discount && "first_round_focus_discount") ||
  (POOLS.world_stage_chain_bundle && "world_stage_chain_bundle") ||
  (POOLS.new_king_road_one_exchange && "new_king_road_one_exchange") ||
  (POOLS.summer_pearls_gift && "summer_pearls_gift") ||
  (POOLS.rebuild_glory_exchange && "rebuild_glory_exchange") ||
  (POOLS.blue_warrior_exchange && "blue_warrior_exchange") ||
  (POOLS.summit_duel_exchange && "summit_duel_exchange") ||
  (POOLS.apennine_glory_exchange && "apennine_glory_exchange") ||
  (POOLS.surface_strongest_exchange && "surface_strongest_exchange") ||
  (POOLS.next_year_rematch && "next_year_rematch") ||
  (POOLS.era_heroes_discount && "era_heroes_discount") ||
  (POOLS.agile_spirit_chain_bundle && "agile_spirit_chain_bundle") ||
  (POOLS.all_round_commander_exchange && "all_round_commander_exchange") ||
  (POOLS.muscle_forest_exchange && "muscle_forest_exchange") ||
  (POOLS.double_red_meeting_exchange && "double_red_meeting_exchange") ||
  (POOLS.double_end_reunion && "double_end_reunion") ||
  (POOLS.team_cornerstone_exchange && "team_cornerstone_exchange") ||
  (POOLS.defense_spring_shop && "defense_spring_shop") ||
  (POOLS.immortal_legends_chain_bundle && "immortal_legends_chain_bundle") ||
  (POOLS.northern_campaign_exchange && "northern_campaign_exchange") ||
  (POOLS.wall_of_sighs_exchange && "wall_of_sighs_exchange") ||
  (POOLS.golden_generation_exchange && "golden_generation_exchange") ||
  (POOLS.midfield_master_halfprice && "midfield_master_halfprice") ||
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
  discount_no_guarantee: "折扣无保底",
  shop_package: "商城礼包",
  exchange_guarantee: "兑换保底",
  chain_bundle: "连锁礼包",
  season_carryover: "赛季累抽继承",
  accumulated_guarantee: "累抽必得",
  accumulated_nonrepeat_gift: "累抽不重复赠礼",
  hall_road: "殿堂之路",
  glory_box: "荣耀礼盒",
  star_pack: "球星卡包",
};

const POOL_CINEMATIC_ASSET_FOLDERS = {
  infinite_passion_nonrepeat: ["assets/无限热烈"],
  rooster_lions_star_pack: ["assets/雄鸡与三狮"],
  xinzai_jinxiu: ["assets/新载锦绣"],
  german_chariot_glory_box: ["assets/德国战车"],
  summer_pearls_gift: ["assets/盛夏遗珠"],
  new_king_road_two_gift: ["assets/新王之路贰"],
  dream_milan_carnival: ["assets/梦入米兰城"],
  blue_old_friend: ["assets/蓝衣故人"],
  british_rivalry: ["assets/英伦争霸"],
  double_end_reunion: ["assets/双端齐聚"],
  next_year_rematch: ["assets/来年再战"],
  ouzhan_fengyan: ["assets/欧战烽烟"],
  dream_midfield_exchange: ["assets/梦幻中轴"],
  lucky_drop_exchange: ["assets/天降幸运"],
  rock_blade_exchange: ["assets/磐石利刃"],
  golden_generation_exchange: ["assets/黄金一代"],
  wall_of_sighs_exchange: ["assets/叹息之墙"],
  red_black_eternal_exchange: ["assets/红黑不熄"],
  team_cornerstone_exchange: ["assets/球队基石"],
  pitch_spirit_hall_road: ["assets/球场精灵"],
  double_red_meeting_exchange: ["assets/双红际会"],
  muscle_forest_exchange: ["assets/肌肉森林"],
  all_round_commander_exchange: ["assets/全能指挥官"],
  green_elves_exchange: ["assets/绿茵精灵"],
  surface_strongest_exchange: ["assets/地表至强"],
  northern_campaign_exchange: ["assets/北伐争五"],
  pitch_maestro_exchange: ["assets/球场主宰"],
  apennine_glory_exchange: ["assets/亚平宁光辉"],
  summit_duel_exchange: ["assets/巅峰对决"],
  blue_warrior_exchange: ["assets/蓝衣战神"],
  rebuild_glory_exchange: ["assets/重塑辉煌"],
  pitch_dragon_exchange: ["assets/球场游龙"],
  knockout_road_discount: ["assets/淘汰赛之路"],
  needle_against_wheat_exchange: ["assets/针尖对麦芒"],
  final_round_breakout_gift: ["assets/末轮突围"],
  missing_shield_exchange: ["assets/缺失的坚盾"],
  five_star_samba_exchange: ["assets/五星桑巴"],
  lonely_hero_exchange: ["assets/孤胆英雄"],
  number_eight_shirt_exchange: ["assets/8号球衣"],
  new_king_road_one_exchange: ["assets/新王之路壹"],
  young_demon_exchange: ["assets/小将魔人"],
  genius_chain_bundle: ["assets/天纵奇才", "assets/天纵奇才-无畏斗士"],
  world_stage_chain_bundle: ["assets/世界舞台第一弹", "assets/世界舞台第二弹", "assets/世界舞台第三弹"],
  spring_reunion_chain_bundle: ["assets/新春团圆"],
  immortal_legends_chain_bundle: ["assets/不朽传奇"],
  agile_spirit_chain_bundle: ["assets/敏捷灵动"],
  defense_guardians_gift: ["assets/防守悍将"],
  firepower_full_gift: ["assets/火力全开"],
  s9_season_inherit: ["assets/S9赛季累抽继承"],
  oriental_dragon_liyi: ["assets/东方巨龙"],
  oriental_dragon_fengxiaoting: ["assets/东方巨龙"],
  midfield_master_halfprice: ["assets/中路致胜5折"],
  era_heroes_discount: ["assets/时代英杰"],
  peak_choice_discount: ["assets/巅峰之选"],
  first_round_focus_discount: ["assets/首轮焦点"],
  defense_spring_shop: ["assets/防守教学春日礼包"],
};

const POOL_PLAYER_META = {
  rooster_lions_star_pack: {
    登贝莱: { type: "ST", position: "右边锋", packCategory: "梦幻精选" },
    姆巴佩: { type: "ST", position: "中锋", packCategory: "梦幻精选" },
    凯恩: { type: "ST", position: "中锋", packCategory: "梦幻精选" },
    孔德: { type: "ST", position: "右后卫", packCategory: "梦幻精选" },
    格列兹曼: { type: "ST", position: "中锋", packCategory: "梦幻精选" },
    坎特: { type: "ST", position: "后腰", packCategory: "梦幻精选" },
    里贝里: { type: "史诗", position: "左边锋", packCategory: "史诗高光" },
    鲁尼: { type: "史诗", position: "影锋", packCategory: "史诗高光" },
    贝克汉姆: { type: "史诗", position: "右前卫", packCategory: "史诗高光" },
    马克莱莱: { type: "史诗", position: "后腰", packCategory: "史诗高光" },
    佩蒂特: { type: "史诗", position: "中前卫", packCategory: "史诗高光" },
    欧文: { type: "史诗", position: "中锋", packCategory: "史诗高光" },
    维埃拉: { type: "史诗", position: "后腰", packCategory: "史诗高光" },
  },
  german_chariot_glory_box: {
    拉姆: { type: "BT", position: "右后卫" },
    克洛泽: { type: "史诗", position: "中锋" },
    盖德穆勒: { type: "史诗", position: "中锋" },
    格策: { type: "史诗", position: "中锋" },
    穆夏拉: { type: "ST", position: "左前卫" },
    施洛特贝克: { type: "ST", position: "中后卫" },
    托马斯穆勒: { type: "ST", position: "前腰" },
    巴蒂斯图塔: { type: "史诗", position: "中锋" },
  },
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
  summer_pearls_gift: {
    麦克马纳曼: { type: "史诗", position: "右前卫" },
    迪马尔科: { type: "BT", position: "左前卫" },
    奥巴梅扬: { type: "史诗", position: "中锋" },
    贝斯特: { type: "BT", position: "右边锋" },
    k77: { type: "BT", position: "左边锋" },
    奥斯梅恩: { type: "BT", position: "中锋" },
    多纳鲁马: { type: "ST", position: "门将" },
    埃基蒂克: { type: "ST", position: "中锋" },
  },
  new_king_road_two_gift: {
    维尼修斯: { type: "ST", position: "左边锋" },
    阿尔瓦雷斯: { type: "ST", position: "中锋" },
    哲凯赖什: { type: "ST", position: "中锋" },
    拉亚: { type: "ST", position: "门将" },
    范德文: { type: "ST", position: "中后卫" },
    恩梅查: { type: "ST", position: "后腰" },
    加克波: { type: "ST", position: "左边锋" },
    巴尔德: { type: "ST", position: "左后卫" },
  },
  dream_milan_carnival: {
    莫德里奇: { type: "ST", position: "中前卫" },
    费里: { type: "史诗", position: "中后卫" },
    埃托奥: { type: "史诗", position: "右前卫" },
    因扎吉: { type: "史诗", position: "中锋" },
    西多夫: { type: "史诗", position: "后腰" },
    范巴斯滕: { type: "史诗", position: "中锋" },
    巴雷西: { type: "史诗", position: "中后卫" },
    伊布拉希莫维奇: { type: "BT", position: "中锋" },
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
  british_rivalry: {
    维埃拉: { type: "史诗", position: "后腰" },
    亚亚图雷: { type: "史诗", position: "后腰" },
    博格坎普: { type: "史诗", position: "中锋" },
    费尔马伦: { type: "史诗", position: "中后卫" },
    罗西基: { type: "史诗", position: "前腰" },
    萨卡: { type: "ST", position: "右边锋" },
    多纳鲁马: { type: "ST", position: "门将" },
    切尔基: { type: "ST", position: "前腰" },
  },
  double_end_reunion: {
    伊涅斯塔: { type: "史诗", position: "中前卫" },
    马特乌斯: { type: "史诗", position: "中前卫" },
    鲁梅尼格: { type: "史诗", position: "中锋" },
    德塞利: { type: "史诗", position: "中后卫" },
    贝克汉姆: { type: "史诗", position: "右前卫" },
    卡福: { type: "史诗", position: "右后卫" },
    卡恩: { type: "史诗", position: "门将" },
    托雷斯: { type: "史诗", position: "中锋" },
  },
  next_year_rematch: {
    格列兹曼: { type: "ST", position: "中锋" },
    路易斯迪亚斯: { type: "ST", position: "左边锋" },
    阿劳霍: { type: "ST", position: "中后卫" },
    布拉欣迪亚斯: { type: "ST", position: "前腰" },
    维尼修斯: { type: "ST", position: "左边锋" },
    索博斯洛伊: { type: "ST", position: "前腰" },
    阿尔瓦雷斯: { type: "ST", position: "中锋" },
    穆西亚拉: { type: "ST", position: "左前卫" },
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
  golden_generation_exchange: {
    内德维德: { type: "史诗", position: "前腰" },
    皮尔洛: { type: "史诗", position: "后腰" },
    切赫: { type: "史诗", position: "门将" },
    阿德里亚诺: { type: "史诗", position: "中锋" },
    萨内蒂: { type: "史诗", position: "左后卫" },
    罗西基: { type: "史诗", position: "前腰" },
    博扬: { type: "史诗", position: "右边锋" },
  },
  wall_of_sighs_exchange: {
    巴雷西: { type: "史诗", position: "中后卫" },
    图拉姆: { type: "史诗", position: "右后卫" },
    舒梅切尔: { type: "史诗", position: "门将" },
    马克思: { type: "史诗", position: "中后卫" },
    兰帕德: { type: "史诗", position: "中前卫" },
    基耶利尼: { type: "史诗", position: "中后卫" },
    范布隆克霍斯特: { type: "史诗", position: "左后卫" },
  },
  red_black_eternal_exchange: {
    马尔蒂尼: { type: "史诗", position: "左后卫" },
    帕托: { type: "史诗", position: "中锋" },
    加图索: { type: "史诗", position: "后腰" },
    拜亚: { type: "史诗", position: "门将" },
    巴蒂斯图塔: { type: "史诗", position: "中锋" },
    德科: { type: "史诗", position: "中前卫" },
    奥多: { type: "史诗", position: "右后卫" },
  },
  team_cornerstone_exchange: {
    鲁尼: { type: "史诗", position: "影锋" },
    布冯: { type: "史诗", position: "门将" },
    普拉蒂尼: { type: "史诗", position: "前腰" },
    里贝里: { type: "史诗", position: "左前卫" },
    哈维: { type: "史诗", position: "后腰" },
    阿隆索: { type: "史诗", position: "中前卫" },
    加西亚: { type: "史诗", position: "右边锋" },
  },
  double_red_meeting_exchange: {
    范德萨: { type: "史诗", position: "门将" },
    斯塔姆: { type: "史诗", position: "中后卫" },
    蒂亚戈: { type: "史诗", position: "中前卫" },
    阿隆索: { type: "史诗", position: "后腰" },
    朴智星: { type: "史诗", position: "左前卫" },
    希尔维斯特: { type: "史诗", position: "左后卫" },
    迪乌夫: { type: "史诗", position: "中锋" },
  },
  muscle_forest_exchange: {
    古利特: { type: "史诗", position: "前腰" },
    佩佩: { type: "史诗", position: "中后卫" },
    罗德里: { type: "ST", position: "后腰" },
    赖斯: { type: "ST", position: "中前卫" },
    戴维斯: { type: "史诗", position: "后腰" },
    里杰卡尔德: { type: "史诗", position: "后腰" },
    科纳特: { type: "ST", position: "中后卫" },
  },
  all_round_commander_exchange: {
    卡卡: { type: "史诗", position: "前腰" },
    切赫: { type: "史诗", position: "门将" },
    内德维德: { type: "史诗", position: "左前卫" },
    拉姆: { type: "史诗", position: "右后卫" },
    巴蒂斯图塔: { type: "史诗", position: "中锋" },
    菲奥雷: { type: "史诗", position: "右前卫" },
    伊涅斯塔: { type: "史诗", position: "左边锋" },
  },
  agile_spirit_chain_bundle: {
    卡纳瓦罗: { type: "史诗", position: "中后卫" },
    苏亚雷斯: { type: "史诗", position: "中锋" },
    普斯卡什: { type: "史诗", position: "中锋" },
    特维斯: { type: "史诗", position: "中锋" },
    多纳多尼: { type: "史诗", position: "左前卫" },
    久利: { type: "史诗", position: "右边锋" },
    王钰栋: { type: "BT", position: "左边锋" },
    博扬: { type: "史诗", position: "右边锋" },
    姆巴佩: { type: "ST", position: "中锋" },
    内托: { type: "ST", position: "左前卫" },
  },
  era_heroes_discount: {
    盖德穆勒: { type: "史诗", position: "中锋" },
    斯内德: { type: "史诗", position: "前腰" },
    弗兰: { type: "史诗", position: "中锋" },
    贝尔戈米: { type: "史诗", position: "右后卫" },
    古蒂: { type: "史诗", position: "中前卫" },
    费里: { type: "史诗", position: "中后卫" },
    德尼尔森: { type: "史诗", position: "左边锋" },
  },
  green_elves_exchange: {
    埃托奥: { type: "史诗", position: "中锋" },
    罗纳尔迪尼奥: { type: "史诗", position: "左边锋" },
    内马尔: { type: "史诗", position: "左前卫" },
    埃德米尔森: { type: "史诗", position: "后腰" },
    佩德里: { type: "BT", position: "中前卫" },
    艾泽: { type: "ST", position: "前腰" },
    维尔茨: { type: "ST", position: "前腰" },
  },
  surface_strongest_exchange: {
    维埃拉: { type: "史诗", position: "后腰" },
    克鲁伊夫: { type: "史诗", position: "中锋" },
    皮克: { type: "史诗", position: "中后卫" },
    卡努: { type: "史诗", position: "中锋" },
    费尔马伦: { type: "史诗", position: "中后卫" },
    博格坎普: { type: "史诗", position: "中锋" },
    萨维奥拉: { type: "史诗", position: "中锋" },
    瓜迪奥拉: { type: "史诗", position: "后腰" },
  },
  northern_campaign_exchange: {
    索博斯洛伊: { type: "ST", position: "前腰" },
    "B.费尔南德斯": { type: "ST", position: "前腰" },
    舍斯科: { type: "ST", position: "中锋" },
    沃尔特马德: { type: "ST", position: "中锋" },
    "R.詹姆斯": { type: "ST", position: "右后卫" },
    罗杰斯: { type: "ST", position: "前腰" },
    亨德森: { type: "ST", position: "后腰" },
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
  apennine_glory_exchange: {
    巴雷西: { type: "史诗", position: "中后卫" },
    马特乌斯: { type: "史诗", position: "前腰" },
    萨内蒂: { type: "史诗", position: "左后卫" },
    巴乔: { type: "史诗", position: "前腰" },
    加图索: { type: "史诗", position: "后腰" },
    鲁伊科斯塔: { type: "史诗", position: "中前卫" },
    奥多: { type: "史诗", position: "右后卫" },
  },
  summit_duel_exchange: {
    赖斯: { type: "ST", position: "后腰" },
    帕乔: { type: "ST", position: "中后卫" },
    萨利巴: { type: "ST", position: "中后卫" },
    哈基米: { type: "ST", position: "右后卫" },
    约克雷斯: { type: "ST", position: "中锋" },
    登贝莱: { type: "ST", position: "中锋" },
    加布里埃尔: { type: "BT", position: "中后卫" },
  },
  blue_warrior_exchange: {
    托蒂: { type: "史诗", position: "前腰" },
    内斯塔: { type: "史诗", position: "中后卫" },
    博努奇: { type: "史诗", position: "中后卫" },
    佐拉: { type: "史诗", position: "影锋" },
    维埃里: { type: "史诗", position: "中锋" },
    塞门约: { type: "BT", position: "左前卫" },
    麦克托米奈: { type: "BT", position: "中前卫" },
  },
  rebuild_glory_exchange: {
    舍什科: { type: "ST", position: "中锋" },
    库尼亚: { type: "ST", position: "前腰" },
    姆伯莫: { type: "ST", position: "右边锋" },
    "B.费尔南德斯": { type: "BT", position: "前腰" },
    费迪南德: { type: "史诗", position: "中后卫" },
    埃尔文: { type: "史诗", position: "左后卫" },
    罗布森: { type: "史诗", position: "中前卫" },
 },
 peak_choice_discount: {
   阿尔贝蒂尼: { type: "史诗", position: "后腰" },
   贝尔戈米: { type: "史诗", position: "右后卫" },
   贝肯鲍尔: { type: "史诗", position: "中后卫" },
   弗兰: { type: "史诗", position: "中锋" },
   哈维: { type: "史诗", position: "中前卫" },
   鲁梅尼格: { type: "史诗", position: "中锋" },
   普拉蒂尼: { type: "史诗", position: "前腰" },
 },
 knockout_road_discount: {
   阿尔巴: { type: "史诗", position: "左后卫" },
   巴蒂斯图塔: { type: "史诗", position: "中锋" },
   巴尔胡安: { type: "史诗", position: "左后卫" },
   杰拉德: { type: "史诗", position: "中前卫" },
   卡布伦: { type: "史诗", position: "右前卫" },
   内德维德: { type: "史诗", position: "前腰" },
   斯塔姆: { type: "史诗", position: "中后卫" },
 },
 pitch_spirit_hall_road: {
   小罗: { type: "史诗", position: "前腰" },
   内马尔: { type: "史诗", position: "左前卫" },
   科曼: { type: "史诗", position: "中后卫" },
   德罗西: { type: "史诗", position: "后腰" },
   卡福: { type: "史诗", position: "右后卫" },
   巴乔: { type: "史诗", position: "影锋" },
   克鲁伊夫: { type: "史诗", position: "前腰" },
   欧文: { type: "史诗", position: "中锋" },
   安布罗西尼: { type: "史诗", position: "后腰" },
   埃德米尔森: { type: "史诗", position: "后腰" },
   奥多: { type: "史诗", position: "右后卫" },
   朴智星: { type: "史诗", position: "左前卫" },
   菲奥雷: { type: "史诗", position: "右前卫" },
   比利亚: { type: "史诗", position: "中锋" },
   劳尔: { type: "史诗", position: "影锋" },
   范布隆克霍斯特: { type: "史诗", position: "左后卫" },
   佩鲁齐: { type: "史诗", position: "门将" },
   因扎吉: { type: "史诗", position: "中锋" },
   李金羽: { type: "BT", position: "中锋" },
   郜林: { type: "BT", position: "中锋" },
   冯潇霆: { type: "BT", position: "中后卫" },
   贝克汉姆: { type: "史诗", position: "中前卫" },
   瓜迪奥拉: { type: "史诗", position: "后腰" },
   罗西基: { type: "史诗", position: "前腰" },
   拜亚: { type: "史诗", position: "门将" },
   阿比亚蒂: { type: "史诗", position: "门将" },
   埃尔文: { type: "史诗", position: "左后卫" },
   加西亚: { type: "史诗", position: "右边锋" },
   科斯塔: { type: "史诗", position: "前腰" },
   塞尔吉奥: { type: "史诗", position: "左前卫" },
   贝尔: { type: "史诗", position: "中锋" },
   西尔维斯特: { type: "史诗", position: "左后卫" },
   阿扎尔: { type: "史诗", position: "左边锋" },
   范尼: { type: "史诗", position: "中锋" },
   马克斯: { type: "史诗", position: "中后卫" },
   索乌: { type: "史诗", position: "中锋" },
   邓普西: { type: "史诗", position: "中锋" },
   阿布拉杜: { type: "史诗", position: "中锋" },
   科尔: { type: "史诗", position: "中锋" },
   车范根: { type: "史诗", position: "中锋" },
   萨利: { type: "史诗", position: "中锋" },
 },
 pitch_dragon_exchange: {
   阿扎尔: { type: "BT", position: "前腰" },
   K77: { type: "BT", position: "左边锋" },
   多纳多尼: { type: "史诗", position: "中前卫" },
   普斯卡什: { type: "史诗", position: "中锋" },
   埃基蒂克: { type: "ST", position: "中锋" },
   居莱尔: { type: "ST", position: "前腰" },
   维蒂尼亚: { type: "ST", position: "后腰" },
 },
 needle_against_wheat_exchange: {
   楚阿梅尼: { type: "ST", position: "后腰" },
   厄德高: { type: "ST", position: "中前卫" },
   哈兰德: { type: "ST", position: "中锋" },
   坎通纳: { type: "史诗", position: "中锋" },
   马克莱莱: { type: "史诗", position: "后腰" },
   萨利巴: { type: "ST", position: "中后卫" },
   图拉姆: { type: "史诗", position: "右后卫" },
 },
 final_round_breakout_gift: {
   蒂亚戈: { type: "史诗", position: "中前卫" },
   菲戈: { type: "史诗", position: "右边锋" },
   科尔多巴: { type: "史诗", position: "中后卫" },
   科勒: { type: "史诗", position: "中锋" },
   里贝里: { type: "史诗", position: "左前卫" },
   马凯: { type: "史诗", position: "中锋" },
   马克思: { type: "史诗", position: "中后卫" },
 },
 missing_shield_exchange: {
   布冯: { type: "BT", position: "门将" },
   托纳利: { type: "ST", position: "中前卫" },
   卡拉菲奥里: { type: "ST", position: "左后卫" },
   卡纳瓦罗: { type: "史诗", position: "中后卫" },
   马尔蒂尼: { type: "史诗", position: "左后卫" },
   基耶利尼: { type: "史诗", position: "中后卫" },
   帕努奇: { type: "史诗", position: "右后卫" },
 },
 five_star_samba_exchange: {
   贝利: { type: "史诗", position: "中锋" },
   阿德里亚诺: { type: "史诗", position: "中锋" },
   济科: { type: "史诗", position: "前腰" },
   里瓦尔多: { type: "史诗", position: "前腰" },
   卡洛斯: { type: "史诗", position: "左后卫" },
   马塞洛: { type: "史诗", position: "左后卫" },
   麦孔: { type: "史诗", position: "右后卫" },
 },
 lonely_hero_exchange: {
   贝尔: { type: "史诗", position: "右边锋" },
   舍甫琴科: { type: "史诗", position: "中锋" },
   埃托奥: { type: "史诗", position: "中锋" },
   舒梅切尔: { type: "史诗", position: "门将" },
   德罗巴: { type: "史诗", position: "中锋" },
   德拉甘: { type: "史诗", position: "前腰" },
   奥谢: { type: "史诗", position: "后腰" },
 },
 new_king_road_one_exchange: {
    亚马尔: { type: "BT", position: "右边锋" },
    贝林厄姆: { type: "ST", position: "中前卫" },
    姆巴佩: { type: "ST", position: "中锋" },
    德容: { type: "ST", position: "后腰" },
    尼科帕斯: { type: "ST", position: "前腰" },
    伊尔迪兹: { type: "ST", position: "左前卫" },
    内托: { type: "ST", position: "左前卫" },
    阿利松: { type: "ST", position: "门将" },
  },
  young_demon_exchange: {
    哈兰德: { type: "BT", position: "中锋" },
    布冯: { type: "BT", position: "门将" },
    托蒂: { type: "史诗", position: "前腰" },
    萨内蒂: { type: "史诗", position: "左后卫" },
    安布罗西尼: { type: "史诗", position: "后腰" },
    维埃里: { type: "史诗", position: "中锋" },
    巴蒂斯图塔: { type: "史诗", position: "中锋" },
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
  world_stage_chain_bundle: {
    梅西: { type: "BT", position: "右边锋" },
    德尔皮耶罗: { type: "史诗", position: "中锋" },
    德塞利: { type: "史诗", position: "中后卫" },
    卡西利亚斯: { type: "史诗", position: "门将" },
    贝隆: { type: "史诗", position: "前腰" },
    佩佩: { type: "史诗", position: "中后卫" },
    "C.罗纳尔多": { type: "BT", position: "中锋" },
    阿尔贝蒂尼: { type: "史诗", position: "后腰" },
    迪达: { type: "史诗", position: "门将" },
    弗莱彻: { type: "史诗", position: "后腰" },
    罗西基: { type: "史诗", position: "前腰" },
    范布隆克霍斯特: { type: "史诗", position: "左后卫" },
    莫伦特斯: { type: "史诗", position: "中锋" },
    马萨罗: { type: "史诗", position: "中锋" },
    贝尔巴托夫: { type: "史诗", position: "中锋" },
    托雷斯: { type: "史诗", position: "中锋" },
    居莱尔: { type: "ST", position: "前腰" },
    维尔茨: { type: "ST", position: "前腰" },
    劳塔罗马丁内斯: { type: "ST", position: "中锋" },
    切尔基: { type: "ST", position: "前腰" },
    沃尔特马德: { type: "ST", position: "中锋" },
    "R.詹姆斯": { type: "ST", position: "右后卫" },
    奥尔莫: { type: "ST", position: "前腰" },
    邓克: { type: "ST", position: "中后卫" },
    阿隆索: { type: "史诗", position: "后腰" },
    比利亚: { type: "史诗", position: "左边锋" },
    科斯塔库塔: { type: "史诗", position: "右后卫" },
    范博梅尔: { type: "史诗", position: "中前卫" },
    帕托: { type: "史诗", position: "中锋" },
    科库: { type: "史诗", position: "后腰" },
    马内: { type: "BT", position: "左边锋" },
    贝莱蒂: { type: "史诗", position: "右后卫" },
    迪乌夫: { type: "史诗", position: "中锋" },
    图拉姆: { type: "ST", position: "中锋" },
    格瓦迪奥尔: { type: "ST", position: "中后卫" },
    埃斯特旺: { type: "ST", position: "右边锋" },
    格拉利什: { type: "ST", position: "左边锋" },
    伊沃比: { type: "ST", position: "前腰" },
    奥努阿楚: { type: "ST", position: "中锋" },
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
  immortal_legends_chain_bundle: {
    贝利: { type: "史诗", position: "影锋" },
    克鲁伊夫: { type: "史诗", position: "前腰" },
    普斯卡什: { type: "史诗", position: "中锋" },
    贝肯鲍尔: { type: "史诗", position: "后腰" },
    贝贝托: { type: "史诗", position: "中锋" },
    盖德穆勒: { type: "史诗", position: "中锋" },
    科曼: { type: "史诗", position: "中后卫" },
    卡西利亚斯: { type: "史诗", position: "门将" },
    里瓦尔多: { type: "史诗", position: "前腰" },
    马萨罗: { type: "史诗", position: "中锋" },
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
  firepower_full_gift: {
    亚马尔: { type: "BT", position: "右边锋" },
    奥斯梅恩: { type: "BT", position: "中锋" },
    德尔皮耶罗: { type: "史诗", position: "中锋" },
    托蒂: { type: "史诗", position: "前腰" },
    阿德里亚诺: { type: "史诗", position: "中锋" },
    莫伦特斯: { type: "史诗", position: "中锋" },
    菲奥雷: { type: "史诗", position: "右前卫" },
  },
  midfield_master_halfprice: {
    卡纳瓦罗: { type: "史诗", position: "中后卫" },
    普拉蒂尼: { type: "史诗", position: "前腰" },
    马特乌斯: { type: "史诗", position: "前腰" },
    贝贝托: { type: "史诗", position: "中锋" },
    戴维斯: { type: "史诗", position: "后腰" },
    斯内德: { type: "史诗", position: "前腰" },
    古蒂: { type: "史诗", position: "中前卫" },
  },
  first_round_focus_discount: {
    赖斯: { type: "BT", position: "中前卫" },
    范戴克: { type: "ST", position: "中后卫" },
    阿扎尔: { type: "史诗", position: "前腰" },
    西多夫: { type: "史诗", position: "中前卫" },
    萨拉赫: { type: "ST", position: "右边锋" },
    莫德里奇: { type: "ST", position: "中前卫" },
    埃利奥特安德森: { type: "ST", position: "后腰" },
  },
  infinite_passion_nonrepeat: {
    梅西: { type: "BT", position: "影锋" },
    伊涅斯塔: { type: "BT", position: "左前卫" },
    阿圭罗: { type: "史诗", position: "中锋" },
    罗梅罗: { type: "ST", position: "中后卫" },
    内马尔: { type: "ST", position: "左边锋" },
    巴蒂斯图塔: { type: "史诗", position: "中锋" },
  },
  number_eight_shirt_exchange: {
    "B.费尔南德斯": { type: "BT", position: "前腰" },
    德塞利: { type: "BT", position: "中后卫" },
    里杰卡尔德: { type: "史诗", position: "后腰" },
    加图索: { type: "史诗", position: "后腰" },
    兰帕德: { type: "史诗", position: "中前卫" },
    索博斯洛伊: { type: "ST", position: "前腰" },
    巴尔韦德: { type: "ST", position: "中前卫" },
    埃利奥特安德森: { type: "ST", position: "后腰" },
  },
  defense_spring_shop: {
    瓦拉内: { type: "史诗", position: "中后卫" },
    麦孔: { type: "史诗", position: "右后卫" },
    弗莱彻: { type: "史诗", position: "后腰" },
    菲戈: { type: "史诗", position: "右前卫" },
    迪达: { type: "史诗", position: "门将" },
    科尔: { type: "史诗", position: "中锋" },
    贝林厄姆: { type: "ST", position: "中前卫" },
    居莱尔: { type: "ST", position: "前腰" },
    楚阿梅尼: { type: "ST", position: "后腰" },
    凯塞多: { type: "ST", position: "后腰" },
    卢卡库: { type: "ST", position: "中锋" },
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
  const ownedEmpoweredNames = {};
  empoweredCards.forEach((name) => {
    empoweredCounts[name] = 0;
    empoweredDetails[name] = [];
    ownedEmpoweredNames[name] = false;
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
    goldStats: {
      empowered: 0,
      selected: 0,
      star5: 0,
      star4: 0,
      star3: 0,
    },
    empoweredCounts,
    goldEmpoweredCounts: { ...empoweredCounts },
    empoweredDetails,
    goldEmpoweredDetails: JSON.parse(JSON.stringify(empoweredDetails)),
    resultsHistory: [],
    rewards: [],
    nextMilestoneIndex: 0,
    chainTierProgress: 0,
    chainSidePoolRemaining: [],
    badges: 0,
    nextBadgeMilestone: 10,
    exchangeBonusGiftMilestonesGranted: 0,
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
    shopReturnedGold: 0,
    shopRandomScholarRewards: 0,
    shopScholarMilestonesGranted: 0,
    shopSelect80Granted: false,
    shopSelect120Granted: false,
    highlightTicketPulls: 0,
    highlightTicketEmpoweredCount: 0,
    highlightTicketBatchRemaining: 0,
    keyMoments: [],
    resetCount: 0,
    ownedEmpoweredNames,
    hallPoints: 300,
    hallDrawnPlayers: {},
    hallSacrificeCounts: {},
    hallMilestonesGranted: [],
    gloryValue: 0,
    gloryMilestonesGranted: [],
    gloryDreamBoxRemaining: [],
    gloryExchangeCounts: {},
    starPackBatch: null,
    starPackLuckyStars: 0,
    starPackLuckyBoxesOpened: 0,
    starPackChoiceBoxPending: false,
    starPackCoreHits: 0,
    starPackOtherHits: 0,
    starPackCompletedPacks: 0,
    starPackCompletedBatchSizes: [],
    starPackVieiraGuaranteeClaimable: false,
    starPackVieiraMilestoneGranted: false,
    risingPityProgress: 0,
    risingOwnedTargets: {},
    risingCompletionRewardGranted: false,
    risingOfferRewardFlags: {},
    risingBatchRemaining: 0,
    risingHitInCurrentTen: false,
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

function getGoldStats(stateObj = state) {
  return stateObj?.goldStats || stateObj?.stats || {
    empowered: 0,
    selected: 0,
    star5: 0,
    star4: 0,
    star3: 0,
  };
}

function getGoldEmpoweredCounts(stateObj = state) {
  return stateObj?.goldEmpoweredCounts || stateObj?.empoweredCounts || {};
}

function getGoldEmpoweredDetails(stateObj = state) {
  return stateObj?.goldEmpoweredDetails || stateObj?.empoweredDetails || {};
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

function formatRisingPercent(p) {
  const percent = clamp01(Number(p) || 0) * 100;
  const decimals = percent < 0.1 ? 4 : percent < 1 ? 3 : 2;
  return percent.toFixed(decimals).replace(/\.?0+$/, "") + "%";
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

function isAccumulatedNonRepeatPool(pool = getCurrentPool()) {
  return (pool || getCurrentPool()).progressionType === "accumulated_nonrepeat";
}

function getRisingProbabilityConfig(pool = getCurrentPool()) {
  return isAccumulatedNonRepeatPool(pool) ? pool.risingProbabilityConfig || null : null;
}

function getRisingTargetPlayers(pool = getCurrentPool()) {
  return isAccumulatedNonRepeatPool(pool) ? (pool.targetPlayers || []).slice() : [];
}

function getRisingProbabilityAtProgress(progress, pool = getCurrentPool()) {
  const cfg = getRisingProbabilityConfig(pool);
  const base = getBaseEmpoweredProbability(pool.poolConfig || []);
  if (!cfg) return base;
  let multiplier = 1;
  (cfg.boosts || []).forEach((boost) => {
    if (Math.max(0, Number(progress) || 0) >= Number(boost.pulls || 0)) {
      multiplier = Math.max(1, Number(boost.multiplier) || 1);
    }
  });
  return clamp01(base * multiplier);
}

function getRisingOwnedTargetNames(stateObj = state, pool = getCurrentPool()) {
  const owned = stateObj?.risingOwnedTargets || {};
  return getRisingTargetPlayers(pool).filter((name) => Boolean(owned[name]));
}

function getCurrentRisingProbability(pool = getCurrentPool(), stateObj = state) {
  const targets = getRisingTargetPlayers(pool);
  if (!targets.length || getRisingOwnedTargetNames(stateObj, pool).length >= targets.length) return 0;
  const cap = Math.max(1, Number(getRisingProbabilityConfig(pool)?.guaranteePulls) || 191);
  const progress = Math.max(0, Number(stateObj?.risingPityProgress) || 0);
  if (progress >= cap - 1 && !stateObj?.risingHitInCurrentTen) return 1;
  return getRisingProbabilityAtProgress(progress, pool);
}

const risingStateDistributionCache = {};

function getRisingModelInfo(pool = getCurrentPool()) {
  const targets = getRisingTargetPlayers(pool);
  const allNames = pool.empoweredCards || [];
  const nameBits = {};
  allNames.forEach((name, index) => {
    nameBits[name] = 1 << index;
  });
  const targetMask = targets.reduce((mask, name) => mask | (nameBits[name] || 0), 0);
  return { targets, allNames, nameBits, targetMask };
}

function advanceRisingDistribution(states, draw, pool = getCurrentPool()) {
  const cfg = getRisingProbabilityConfig(pool);
  const cap = Math.max(1, Number(cfg?.guaranteePulls) || 191);
  const info = getRisingModelInfo(pool);
  const isTenBoundary = draw % 10 === 0;
  let next = new Map();
  const add = (mask, progress, hitInCurrentTen, probability, terminalMode = 0) => {
    if (probability <= 0) return;
    const stopped = terminalMode >= 2;
    const nextProgress = stopped ? 0 : (isTenBoundary && hitInCurrentTen ? 0 : progress);
    const nextHitFlag = stopped ? 0 : (isTenBoundary ? 0 : Number(Boolean(hitInCurrentTen)));
    const key = `${mask}|${nextProgress}|${nextHitFlag}|${terminalMode}`;
    next.set(key, (next.get(key) || 0) + probability);
  };

  states.forEach((probability, key) => {
    const [maskRaw, progressRaw, hitRaw, terminalRaw] = key.split("|");
    const mask = Number(maskRaw) || 0;
    const progress = Number(progressRaw) || 0;
    const hitInCurrentTen = Boolean(Number(hitRaw) || 0);
    const terminalMode = Number(terminalRaw) || 0;
    if (terminalMode > 0) {
      add(mask, 0, false, probability, 2);
      return;
    }
    const missing = info.targets.filter((name) => !(mask & info.nameBits[name]));
    if (!missing.length) {
      add(mask, 0, false, probability, 2);
      return;
    }
    const hitProbability = progress >= cap - 1 && !hitInCurrentTen
      ? 1
      : getRisingProbabilityAtProgress(progress, pool);
    const nextProgress = Math.min(cap - 1, progress + 1);
    add(mask, nextProgress, hitInCurrentTen, probability * (1 - hitProbability));
    const each = probability * hitProbability / missing.length;
    missing.forEach((name) => {
      let nextMask = mask | info.nameBits[name];
      if ((nextMask & info.targetMask) === info.targetMask) {
        nextMask |= info.nameBits[pool.completionReward];
      }
      const completed = (nextMask & info.targetMask) === info.targetMask;
      add(nextMask, nextProgress, true, each, completed ? 1 : 0);
    });
  });

  const offer = (pool.specialOfferConfig?.rewards || []).find(
    (reward) => Number(reward.pulls) === draw
  );
  if (!offer) return next;

  const afterOffer = new Map();
  const addOffer = (mask, progress, hitInCurrentTen, probability, terminalMode = 0) => {
    if (probability <= 0) return;
    const key = `${mask}|${progress}|${Number(Boolean(hitInCurrentTen))}|${terminalMode}`;
    afterOffer.set(key, (afterOffer.get(key) || 0) + probability);
  };
  next.forEach((probability, key) => {
    const [maskRaw, progressRaw, hitRaw, terminalRaw] = key.split("|");
    const mask = Number(maskRaw) || 0;
    const progress = Number(progressRaw) || 0;
    const hitInCurrentTen = Boolean(Number(hitRaw) || 0);
    const terminalMode = Number(terminalRaw) || 0;
    if (terminalMode >= 2) {
      addOffer(mask, progress, hitInCurrentTen, probability, terminalMode);
      return;
    }
    const hitChance = clamp01(Number(offer.chance) || 0);
    if (offer.type === "infinite_messi_chance") {
      addOffer(mask | info.nameBits[pool.completionReward], progress, hitInCurrentTen, probability * hitChance, terminalMode);
      addOffer(mask, progress, hitInCurrentTen, probability * (1 - hitChance), terminalMode);
    } else if (offer.type === "infinite_guaranteed_pack") {
      addOffer(mask | info.nameBits[pool.completionReward], progress, hitInCurrentTen, probability * hitChance, terminalMode);
      addOffer(mask | info.nameBits[pool.fallbackPlayer], progress, hitInCurrentTen, probability * (1 - hitChance), terminalMode);
    } else {
      addOffer(mask, progress, hitInCurrentTen, probability, terminalMode);
    }
  });
  return afterOffer;
}

function getRisingStateDistribution(pool, drawCount) {
  const count = Math.max(0, Math.floor(Number(drawCount) || 0));
  const key = `${pool.name}|${count}`;
  if (risingStateDistributionCache[key]) return risingStateDistributionCache[key];
  let states = new Map([["0|0|0|0", 1]]);
  for (let draw = 1; draw <= count; draw += 1) {
    states = advanceRisingDistribution(states, draw, pool);
  }
  risingStateDistributionCache[key] = states;
  return states;
}

function calcRisingMaskProbability(pool, drawCount, predicate) {
  let result = 0;
  getRisingStateDistribution(pool, drawCount).forEach((probability, key) => {
    const mask = Number(key.split("|")[0]) || 0;
    if (predicate(mask, getRisingModelInfo(pool))) result += probability;
  });
  return clamp01(result);
}

function calcRisingSpecificHitCDF(pool, drawCount, targetName) {
  const info = getRisingModelInfo(pool);
  const bit = info.nameBits[targetName] || 0;
  if (!bit) return 0;
  return calcRisingMaskProbability(pool, drawCount, (mask) => Boolean(mask & bit));
}

function calcRisingUniqueAtLeastCDF(pool, drawCount, targetCount) {
  return calcRisingMaskProbability(
    pool,
    drawCount,
    (mask) => bitCount(mask) >= Math.max(0, Number(targetCount) || 0)
  );
}

function calcRisingDirectTargetAtLeastCDF(pool, drawCount, targetCount) {
  const info = getRisingModelInfo(pool);
  return calcRisingMaskProbability(
    pool,
    drawCount,
    (mask) => bitCount(mask & info.targetMask) >= Math.max(0, Number(targetCount) || 0)
  );
}

function calcRisingFavoredSetMetrics(pool, selectedNames) {
  const info = getRisingModelInfo(pool);
  const selectedMask = Array.from(new Set(selectedNames || [])).reduce(
    (mask, name) => mask | (info.nameBits[name] || 0),
    0
  );
  if (!selectedMask) return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };
  const cap = 800;
  let states = new Map([["0|0|0|0", 1]]);
  let previousAny = 0;
  let previousAll = 0;
  let anyExpected = 0;
  let allExpected = 0;
  let anyExpectedGold = 0;
  let allExpectedGold = 0;
  let anyLowerPulls = null;
  let anyUpperPulls = null;
  let allLowerPulls = null;
  let allUpperPulls = null;
  for (let draw = 1; draw <= cap; draw += 1) {
    states = advanceRisingDistribution(states, draw, pool);
    let any = 0;
    let all = 0;
    states.forEach((probability, key) => {
      const mask = Number(key.split("|")[0]) || 0;
      if (mask & selectedMask) any += probability;
      if ((mask & selectedMask) === selectedMask) all += probability;
    });
    const anyHitAtDraw = Math.max(0, any - previousAny);
    const allHitAtDraw = Math.max(0, all - previousAll);
    const goldAtDraw = getPullCostForRange(0, draw, pool);
    anyExpected += draw * anyHitAtDraw;
    allExpected += draw * allHitAtDraw;
    anyExpectedGold += goldAtDraw * anyHitAtDraw;
    allExpectedGold += goldAtDraw * allHitAtDraw;
    if (anyLowerPulls == null && any >= 0.025) anyLowerPulls = draw;
    if (anyUpperPulls == null && any >= 0.975) anyUpperPulls = draw;
    if (allLowerPulls == null && all >= 0.025) allLowerPulls = draw;
    if (allUpperPulls == null && all >= 0.975) allUpperPulls = draw;
    previousAny = any;
    previousAll = all;
  }
  anyExpected += (cap + 1) * Math.max(0, 1 - previousAny);
  allExpected += (cap + 1) * Math.max(0, 1 - previousAll);
  if (previousAny < 1 - 1e-9) {
    anyExpected = Infinity;
    anyExpectedGold = Infinity;
  }
  if (previousAll < 1 - 1e-9) {
    allExpected = Infinity;
    allExpectedGold = Infinity;
  }
  return {
    anyExpected,
    allExpected,
    anyExpectedGold,
    allExpectedGold,
    anyLowerPulls,
    anyUpperPulls,
    allLowerPulls,
    allUpperPulls,
    allLowerGold: allLowerPulls == null ? null : getPullCostForRange(0, allLowerPulls, pool),
    allUpperGold: allUpperPulls == null ? null : getPullCostForRange(0, allUpperPulls, pool),
    allProbAtCap: clamp01(previousAll),
  };
}

function calcRisingFirstTargetOperationMetrics(pool = getCurrentPool()) {
  const cfg = getRisingProbabilityConfig(pool);
  const cap = Math.max(1, Number(cfg?.guaranteePulls) || 191);
  let survival = 1;
  let expectedHitPulls = 0;
  let expectedConsumedPulls = 0;
  let expectedGold = 0;
  let lowerHitPulls = null;
  let upperHitPulls = null;

  for (let draw = 1; draw <= cap; draw += 1) {
    const hitProbability = draw >= cap
      ? 1
      : getRisingProbabilityAtProgress(draw - 1, pool);
    const hitAtDraw = survival * hitProbability;
    const consumedPulls = Math.ceil(draw / 10) * 10;
    expectedHitPulls += draw * hitAtDraw;
    expectedConsumedPulls += consumedPulls * hitAtDraw;
    expectedGold += getPullCostForRange(0, consumedPulls, pool) * hitAtDraw;
    survival *= 1 - hitProbability;
    const cdf = clamp01(1 - survival);
    if (lowerHitPulls == null && cdf >= 0.025) lowerHitPulls = draw;
    if (upperHitPulls == null && cdf >= 0.975) upperHitPulls = draw;
  }

  const lowerConsumedPulls = Math.ceil((lowerHitPulls || cap) / 10) * 10;
  const upperConsumedPulls = Math.ceil((upperHitPulls || cap) / 10) * 10;
  return {
    expectedHitPulls,
    expectedConsumedPulls,
    expectedGold,
    lowerConsumedPulls,
    upperConsumedPulls,
    lowerGold: getPullCostForRange(0, lowerConsumedPulls, pool),
    upperGold: getPullCostForRange(0, upperConsumedPulls, pool),
  };
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
  if (isNonRepeatExchangePool(pool)) {
    const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
    const any =
      pAny > 0
        ? expectedWithDrawAndGuarantee(0, 470, (progressAfterDraw) =>
            getBaseEmpoweredProbability(pool.poolConfig || [])
          )
        : 0;
    const refTarget = (pool.empoweredCards || [])[0] || "";
    return {
      any,
      specific: refTarget ? calcNonRepeatEmpoweredSpecificExpected(pool, refTarget) : 0,
    };
  }
  const cfg = getExchangeConfig(pool);
  const bonusCfg = getExchangeBonusGiftConfig(pool);
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

  const getBonusSpecificProb = (targetName) => {
    if (!bonusCfg || !targetName) return 0;
    const candidates = getExchangeBonusGiftCandidates(pool, bonusCfg);
    return candidates.includes(targetName) ? bonusCfg.chance / Math.max(1, candidates.length) : 0;
  };

  const calcExpectedWithGuarantees = (pBase, cap, pBonus = 0) => {
    const stepProb = (draw) => {
      const giftProb = bonusCfg && draw % bonusCfg.everyPulls === 0 ? pBonus : 0;
      return clamp01(1 - (1 - clamp01(pBase)) * (1 - clamp01(giftProb)));
    };
    if (!cap || cap <= 0) {
      const cycleLength = bonusCfg ? bonusCfg.everyPulls : 1;
      const cycleProbs = [];
      for (let draw = 1; draw <= cycleLength; draw += 1) {
        cycleProbs.push(stepProb(draw));
      }
      return expectedFromSeasonCycle(0, cycleProbs);
    }
    let expected = 0;
    let survival = 1;
    for (let draw = 1; draw <= cap; draw += 1) {
      expected += survival;
      let missFactor = 1 - stepProb(draw);
      if (draw === cap) {
        missFactor = 0; // cap 抽触发自选保底
      }
      survival *= missFactor;
    }
    return expected;
  };

  const calcAnyExpected = () =>
    calcExpectedWithGuarantees(pAny, capAny, bonusCfg ? bonusCfg.chance : 0);

  const calcSpecificExpected = (targetName) => {
    if (!targetName) return 0;
    const pSpecific = pAny / n;
    const capSpecific = capSpecificByTarget(targetName);
    return calcExpectedWithGuarantees(pSpecific, capSpecific, getBonusSpecificProb(targetName));
  };

  const refTarget = (pool.empoweredCards || [])[0] || "";
  return {
    any: calcAnyExpected(),
    specific: calcSpecificExpected(refTarget),
  };
}

function getExchangeSelectCapForTarget(pool, targetName) {
  if (!targetName) return null;
  const cfg = getExchangeConfig(pool);
  if (cfg.fixedSelect42 && targetName === cfg.fixedSelect42) return 420;
  const select47Pool =
    Array.isArray(cfg.select47Players) && cfg.select47Players.length > 0
      ? cfg.select47Players
      : (pool.empoweredCards || []);
  return select47Pool.includes(targetName) ? 470 : null;
}

function getExchangeBonusGiftCandidates(pool, cfg = getExchangeBonusGiftConfig(pool)) {
  if (!cfg) return [];
  const names = pool.empoweredCards || [];
  const candidates =
    Array.isArray(cfg.candidateNames) && cfg.candidateNames.length > 0
      ? cfg.candidateNames
      : names;
  return candidates.filter((name) => names.includes(name));
}

function getExchangeBonusGiftCount(pool, drawCount) {
  const cfg = getExchangeBonusGiftConfig(pool);
  if (!cfg) return 0;
  return Math.floor(Math.max(0, Math.floor(Number(drawCount) || 0)) / cfg.everyPulls);
}

function calcAtLeastFromIndependentSources(sources, fixedGain, targetCount) {
  const need = Math.max(
    0,
    Math.floor(Number(targetCount) || 0) - Math.max(0, Number(fixedGain) || 0)
  );
  if (need <= 0) return 1;
  let dist = new Array(need + 1).fill(0);
  dist[0] = 1;
  sources.forEach((source) => {
    dist = convolveBinomialCapped(dist, source.trials, source.p, need);
  });
  return clamp01(dist[need] || 0);
}

function calcExchangeSpecificHitCDF(pool, drawCount, targetName) {
  if (isNonRepeatEmpoweredPool(pool)) {
    return calcNonRepeatEmpoweredSpecificHitCDF(pool, drawCount, targetName);
  }
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  if (!allNames.includes(targetName)) return 0;
  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const n = Math.max(1, allNames.length);
  const pSpecific = pAny / n;
  const cap = getExchangeSelectCapForTarget(pool, targetName);
  if (cap && drawCount >= cap) return 1;
  const bonusCfg = getExchangeBonusGiftConfig(pool);
  const bonusCandidates = getExchangeBonusGiftCandidates(pool, bonusCfg);
  const pBonusSpecific =
    bonusCfg && bonusCandidates.includes(targetName)
      ? bonusCfg.chance / Math.max(1, bonusCandidates.length)
      : 0;
  const noHit =
    (1 - pSpecific) ** drawCount *
    (1 - pBonusSpecific) ** getExchangeBonusGiftCount(pool, drawCount);
  return clamp01(1 - noHit);
}

function calcExchangeEmpoweredAtLeastCDF(pool, drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const cfg = getExchangeConfig(pool);
  const cap = cfg.fixedSelect42 ? 420 : 470;
  const fixedGain = drawCount >= cap ? 1 : 0;
  const bonusCfg = getExchangeBonusGiftConfig(pool);
  return calcAtLeastFromIndependentSources(
    [
      { trials: drawCount, p: pAny },
      { trials: getExchangeBonusGiftCount(pool, drawCount), p: bonusCfg ? bonusCfg.chance : 0 },
    ],
    fixedGain,
    targetCount
  );
}

function calcExchangeSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount) {
  if (isNonRepeatEmpoweredPool(pool)) {
    return calcNonRepeatEmpoweredSpecificCountAtLeastCDF(
      pool,
      drawCount,
      targetName,
      targetCount
    );
  }
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  if (!allNames.includes(targetName)) return 0;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const n = Math.max(1, allNames.length);
  const pSpecific = pAny / n;
  const cap = getExchangeSelectCapForTarget(pool, targetName);
  const fixedGain = cap && drawCount >= cap ? 1 : 0;
  const bonusCfg = getExchangeBonusGiftConfig(pool);
  const bonusCandidates = getExchangeBonusGiftCandidates(pool, bonusCfg);
  const pBonusSpecific =
    bonusCfg && bonusCandidates.includes(targetName)
      ? bonusCfg.chance / Math.max(1, bonusCandidates.length)
      : 0;
  return calcAtLeastFromIndependentSources(
    [
      { trials: drawCount, p: pSpecific },
      { trials: getExchangeBonusGiftCount(pool, drawCount), p: pBonusSpecific },
    ],
    fixedGain,
    targetCount
  );
}

function calcNonRepeatEmpoweredSpecificHitCDF(pool, drawCount, targetName) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  const targetIdx = allNames.indexOf(targetName);
  if (targetIdx === -1) return 0;

  const presetMask = getPresetOwnedMask(pool);
  if (presetMask & (1 << targetIdx)) return 1;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const fullMask = (1 << allNames.length) - 1;
  let states = new Map([[presetMask, 1]]);

  for (let draw = 1; draw <= drawCount; draw += 1) {
    const next = new Map();
    states.forEach((prob, mask) => {
      if (prob <= 0) return;
      if (mask & (1 << targetIdx)) {
        next.set(mask, (next.get(mask) || 0) + prob);
        return;
      }
      const ownedCount = bitCount(mask);
      if (ownedCount < allNames.length) {
        const remaining = allNames.length - ownedCount;
        next.set(mask, (next.get(mask) || 0) + prob * (1 - pAny));
        const hitTargetProb = prob * (pAny / remaining);
        if (hitTargetProb > 0) {
          const hitMask = mask | (1 << targetIdx);
          next.set(hitMask, (next.get(hitMask) || 0) + hitTargetProb);
        }
        if (remaining > 1) {
          const hitOtherEach = prob * (pAny / remaining);
          allNames.forEach((_, idx) => {
            if (idx === targetIdx || (mask & (1 << idx))) return;
            const hitMask = mask | (1 << idx);
            next.set(hitMask, (next.get(hitMask) || 0) + hitOtherEach);
          });
        }
      } else {
        const hitMask = mask | (1 << targetIdx);
        next.set(hitMask, (next.get(hitMask) || 0) + prob * (pAny / allNames.length));
        next.set(mask, (next.get(mask) || 0) + prob * (1 - pAny / allNames.length));
      }
    });

    if (pool.progressionType === "exchange_badge" && draw === 470) {
      const selectPool = getExchangeSelectPoolForCap(pool, 470);
      if (selectPool.includes(targetName)) {
        const afterSelect = new Map();
        next.forEach((prob, mask) => {
          const nextMask = mask | (1 << targetIdx);
          afterSelect.set(nextMask, (afterSelect.get(nextMask) || 0) + prob);
        });
        states = afterSelect;
      } else {
        states = next;
      }
    } else {
      states = next;
    }

    if (states.size === 1 && states.has(fullMask)) return 1;
  }

  let cdf = 0;
  states.forEach((prob, mask) => {
    if (mask & (1 << targetIdx)) cdf += prob;
  });
  return clamp01(cdf);
}

function calcNonRepeatEmpoweredSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0 || !targetName) return 0;
  const allNames = pool.empoweredCards || [];
  const targetIdx = allNames.indexOf(targetName);
  if (targetIdx === -1) return 0;

  const presetMask = getPresetOwnedMask(pool);
  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const cappedTarget = Math.max(1, targetCount);
  const initialHasTarget = Number(Boolean(presetMask & (1 << targetIdx)));
  let states = new Map([[`${presetMask}|${initialHasTarget}|0`, 1]]);

  for (let draw = 1; draw <= drawCount; draw += 1) {
    const next = new Map();
    states.forEach((prob, key) => {
      if (prob <= 0) return;
      const parts = key.split("|");
      const mask = Number(parts[0]);
      const hasTarget = Number(parts[1]) || 0;
      const count = Number(parts[2]) || 0;
      const push = (nextMask, nextHasTarget, nextCount, addProb) => {
        if (addProb <= 0) return;
        const cappedCount = Math.min(cappedTarget, nextCount);
        const nextKey = `${nextMask}|${nextHasTarget}|${cappedCount}`;
        next.set(nextKey, (next.get(nextKey) || 0) + addProb);
      };
      const ownedCount = bitCount(mask);

      if (ownedCount < allNames.length) {
        push(mask, hasTarget, count, prob * (1 - pAny));
        if (hasTarget) {
          allNames.forEach((_, idx) => {
            if (mask & (1 << idx)) return;
            if (idx === targetIdx) return;
            push(mask | (1 << idx), 1, count, prob * (pAny / (allNames.length - ownedCount)));
          });
        } else {
          const remaining = allNames.length - ownedCount;
          push(mask | (1 << targetIdx), 1, count + 1, prob * (pAny / remaining));
          allNames.forEach((_, idx) => {
            if (idx === targetIdx || (mask & (1 << idx))) return;
            push(mask | (1 << idx), 0, count, prob * (pAny / remaining));
          });
        }
      } else {
        push(mask, hasTarget, count + 1, prob * (pAny / allNames.length));
        push(mask, hasTarget, count, prob * (1 - pAny / allNames.length));
      }
    });

    let statesAfter = next;
    if (pool.progressionType === "exchange_badge" && draw === 470) {
      const selectPool = getExchangeSelectPoolForCap(pool, 470);
      if (selectPool.includes(targetName)) {
        const afterSelect = new Map();
        statesAfter.forEach((prob, key) => {
          const parts = key.split("|");
          const mask = Number(parts[0]);
          const count = Number(parts[2]) || 0;
          const nextMask = mask | (1 << targetIdx);
          const nextKey = `${nextMask}|1|${Math.min(cappedTarget, count + 1)}`;
          afterSelect.set(nextKey, (afterSelect.get(nextKey) || 0) + prob);
        });
        statesAfter = afterSelect;
      }
    }
    states = statesAfter;
  }

  let cdf = 0;
  states.forEach((prob, key) => {
    const count = Number(key.split("|")[2]) || 0;
    if (count >= targetCount) cdf += prob;
  });
  return clamp01(cdf);
}

function calcNonRepeatEmpoweredSpecificExpected(pool, targetName) {
  const allNames = pool.empoweredCards || [];
  const targetIdx = allNames.indexOf(targetName);
  if (targetIdx === -1) return 0;
  const presetMask = getPresetOwnedMask(pool);
  if (presetMask & (1 << targetIdx)) return 0;

  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  let expected = 0;
  let states = new Map([[presetMask, 1]]);

  const maxDraw =
    pool.progressionType === "exchange_badge"
      ? 470
      : Math.max(1200, Math.ceil((allNames.length / Math.max(pAny, 0.0001)) * 4));
  for (let draw = 1; draw <= maxDraw; draw += 1) {
    let survival = 0;
    states.forEach((prob, mask) => {
      if ((mask & (1 << targetIdx)) === 0) survival += prob;
    });
    expected += survival;

    const next = new Map();
    states.forEach((prob, mask) => {
      if (prob <= 0) return;
      if (mask & (1 << targetIdx)) {
        next.set(mask, (next.get(mask) || 0) + prob);
        return;
      }
      const ownedCount = bitCount(mask);
      if (ownedCount < allNames.length) {
        const remaining = allNames.length - ownedCount;
        next.set(mask, (next.get(mask) || 0) + prob * (1 - pAny));
        next.set(
          mask | (1 << targetIdx),
          (next.get(mask | (1 << targetIdx)) || 0) + prob * (pAny / remaining)
        );
        allNames.forEach((_, idx) => {
          if (idx === targetIdx || (mask & (1 << idx))) return;
          const hitMask = mask | (1 << idx);
          next.set(hitMask, (next.get(hitMask) || 0) + prob * (pAny / remaining));
        });
      } else {
        const hitMask = mask | (1 << targetIdx);
        next.set(hitMask, (next.get(hitMask) || 0) + prob * (pAny / allNames.length));
        next.set(mask, (next.get(mask) || 0) + prob * (1 - pAny / allNames.length));
      }
    });

    if (pool.progressionType === "exchange_badge" && draw === 470) {
      const selectPool = getExchangeSelectPoolForCap(pool, 470);
      if (selectPool.includes(targetName)) {
        return expected;
      }
    }
    states = next;
  }

  return expected;
}

function calcNonRepeatEmpoweredFavoredSetMetrics(pool, selectedNames) {
  const allNames = pool.empoweredCards || [];
  const selected = Array.from(new Set((selectedNames || []).filter((name) => allNames.includes(name))));
  if (!selected.length) return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };

  const selectedMask = selected.reduce((mask, name) => mask | (1 << allNames.indexOf(name)), 0);
  const presetMask = getPresetOwnedMask(pool);
  const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
  const cap = getFavoredProgressCap(pool, selected);
  const maxDraw =
    isNonRepeatEmpoweredPool(pool) && pool.progressionType !== "exchange_badge"
      ? Math.max(1200, Math.ceil((allNames.length / Math.max(pAny, 0.0001)) * 4))
      : Math.max(cap * 4, 1200);
  let states = new Map([[presetMask, 1]]);
  let prevAnyCDF = (presetMask & selectedMask) !== 0 ? 1 : 0;
  let prevAllCDF = (presetMask & selectedMask) === selectedMask ? 1 : 0;
  let anyExpected = 0;
  let allExpected = 0;
  let allCDFAtCap = prevAllCDF;

  for (let draw = 1; draw <= maxDraw; draw += 1) {
    let next = new Map();
    states.forEach((prob, mask) => {
      if (prob <= 0) return;
      const ownedCount = bitCount(mask);
      if (ownedCount < allNames.length) {
        next.set(mask, (next.get(mask) || 0) + prob * (1 - pAny));
        const remaining = allNames.length - ownedCount;
        allNames.forEach((_, idx) => {
          if (mask & (1 << idx)) return;
          const hitMask = mask | (1 << idx);
          next.set(hitMask, (next.get(hitMask) || 0) + prob * (pAny / remaining));
        });
      } else {
        next.set(mask, (next.get(mask) || 0) + prob);
      }
    });

    if (pool.progressionType === "exchange_badge" && draw === cap) {
      const selectPool = getExchangeSelectPoolForCap(pool, cap);
      const selectMask = selectPool.reduce((mask, name) => {
        const idx = allNames.indexOf(name);
        return idx >= 0 ? mask | (1 << idx) : mask;
      }, 0);
      const afterSelect = new Map();
      next.forEach((prob, mask) => {
        const missingSelectable = selected.find((name) => {
          const idx = allNames.indexOf(name);
          return idx >= 0 && (mask & (1 << idx)) === 0 && selectPool.includes(name);
        });
        if (missingSelectable) {
          const idx = allNames.indexOf(missingSelectable);
          const nextMask = mask | (1 << idx);
          afterSelect.set(nextMask, (afterSelect.get(nextMask) || 0) + prob);
          return;
        }
        if ((mask & selectMask) !== selectMask) {
          const firstSelectable = allNames.find((name) => selectPool.includes(name) && (mask & (1 << allNames.indexOf(name))) === 0);
          if (firstSelectable) {
            const idx = allNames.indexOf(firstSelectable);
            const nextMask = mask | (1 << idx);
            afterSelect.set(nextMask, (afterSelect.get(nextMask) || 0) + prob);
            return;
          }
        }
        afterSelect.set(mask, (afterSelect.get(mask) || 0) + prob);
      });
      next = afterSelect;
    }

    states = next;

    let anyCDF = 0;
    let allCDF = 0;
    states.forEach((prob, mask) => {
      if ((mask & selectedMask) !== 0) anyCDF += prob;
      if ((mask & selectedMask) === selectedMask) allCDF += prob;
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
  return {
    anyExpected,
    allExpected,
    allProbAtCap: clamp01(allCDFAtCap),
  };
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
    const candidates = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
    if (candidates.length > 0) {
      const valid = candidates.filter((name) => (pool.empoweredCards || []).includes(name));
      const count = valid.length;
      return {
        any: chance,
        specific: count > 0 ? chance / count : 0,
      };
    }
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
  const bonusCfg = getExchangeBonusGiftConfig(pool);
  const bonusAny = bonusCfg ? bonusCfg.chance : 0;
  const bonusSpecific = bonusCfg && empoweredCount > 0 ? bonusCfg.chance / empoweredCount : 0;
  for (let pulls = 1; pulls <= 500; pulls += 1) {
    let failAny = 1 - drawAny;
    let failSpecific = 1 - drawSpecific;
    if (bonusCfg && pulls % bonusCfg.everyPulls === 0) {
      failAny *= 1 - bonusAny;
      failSpecific *= 1 - bonusSpecific;
    }
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

function getShopFreeScholarCount(drawCount, pool = getCurrentPool()) {
  if (!isShopPackagePool(pool)) return 0;
  const every = Math.max(1, Number(pool.scholarEveryPacks || 10));
  const limit = Math.max(0, Number(pool.scholarMilestoneLimit || 10));
  return Math.min(limit, Math.floor(Math.max(0, Number(drawCount) || 0) / every));
}

function getShopScholarSpecificProb(pool, targetName) {
  if (targetName === "瓦拉内") return 0.002;
  return (pool.springPackagePlayers || []).includes(targetName) ? 0.15 / 10 : 0;
}

function getShopScholarDropProbability(pool = getCurrentPool()) {
  return clamp01(Number(pool.scholarDropProbability) || 0);
}

function getShopSelectGain(pool, drawCount, targetName) {
  let gain = 0;
  if (drawCount >= Number(pool.firstSelectPacks || 80) && (pool.springPackagePlayers || []).includes(targetName)) {
    gain += 1;
  }
  if (drawCount >= Number(pool.allSelectPacks || 120) && (pool.empoweredCards || []).includes(targetName)) {
    gain += 1;
  }
  return gain;
}

function calcShopPackageSpecificHitCDF(pool, drawCount, targetName) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (drawCount <= 0 || !targetName || !(pool.empoweredCards || []).includes(targetName)) return 0;
  if (getShopSelectGain(pool, drawCount, targetName) > 0) return 1;
  const springP = (pool.springPackagePlayers || []).includes(targetName) ? 0.04 / 10 : 0;
  const scholarP = getShopScholarSpecificProb(pool, targetName);
  const scholarDropP = getShopScholarDropProbability(pool);
  const freeScholar = getShopFreeScholarCount(drawCount, pool);
  const surviveSpring = (1 - springP) ** drawCount;
  const surviveRandomScholar = (1 - scholarDropP * scholarP) ** drawCount;
  const surviveFreeScholar = (1 - scholarP) ** freeScholar;
  return clamp01(1 - surviveSpring * surviveRandomScholar * surviveFreeScholar);
}

function convolveBinomialCapped(dist, trials, p, cap) {
  trials = Math.max(0, Math.floor(Number(trials) || 0));
  p = clamp01(p);
  if (trials <= 0 || p <= 0) return dist.slice();
  let out = dist.slice();
  for (let t = 0; t < trials; t += 1) {
    const next = new Array(cap + 1).fill(0);
    for (let count = 0; count <= cap; count += 1) {
      const prob = out[count] || 0;
      if (prob <= 0) continue;
      next[count] += prob * (1 - p);
      next[Math.min(cap, count + 1)] += prob * p;
    }
    out = next;
  }
  return out;
}

function calcShopPackageAtLeastFromComponents(components, fixedGain, targetCount) {
  const cap = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (cap <= 0) return 1;
  const need = Math.max(0, cap - Math.max(0, Number(fixedGain) || 0));
  if (need <= 0) return 1;
  let dist = new Array(need + 1).fill(0);
  dist[0] = 1;
  components.forEach((component) => {
    dist = convolveBinomialCapped(dist, component.trials, component.p, need);
  });
  return clamp01(dist[need] || 0);
}

function calcShopPackageEmpoweredAtLeastCDF(pool, drawCount, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0) return 0;
  const freeScholar = getShopFreeScholarCount(drawCount, pool);
  const scholarDropP = getShopScholarDropProbability(pool);
  const fixedGain =
    (drawCount >= Number(pool.firstSelectPacks || 80) ? 1 : 0) +
    (drawCount >= Number(pool.allSelectPacks || 120) ? 1 : 0);
  return calcShopPackageAtLeastFromComponents(
    [
      { trials: drawCount, p: 0.04 },
      { trials: drawCount, p: scholarDropP * 0.152 },
      { trials: freeScholar, p: 0.152 },
    ],
    fixedGain,
    targetCount
  );
}

function calcShopPackageSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount) {
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (drawCount <= 0 || !targetName || !(pool.empoweredCards || []).includes(targetName)) return 0;
  const freeScholar = getShopFreeScholarCount(drawCount, pool);
  const springP = (pool.springPackagePlayers || []).includes(targetName) ? 0.04 / 10 : 0;
  const scholarP = getShopScholarSpecificProb(pool, targetName);
  const scholarDropP = getShopScholarDropProbability(pool);
  const fixedGain = getShopSelectGain(pool, drawCount, targetName);
  return calcShopPackageAtLeastFromComponents(
    [
      { trials: drawCount, p: springP },
      { trials: drawCount, p: scholarDropP * scholarP },
      { trials: freeScholar, p: scholarP },
    ],
    fixedGain,
    targetCount
  );
}

function calcShopPackageExpected(pool, targetName = "") {
  const maxDraw = 120;
  let anyExpected = 0;
  let specificExpected = 0;
  let prevAny = 0;
  let prevSpecific = 0;
  const refTarget = targetName || (pool.empoweredCards || [])[0] || "";
  for (let draw = 1; draw <= maxDraw; draw += 1) {
    const anyCDF = calcShopPackageEmpoweredAtLeastCDF(pool, draw, 1);
    const specificCDF = refTarget ? calcShopPackageSpecificHitCDF(pool, draw, refTarget) : 0;
    anyExpected += draw * Math.max(0, anyCDF - prevAny);
    specificExpected += draw * Math.max(0, specificCDF - prevSpecific);
    prevAny = anyCDF;
    prevSpecific = specificCDF;
  }
  anyExpected += (maxDraw + 1) * Math.max(0, 1 - prevAny);
  specificExpected += (maxDraw + 1) * Math.max(0, 1 - prevSpecific);
  return { any: anyExpected, specific: specificExpected };
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

  const bonusGiftCfg = getExchangeBonusGiftConfig(pool);
  const bonusGiftSpecific = bonusGiftCfg && empoweredCount > 0 ? bonusGiftCfg.chance / empoweredCount : 0;
  let survive = 1;
  for (let pull = 1; pull <= targetDraws; pull += 1) {
    let failThisPull = 1 - drawSpecific;
    if (bonusGiftCfg && pull % bonusGiftCfg.everyPulls === 0) {
      failThisPull *= 1 - bonusGiftSpecific;
    }
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
        const candidates = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
        const valid = candidates.filter((name) => (pool.empoweredCards || []).includes(name));
        const hit = valid.length > 0
          ? (targetName && valid.includes(targetName) ? (reward.chance || 0) / valid.length : 0)
          : reward.targetName && reward.targetName === targetName
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

function isDiscountLimitedPool(pool = getCurrentPool()) {
  return pool.progressionType === "discount_limited";
}

function getPoolPricePerPull(pool = getCurrentPool()) {
  if (isGloryBoxPool(pool)) {
    return Math.max(1, Number(pool.pricePerPull || 1000));
  }
  if (isStarPackPool(pool)) {
    return Math.max(1, Number(pool.pricePerPull || 800));
  }
  if (isShopPackagePool(pool)) {
    return Math.max(1, Number(pool.packagePriceGold || 688));
  }
  if (isDiscountLimitedPool(pool)) {
    return Math.max(1, Number(pool.pricePerPull || 50));
  }
  if (isAccumulatedNonRepeatPool(pool)) {
    return Math.max(1, Number(pool.pricePerPull || 100));
  }
  return GOLD_PER_PULL;
}

function getPullCostForRange(startPulls, count, pool = getCurrentPool()) {
  const start = Math.max(0, Math.floor(Number(startPulls) || 0));
  const total = Math.max(0, Math.floor(Number(count) || 0));
  if (total <= 0) return 0;
  const basePrice = getPoolPricePerPull(pool);
  if (isAccumulatedNonRepeatPool(pool)) {
    const ranges = pool.specialOfferConfig?.discountedPulls || [];
    let cost = 0;
    for (let offset = 0; offset < total; offset += 1) {
      const pullNumber = start + offset + 1;
      const range = ranges.find(
        (item) => pullNumber >= Number(item.start) && pullNumber <= Number(item.end)
      );
      cost += range ? Math.max(1, Number(range.pricePerPull) || basePrice) : basePrice;
    }
    return cost;
  }
  const freeCfg = pool.bonusFreePullConfig || null;
  if (freeCfg) {
    const paidPulls = Math.max(0, Math.floor(Number(freeCfg.paidPulls) || 0));
    const freePulls = Math.max(0, Math.floor(Number(freeCfg.freePulls) || 0));
    const cycle = paidPulls + freePulls;
    if (cycle > 0 && paidPulls > 0) {
      let paidCount = 0;
      for (let offset = 0; offset < total; offset += 1) {
        const cycleIndex = (start + offset) % cycle;
        if (cycleIndex < paidPulls) paidCount += 1;
      }
      return paidCount * basePrice;
    }
  }
  if (!isDiscountLimitedPool(pool) || !pool.discountPullLimit || !pool.discountPricePerPull) {
    return total * basePrice;
  }
  const discountLimit = Math.max(0, Math.floor(Number(pool.discountPullLimit) || 0));
  const discountPrice = Math.max(1, Number(pool.discountPricePerPull) || basePrice);
  const discountedCount = Math.max(0, Math.min(total, discountLimit - start));
  const normalCount = total - discountedCount;
  return discountedCount * discountPrice + normalCount * basePrice;
}

function getGoldCostForCurrentState(pool = getCurrentPool()) {
  const totalPulls = Math.max(0, Number(state.totalPulls) || 0);
  if (isChainPool()) return getChainTierSpentGold();
  if (isAccumulatedNonRepeatPool(pool)) return getPullCostForRange(0, totalPulls, pool);
  if (isDiscountLimitedPool(pool)) return getPullCostForRange(0, totalPulls, pool);
  return totalPulls * getPoolPricePerPull(pool);
}

function getPoolPullCap(pool = getCurrentPool()) {
  if (isDiscountLimitedPool(pool)) {
    if (pool.maxPullsPerReset == null) return 30;
    return Math.max(0, Number(pool.maxPullsPerReset) || 0);
  }
  return 0;
}

function getRemainingPullSlots(pool = getCurrentPool()) {
  const cap = getPoolPullCap(pool);
  if (cap <= 0) return Infinity;
  return Math.max(0, cap - Math.max(0, Number(state.totalPulls) || 0));
}

function getFavoredHitProbabilityByDrawCount(drawCount) {
  const pool = getCurrentPool();
  const names = getEmpoweredStatNames();
  if (!names.length || drawCount <= 0) return 0;
  const targetName = getCurrentFavoredTargetName();
  const normalizedTarget = targetName && names.includes(targetName) ? targetName : names[0];

  const cacheKey = `${getProbabilityVariantKey(pool)}|${normalizedTarget}|${drawCount}`;
  if (favoredProbabilityCache[cacheKey] != null) {
    return favoredProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (isAccumulatedNonRepeatPool(pool)) {
    cdf = calcRisingSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (isNonRepeatEmpoweredPool(pool)) {
    cdf = calcNonRepeatEmpoweredSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (isChainPool()) {
    cdf = calcChainSpecificCDF(drawCount, normalizedTarget);
  } else if (isShopPackagePool(pool)) {
    cdf = calcShopPackageSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (isSeasonPool()) {
    cdf = simulateSeasonSpecificCDF(drawCount, normalizedTarget);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeSpecificCDF(pool, drawCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificHitCDF(pool, drawCount, normalizedTarget);
  } else if (isHallRoadPool(pool)) {
    cdf = simulateHallRoadSpecificCDF(pool, drawCount, normalizedTarget);
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
  const names = getEmpoweredStatNames();
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  if (!names.length || drawCount <= 0 || !targetName || !names.includes(targetName)) return 0;

  const cacheKey = `${getProbabilityVariantKey(pool)}|${targetName}|${drawCount}`;
  if (specificProbabilityCache[cacheKey] != null) {
    return specificProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (isAccumulatedNonRepeatPool(pool)) {
    cdf = calcRisingSpecificHitCDF(pool, drawCount, targetName);
  } else if (isNonRepeatEmpoweredPool(pool)) {
    cdf = calcNonRepeatEmpoweredSpecificHitCDF(pool, drawCount, targetName);
  } else if (isChainPool()) {
    cdf = calcChainSpecificCDF(drawCount, targetName);
  } else if (isShopPackagePool(pool)) {
    cdf = calcShopPackageSpecificHitCDF(pool, drawCount, targetName);
  } else if (isSeasonPool()) {
    cdf = simulateSeasonSpecificCDF(drawCount, targetName);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeSpecificCDF(pool, drawCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneSpecificHitCDF(pool, drawCount, targetName);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificHitCDF(pool, drawCount, targetName);
  } else if (isHallRoadPool(pool)) {
    cdf = simulateHallRoadSpecificCDF(pool, drawCount, targetName);
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
  if (isDiscountLimitedPool(pool)) return getPoolPullCap(pool);
  if (isShopPackagePool(pool)) return Number(pool.allSelectPacks || 120);
  if (isSeasonPool()) return 500;
  if (isAccumulatedGuaranteePool()) return getAccumulatedGuaranteeProgressCap(pool);
  if (isAccumulatedNonRepeatPool(pool)) return 800;
  if (pool.progressionType === "milestone") {
    if (Number(pool.progressCap) > 0) return Number(pool.progressCap);
    const firstSelect = (pool.milestones || []).find((m) => m.type === "empowered_select");
    return firstSelect ? Number(firstSelect.pulls) || 500 : 500;
  }
  if (pool.progressionType === "exchange_badge") {
    const cfg = getExchangeConfig(pool);
    const selected = Array.from(new Set((selectedNames || []).filter(Boolean)));
    if (cfg.fixedSelect42 && selected.length === 1 && selected[0] === cfg.fixedSelect42) {
      return 420;
    }
    return 470;
  }
  return 500;
}

function getExchangeSelectPoolForCap(pool, capDraw) {
  const cfg = getExchangeConfig(pool);
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

function calcShopPackageFavoredSetMetrics(pool, selectedNames) {
  const selected = Array.from(new Set((selectedNames || []).filter((name) => (pool.empoweredCards || []).includes(name))));
  if (!selected.length) return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };
  const bitOf = {};
  selected.forEach((name, idx) => {
    bitOf[name] = 1 << idx;
  });
  const fullMask = (1 << selected.length) - 1;
  const springPlayers = pool.springPackagePlayers || [];

  const applyRandomCandidates = (states, chance, candidates) => {
    const next = new Map();
    const valid = (candidates || []).filter(Boolean);
    const poolCount = Math.max(1, valid.length);
    states.forEach((prob, mask) => {
      if (prob <= 0) return;
      let miss = prob;
      valid.forEach((name) => {
        const bit = bitOf[name] || 0;
        const p = prob * (chance / poolCount);
        if (bit && (mask & bit) === 0) {
          miss -= p;
          next.set(mask | bit, (next.get(mask | bit) || 0) + p);
        }
      });
      next.set(mask, (next.get(mask) || 0) + Math.max(0, miss));
    });
    return next;
  };

  const applyScholar = (states, chance) => {
    const next = new Map();
    states.forEach((prob, mask) => {
      let miss = prob;
      const varaneBit = bitOf["瓦拉内"] || 0;
      const varaneProb = prob * chance * 0.002;
      if (varaneBit && (mask & varaneBit) === 0) {
        miss -= varaneProb;
        next.set(mask | varaneBit, (next.get(mask | varaneBit) || 0) + varaneProb);
      }
      const springEach = prob * chance * (0.15 / Math.max(1, springPlayers.length));
      springPlayers.forEach((name) => {
        const bit = bitOf[name] || 0;
        if (bit && (mask & bit) === 0) {
          miss -= springEach;
          next.set(mask | bit, (next.get(mask | bit) || 0) + springEach);
        }
      });
      next.set(mask, (next.get(mask) || 0) + Math.max(0, miss));
    });
    return next;
  };

  const applySelect = (states, candidates) => {
    const next = new Map();
    states.forEach((prob, mask) => {
      const missing = selected
        .filter((name) => (candidates || []).includes(name))
        .map((name) => bitOf[name])
        .filter((bit) => bit && (mask & bit) === 0);
      if (missing.length > 0) {
        const bit = missing[0];
        next.set(mask | bit, (next.get(mask | bit) || 0) + prob);
      } else {
        next.set(mask, (next.get(mask) || 0) + prob);
      }
    });
    return next;
  };

  let states = new Map([[0, 1]]);
  let anyExpected = 0;
  let allExpected = 0;
  let prevAny = 0;
  let prevAll = 0;
  let allProbAtCap = 0;
  const cap = Number(pool.allSelectPacks || 120);
  const maxDraw = Math.max(480, cap * 4);

  for (let draw = 1; draw <= maxDraw; draw += 1) {
    states = applyRandomCandidates(states, 0.04, springPlayers);
    states = applyScholar(states, getShopScholarDropProbability(pool));
    if (draw % Math.max(1, Number(pool.scholarEveryPacks || 10)) === 0 && draw <= 100) {
      states = applyScholar(states, 1);
    }
    if (draw === Number(pool.firstSelectPacks || 80)) {
      states = applySelect(states, springPlayers);
    }
    if (draw === Number(pool.allSelectPacks || 120)) {
      states = applySelect(states, pool.empoweredCards || []);
    }

    let anyCDF = 0;
    let allCDF = 0;
    states.forEach((prob, mask) => {
      if (mask !== 0) anyCDF += prob;
      if (mask === fullMask) allCDF += prob;
    });
    anyExpected += draw * Math.max(0, anyCDF - prevAny);
    allExpected += draw * Math.max(0, allCDF - prevAll);
    prevAny = anyCDF;
    prevAll = allCDF;
    if (draw === cap) allProbAtCap = allCDF;
  }

  anyExpected += (maxDraw + 1) * Math.max(0, 1 - prevAny);
  allExpected += (maxDraw + 1) * Math.max(0, 1 - prevAll);
  return { anyExpected, allExpected, allProbAtCap: clamp01(allProbAtCap) };
}

function simulateDrawFavoredSetHitTimes(pool, selectedNames) {
  const selected = Array.from(new Set((selectedNames || []).filter(Boolean)));
  if (isNonRepeatEmpoweredPool(pool)) {
    return calcNonRepeatEmpoweredFavoredSetMetrics(pool, selected);
  }
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
              const hitChance = clamp01(reward.chance || 0);
              const candidates = Array.isArray(reward.candidateNames) ? reward.candidateNames : [];
              const validBits = candidates
                .map((name) => bitOf[name] || 0)
                .filter((bit) => bit !== 0);
              if (validBits.length > 0 && hitChance > 0) {
                const perBitHit = hitChance / validBits.length;
                validBits.forEach((bit) => {
                  if ((dMask & bit) === 0) {
                    push(afterReward, dMask | bit, idx + 1, 0, dProb * perBitHit);
                  } else {
                    push(afterReward, dMask, idx + 1, 0, dProb * perBitHit);
                  }
                });
                push(afterReward, dMask, idx + 1, 0, dProb * (1 - hitChance));
              } else {
                const targetBit = reward.targetName ? bitOf[reward.targetName] || 0 : 0;
                if (targetBit && (dMask & targetBit) === 0 && hitChance > 0) {
                  push(afterReward, dMask | targetBit, idx + 1, 0, dProb * hitChance);
                  push(afterReward, dMask, idx + 1, 0, dProb * (1 - hitChance));
                } else {
                  push(afterReward, dMask, idx + 1, 0, dProb);
                }
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
      const bonusCfg = getExchangeBonusGiftConfig(pool);
      if (bonusCfg && draw % bonusCfg.everyPulls === 0) {
        next = applyRandomEmpowered(
          next,
          bonusCfg.chance,
          getExchangeBonusGiftCandidates(pool, bonusCfg),
          true
        );
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
  if (isAccumulatedNonRepeatPool(pool)) {
    const normalizedNames = uniq.slice().sort();
    const key = `${activePoolKey}|rising|${normalizedNames.join(",")}`;
    if (favoredSetMetricsCache[key]) return favoredSetMetricsCache[key];
    const exact = calcRisingFavoredSetMetrics(pool, normalizedNames);
    favoredSetMetricsCache[key] = {
      ...exact,
      cap: 800,
      unit: "抽",
    };
    return favoredSetMetricsCache[key];
  }
  if (isShopPackagePool(pool)) {
    const normalizedNames = uniq.slice().sort();
    const key = `${activePoolKey}|shop|${normalizedNames.join(",")}`;
    if (favoredSetMetricsCache[key]) return favoredSetMetricsCache[key];
    const cap = getFavoredProgressCap(pool, normalizedNames);
    const exact = calcShopPackageFavoredSetMetrics(pool, normalizedNames);
    favoredSetMetricsCache[key] = {
      anyExpected: exact.anyExpected,
      allExpected: exact.allExpected,
      allProbAtCap: exact.allProbAtCap,
      cap,
      unit: "次",
    };
    return favoredSetMetricsCache[key];
  }
  if (isNonRepeatEmpoweredPool(pool)) {
    const normalizedNames = uniq.slice().sort();
    const key = `${getProbabilityVariantKey(pool)}|${normalizedNames.join(",")}`;
    if (favoredSetMetricsCache[key]) return favoredSetMetricsCache[key];
    const cap = getFavoredProgressCap(pool, normalizedNames);
    const exact = calcNonRepeatEmpoweredFavoredSetMetrics(pool, normalizedNames);
    favoredSetMetricsCache[key] = {
      anyExpected: exact.anyExpected,
      allExpected: exact.allExpected,
      allProbAtCap: exact.allProbAtCap,
      cap,
      unit: "抽",
    };
    return favoredSetMetricsCache[key];
  }
  if (isHallRoadPool(pool)) {
    const normalizedNames = uniq.slice().sort();
    const key = `${activePoolKey}|hall|${normalizedNames.join(",")}`;
    if (favoredSetMetricsCache[key]) return favoredSetMetricsCache[key];
    const metrics = simulateHallRoadFavoredSetMetrics(pool, normalizedNames);
    const result = { ...metrics, cap: 5500, unit: "抽" };
    favoredSetMetricsCache[key] = result;
    return result;
  }
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
    ? `${getProbabilityVariantKey(pool)}|count:${uniq.length}`
    : `${getProbabilityVariantKey(pool)}|${normalizedNames.join(",")}`;
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

  const cacheKey = `${getProbabilityVariantKey(getCurrentPool())}|${drawCount}|${targetCount}`;
  if (empoweredCountProbabilityCache[cacheKey] != null) {
    return empoweredCountProbabilityCache[cacheKey];
  }

  const pool = getCurrentPool();
  let cdf = 0;
  if (isAccumulatedNonRepeatPool(pool)) {
    cdf = calcRisingDirectTargetAtLeastCDF(pool, drawCount, targetCount);
  } else if (isSeasonPool()) {
    cdf = simulateSeasonEmpoweredAtLeastCDF(drawCount, targetCount);
  } else if (isChainPool()) {
    cdf = calcChainEmpoweredAtLeastCDF(drawCount, targetCount);
  } else if (isShopPackagePool(pool)) {
    cdf = calcShopPackageEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (isAccumulatedGuaranteePool()) {
    cdf = calcAccumulatedGuaranteeEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (pool.progressionType === "milestone") {
    cdf = calcMilestoneEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeEmpoweredAtLeastCDF(pool, drawCount, targetCount);
  } else if (isHallRoadPool(pool)) {
    cdf = simulateHallRoadEmpoweredAtLeastCDF(pool, drawCount, targetCount);
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
  const names = getEmpoweredStatNames();
  drawCount = Math.max(0, Math.floor(Number(drawCount) || 0));
  targetCount = Math.max(0, Math.floor(Number(targetCount) || 0));
  if (targetCount <= 0) return 1;
  if (!names.length || drawCount <= 0 || !targetName || !names.includes(targetName)) return 0;

  const cacheKey = `${getProbabilityVariantKey(pool)}|${targetName}|${drawCount}|${targetCount}|count`;
  if (specificCountProbabilityCache[cacheKey] != null) {
    return specificCountProbabilityCache[cacheKey];
  }

  let cdf = 0;
  if (isAccumulatedNonRepeatPool(pool)) {
    cdf = targetCount <= 1 ? calcRisingSpecificHitCDF(pool, drawCount, targetName) : 0;
  } else if (isNonRepeatEmpoweredPool(pool)) {
    cdf = calcNonRepeatEmpoweredSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount);
  } else if (pool.progressionType === "accumulated_target") {
    cdf = calcAccumulatedGuaranteeSpecificCountAtLeastCDF(pool, drawCount, targetCount);
  } else if (isShopPackagePool(pool)) {
    cdf = calcShopPackageSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount);
  } else if (pool.progressionType === "exchange_badge") {
    cdf = calcExchangeSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount);
  } else if (isHallRoadPool(pool)) {
    cdf = simulateHallRoadSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount);
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
  const pool = getCurrentPool();
  const names = isAccumulatedNonRepeatPool(pool)
    ? getRisingTargetPlayers(pool)
    : getEmpoweredStatNames();
  let count = 0;
  const presetOwned = isNonRepeatExchangePool() ? new Set(getPresetOwnedNames()) : null;
  const goldCounts = getGoldEmpoweredCounts();
  names.forEach((name) => {
    if ((Number(goldCounts[name]) || 0) > 0 || (presetOwned && presetOwned.has(name))) {
      count += 1;
    }
  });
  return count;
}

function simulateUniqueEmpoweredAtLeastCDF(progressCount, targetUniqueCount, runs = 8000) {
  const pool = getCurrentPool();
  const allNames = getEmpoweredStatNames();
  if (targetUniqueCount <= 0) return 1;
  if (progressCount <= 0 || allNames.length <= 0) return 0;
  if (targetUniqueCount > allNames.length) return 0;

  if (isAccumulatedNonRepeatPool(pool)) {
    return calcRisingDirectTargetAtLeastCDF(pool, progressCount, targetUniqueCount);
  }

  if (pool.progressionType === "accumulated_target") {
    if (targetUniqueCount > 1) return 0;
    return calcAccumulatedGuaranteeSpecificCDF(pool, progressCount);
  }

  if (isShopPackagePool(pool)) {
    const names = pool.empoweredCards || [];
    const bitOf = {};
    names.forEach((name, idx) => {
      bitOf[name] = 1 << idx;
    });
    const springPlayers = pool.springPackagePlayers || [];
    const applyRandom = (states, chance, candidates) => {
      const next = new Map();
      const valid = (candidates || []).filter((name) => bitOf[name]);
      const poolCount = Math.max(1, (candidates || []).length);
      states.forEach((prob, mask) => {
        let miss = prob;
        valid.forEach((name) => {
          const bit = bitOf[name];
          const p = prob * (chance / poolCount);
          if ((mask & bit) === 0) {
            miss -= p;
            next.set(mask | bit, (next.get(mask | bit) || 0) + p);
          }
        });
        next.set(mask, (next.get(mask) || 0) + Math.max(0, miss));
      });
      return next;
    };
    const applyScholar = (states, chance) => {
      const next = new Map();
      states.forEach((prob, mask) => {
        let miss = prob;
        const varaneBit = bitOf["瓦拉内"] || 0;
        const varaneProb = prob * chance * 0.002;
        if (varaneBit && (mask & varaneBit) === 0) {
          miss -= varaneProb;
          next.set(mask | varaneBit, (next.get(mask | varaneBit) || 0) + varaneProb);
        }
        const springEach = prob * chance * (0.15 / Math.max(1, springPlayers.length));
        springPlayers.forEach((name) => {
          const bit = bitOf[name] || 0;
          if (bit && (mask & bit) === 0) {
            miss -= springEach;
            next.set(mask | bit, (next.get(mask | bit) || 0) + springEach);
          }
        });
        next.set(mask, (next.get(mask) || 0) + Math.max(0, miss));
      });
      return next;
    };
    const applySelect = (states, candidates) => {
      const next = new Map();
      states.forEach((prob, mask) => {
        const missing = (candidates || []).find((name) => {
          const bit = bitOf[name] || 0;
          return bit && (mask & bit) === 0;
        });
        if (missing) {
          const bit = bitOf[missing];
          next.set(mask | bit, (next.get(mask | bit) || 0) + prob);
        } else {
          next.set(mask, (next.get(mask) || 0) + prob);
        }
      });
      return next;
    };
    let states = new Map([[0, 1]]);
    for (let draw = 1; draw <= progressCount; draw += 1) {
      states = applyRandom(states, 0.04, springPlayers);
      states = applyScholar(states, getShopScholarDropProbability(pool));
      if (draw % Math.max(1, Number(pool.scholarEveryPacks || 10)) === 0 && draw <= 100) {
        states = applyScholar(states, 1);
      }
      if (draw === Number(pool.firstSelectPacks || 80)) states = applySelect(states, springPlayers);
      if (draw === Number(pool.allSelectPacks || 120)) states = applySelect(states, names);
    }
    let cdf = 0;
    states.forEach((prob, mask) => {
      if (bitCount(mask) >= targetUniqueCount) cdf += prob;
    });
    return clamp01(cdf);
  }

  if (isNonRepeatEmpoweredPool(pool)) {
    const initialOwned = getPresetOwnedNames().length;
    const total = allNames.length;
    if (targetUniqueCount <= initialOwned) return 1;
    const pAny = clamp01(getBaseEmpoweredProbability(pool.poolConfig || []));
    const cap = pool.progressionType === "exchange_badge" ? 470 : Infinity;
    let cdf = 0;
    for (let hits = 0; hits <= progressCount; hits += 1) {
      const hitProb =
        hits === 0
          ? (1 - pAny) ** progressCount
          : 0;
      const pmf =
        hits === 0
          ? hitProb
          : calcBinomialAtLeast(progressCount, pAny, hits) -
            calcBinomialAtLeast(progressCount, pAny, hits + 1);
      if (pmf <= 0) continue;
      let uniqueCount = initialOwned + Math.min(hits, Math.max(0, total - initialOwned));
      if (Number.isFinite(cap) && progressCount >= cap && uniqueCount < total) {
        uniqueCount += 1;
      }
      if (uniqueCount >= targetUniqueCount) cdf += pmf;
    }
    return clamp01(cdf);
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
      const cap = getExchangeConfig(pool).fixedSelect42 ? 420 : 470;
      const selectPool = getExchangeSelectPoolForCap(pool, cap);
      const bonusCfg = getExchangeBonusGiftConfig(pool);
      const bonusCandidates = getExchangeBonusGiftCandidates(pool, bonusCfg);
      for (let draw = 1; draw <= progressCount; draw += 1) {
        if (Math.random() < pAny) addRandomName(got, pool.empoweredCards || []);
        if (draw === cap) {
          addSelectNamePreferNew(got, selectPool);
        }
        if (bonusCfg && draw % bonusCfg.everyPulls === 0 && Math.random() < bonusCfg.chance) {
          addRandomName(got, bonusCandidates);
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
            const candidates =
              Array.isArray(reward.candidateNames) && reward.candidateNames.length > 0
                ? reward.candidateNames
                : reward.targetName
                ? [reward.targetName]
                : (pool.empoweredCards || []);
            addRandomName(got, candidates);
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

  const cacheKey = `${getProbabilityVariantKey(getCurrentPool())}|${progressCount}|${targetUniqueCount}|unique`;
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

function getExceedPercentForHighlightTicketEmpoweredCount(ticketCount, empoweredCount) {
  const currentTicketCount = Math.max(0, Math.floor(Number(ticketCount) || 0));
  const currentEmpoweredCount = Math.max(0, Math.floor(Number(empoweredCount) || 0));
  const probMore = calcBinomialAtLeast(currentTicketCount, 0.1, currentEmpoweredCount + 1);
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
  if (event.exceedPercent != null) {
    openCinematicHitModal({
      kind: "favored_only",
      targetName: event.targetName,
      totalDraws: event.totalDraws,
      exceedPercent: event.exceedPercent,
      progressUnit: event.progressUnit || "draw",
      isFavored: true,
    });
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

  if (isAccumulatedNonRepeatPool(pool)) {
    const targets = getRisingTargetPlayers(pool);
    const directMetrics = getFavoredSetExpectedMetrics(targets);
    const refTarget = getCurrentFavoredTargetName() || targets[0] || pool.completionReward;
    const favoredMetrics = getFavoredSetExpectedMetrics([refTarget]);
    const baseAnyProbability = getBaseEmpoweredProbability(pool.poolConfig || []);
    return {
      baseAny: 1 / Math.max(0.000001, baseAnyProbability),
      baseSpecific:
        targets.includes(refTarget) && targets.length > 0
          ? 1 / Math.max(0.000001, baseAnyProbability / targets.length)
          : 0,
      giftAny: directMetrics.anyExpected,
      giftSpecific: favoredMetrics.allExpected,
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

  if (isShopPackagePool(pool)) {
    const refTarget = getCurrentFavoredTargetName() || (pool.empoweredCards || [])[0] || "";
    const withGift = calcShopPackageExpected(pool, refTarget);
    return {
      baseAny: 1 / 0.04,
      baseSpecific:
        refTarget === "瓦拉内"
          ? 1 / (getShopScholarDropProbability(pool) * 0.002)
          : 1 / (0.04 / 10),
      giftAny: withGift.any,
      giftSpecific: withGift.specific,
    };
  }

  if (isNonRepeatEmpoweredPool(pool)) {
    const refTarget = getCurrentFavoredTargetName() || (pool.empoweredCards || [])[0] || "";
    return {
      baseAny,
      baseSpecific,
      giftAny: baseAny,
      giftSpecific: refTarget ? calcNonRepeatEmpoweredSpecificExpected(pool, refTarget) : baseSpecific,
    };
  }

  if (isHallRoadPool(pool)) {
    const refTarget = getCurrentFavoredTargetName() || getHallRoadFeaturedNames(pool)[0] || (pool.empoweredCards || [])[0] || "";
    return {
      baseAny,
      baseSpecific,
      giftAny: baseAny,
      giftSpecific: refTarget ? simulateHallRoadGoal(refTarget) : baseSpecific,
    };
  }

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
    isAccumulatedNonRepeatPool() ||
    isNonRepeatEmpoweredPool() ||
    isHallRoadPool() ||
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
      (isChainPool() || isAccumulatedNonRepeatPool()) &&
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
  let html =
    `期望${isChainPool() ? "档位" : "抽数"}：任意心仪 <span class="expected-value">${anyText}</span>；` +
    `集齐心仪 <span class="expected-value">${allText}</span>${extra}`;
  if (isAccumulatedNonRepeatPool()) {
    const goldText = Number.isFinite(setMetrics.allExpectedGold)
      ? `${Math.round(setMetrics.allExpectedGold).toLocaleString("zh-CN")}金币`
      : "无有限期望";
    html += `；按特惠礼包折扣，集齐心仪期望花费 <span class="expected-value">${goldText}</span>`;
  }

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
    line3.innerHTML =
      (event.isFavored ? "<span class=\"fav-hit-inline-note\">恭喜你获得心仪球员！</span>" : "") +
      buildCinematicStatsLine(event);

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
    line2.innerHTML = `仅用 <span class="expected-value">${event.totalDraws}</span> ${getProgressUnitText(event.progressUnit)}`;
    line3.innerHTML = event.skipLuckText
      ? "高光券出货！"
      : `超过了 <span class="expected-value">${event.exceedPercent.toFixed(2)}%</span> 的玩家！`;
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
  resumeHighlightTicketBatchIfNeeded();
  resumeStarPackBatchIfNeeded();
  resumeRisingBatchIfNeeded();
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
  return remaining >= getPullCostForRange(state.totalPulls || 0, count);
}

function spendGoldForPulls(count) {
  if (activeModeKey !== REAL_MODE_KEY) return true;
  const cost = getPullCostForRange(state.totalPulls || 0, count);
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
  Object.keys(getGoldEmpoweredDetails(state)).forEach((name) => {
    getGoldEmpoweredDetails(state)[name] = [];
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
  if (progressUnit === "tier") return "档";
  if (progressUnit === "ticket") return "张券";
  return "抽";
}

function buildCinematicStatsLine(ctx) {
  const unitText = getProgressUnitText(ctx.progressUnit);
  if (ctx.skipLuckText) {
    if (ctx.kind === "all_empowered") {
      return `你已用 <span class="expected-value">${ctx.totalDraws}</span> ${unitText}获得了 <span class="expected-value">${ctx.targetName}</span>！`;
    }
    return `仅用 <span class="expected-value">${ctx.totalDraws}</span> ${unitText}就拿到了它！`;
  }
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
  resumeHighlightTicketBatchIfNeeded();
  resumeStarPackBatchIfNeeded();
  resumeRisingBatchIfNeeded();
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
  if (!isSeasonPool() && !isAccumulatedGuaranteePool() && !isAccumulatedNonRepeatPool(pool)) {
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
    : isAccumulatedNonRepeatPool(pool)
    ? getCurrentRisingProbability(pool, state)
    : getAccumulatedGuaranteeProbByCurrentProgress(state.totalPulls || 0, pool);
  const diff = boostedEmpoweredProb - baseEmpoweredProb;
  empowered.probability = boostedEmpoweredProb;
  star4.probability = Math.max(0, star4.probability - diff);
  return boostedConfig;
}

function rollBaseCard(excludedEmpoweredNames = []) {
  const pool = getCurrentPool();
  const excluded = new Set(excludedEmpoweredNames || []);
  const baseEmpoweredCards = isNonRepeatEmpoweredPool(pool)
    ? getCurrentAvailableEmpoweredNames(pool)
    : pool.empoweredCards || [];
  let empoweredCards = baseEmpoweredCards.filter((name) => !excluded.has(name));
  if (!empoweredCards.length) empoweredCards = baseEmpoweredCards;
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
  const pool = getCurrentPool();
  const empoweredCards = pool.empoweredCards || [];
  const candidateNames =
    specifiedName || !isNonRepeatEmpoweredPool(pool)
      ? empoweredCards
      : getCurrentAvailableEmpoweredNames(pool);
  const name = specifiedName || randomFromArray(candidateNames);
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
  const {
    countTowardsTotal = true,
    milestonePulls = null,
    sourcePulls = null,
    ticketPullIndex = null,
    excludeFromGoldStats = false,
  } = options;
  const favoredTargetNames = getCurrentFavoredTargetNames();
  const favoredTargetName = favoredTargetNames[0] || "";

  if (countTowardsTotal) {
    state.totalPulls += 1;
    if (isSeasonPool()) {
      state.seasonProgressPulls = (state.seasonProgressPulls || 0) + 1;
    }
  }

  switch (card.type) {
    case "empowered": {
      state.stats.empowered += 1;
      if (source === "highlight-ticket") {
        state.highlightTicketEmpoweredCount =
          Math.max(0, Number(state.highlightTicketEmpoweredCount) || 0) + 1;
      }
      if (card.name) {
        const prevCount = state.empoweredCounts[card.name] || 0;
        if (state.empoweredCounts[card.name] == null) {
          state.empoweredCounts[card.name] = 0;
        }
        state.empoweredCounts[card.name] += 1;
        if (isHallRoadPool()) {
          addHallPointsOnDraw(card.name);
        }
        if (!state.empoweredDetails[card.name]) {
          state.empoweredDetails[card.name] = [];
        }
        state.empoweredDetails[card.name].push({
          time: getTimestamp(),
          source,
          pullIndex: countTowardsTotal ? state.totalPulls : null,
          milestonePulls,
          sourcePulls,
          ticketPullIndex,
        });
        if (isSeasonPool()) {
          state.seasonObtainedEmpoweredNames[card.name] = true;
        }
        if (!excludeFromGoldStats) {
          const goldStats = getGoldStats();
          const goldCounts = getGoldEmpoweredCounts();
          const goldDetails = getGoldEmpoweredDetails();
          goldStats.empowered += 1;
          if (goldCounts[card.name] == null) {
            goldCounts[card.name] = 0;
          }
          goldCounts[card.name] += 1;
          if (!goldDetails[card.name]) {
            goldDetails[card.name] = [];
          }
          goldDetails[card.name].push({
            time: getTimestamp(),
            source,
            pullIndex: countTowardsTotal ? state.totalPulls : null,
            milestonePulls,
            sourcePulls,
            ticketPullIndex,
          });
        }
        const animationMode = getCurrentAnimationMode();
        const isSequentialStarPackHit =
          isStarPackPool() && source === "star-pack-core";
        const animationProgressDraws =
          isStarPackPool() &&
          typeof source === "string" &&
          source.startsWith("star-pack") &&
          sourcePulls != null
            ? Math.max(0, Number(sourcePulls) || 0)
            : getCurrentAnimationProgressDraws();
        if (
          animationMode === ANIMATION_MODES.ALL_EMPOWERED ||
          (isSequentialStarPackHit && animationMode !== ANIMATION_MODES.NONE)
        ) {
          const isTicket = source === "highlight-ticket";
          const totalDraws = isTicket
            ? Math.max(0, Number(ticketPullIndex) || 0)
            : animationProgressDraws;
          const goldEmpoweredCount = Math.max(0, Number(getGoldStats().empowered) || 0);
          const ticketEmpoweredCount = Math.max(
            0,
            Number(state.highlightTicketEmpoweredCount) || 0
          );
          pendingFavoredHitEvent = {
            kind: "all_empowered",
            targetName: card.name,
            totalDraws,
            empoweredCount: isTicket ? ticketEmpoweredCount : goldEmpoweredCount,
            exceedPercent: isTicket
              ? getExceedPercentForHighlightTicketEmpoweredCount(totalDraws, ticketEmpoweredCount)
              : getExceedPercentForEmpoweredCountByProgress(totalDraws, goldEmpoweredCount),
            isFavored: Boolean(favoredTargetNames.includes(card.name)),
            progressUnit: isTicket ? "ticket" : (isChainPool() ? "tier" : "draw"),
          };
        } else if (
          animationMode === ANIMATION_MODES.FAVORED_ONLY &&
          favoredTargetNames.includes(card.name) &&
          prevCount === 0
        ) {
          const isTicket = source === "highlight-ticket";
          pendingFavoredHitEvent = {
            kind: "favored_only",
            targetName: card.name,
            totalDraws: isTicket
              ? Math.max(0, Number(ticketPullIndex) || 0)
              : animationProgressDraws,
            progressUnit: isTicket ? "ticket" : (isChainPool() ? "tier" : "draw"),
            exceedPercent: isTicket
              ? getExceedPercentForHighlightTicketEmpoweredCount(
                Math.max(0, Number(ticketPullIndex) || 0),
                Math.max(0, Number(state.highlightTicketEmpoweredCount) || 0)
              )
              : undefined,
          };
        }
      }
      break;
    }
    case "selected":
      state.stats.selected += 1;
      if (!excludeFromGoldStats) getGoldStats().selected += 1;
      break;
    case "star5":
      state.stats.star5 += 1;
      if (!excludeFromGoldStats) getGoldStats().star5 += 1;
      break;
    case "star4":
      state.stats.star4 += 1;
      if (!excludeFromGoldStats) getGoldStats().star4 += 1;
      break;
    case "star3":
      state.stats.star3 += 1;
      if (!excludeFromGoldStats) getGoldStats().star3 += 1;
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
    sourcePulls,
    ticketPullIndex,
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
  if (pool.progressionType === "accumulated_nonrepeat") {
    unlockRisingRewardsIfNeeded();
    return;
  }
  if (pool.progressionType === "hall_road") {
    unlockHallRoadMilestonesIfNeeded();
    return;
  }
  if (pool.progressionType === "shop_package") {
    unlockShopPackageRewardsIfNeeded();
    return;
  }
  if (pool.progressionType === "exchange_badge") {
    unlockBadgesIfNeeded();
    unlockExchangeBonusGiftsIfNeeded();
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
  if (pool.progressionType === "glory_box") {
    unlockGloryMilestonesIfNeeded();
    return;
  }
  unlockExchangeBonusGiftsIfNeeded();
  unlockMilestonesIfNeeded();
}

function unlockRisingRewardsIfNeeded() {
  const pool = getCurrentPool();
  if (!isAccumulatedNonRepeatPool(pool)) return;
  state.risingOfferRewardFlags = state.risingOfferRewardFlags || {};
  let added = false;
  (pool.specialOfferConfig?.rewards || []).forEach((reward) => {
    const threshold = Math.max(0, Number(reward.pulls) || 0);
    if (state.totalPulls < threshold || state.risingOfferRewardFlags[threshold]) return;
    state.risingOfferRewardFlags[threshold] = true;
    state.rewards.push({
      id: `infinite-offer-${threshold}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ...reward,
      sourceLabel:
        reward.type === "infinite_messi_chance"
          ? "8000金币特惠礼包1"
          : threshold === 300
          ? "18000金币特惠礼包2（第1次）"
          : "18000金币特惠礼包2（第2次）",
    });
    added = true;
  });

  const targets = getRisingTargetPlayers(pool);
  const allCollected = targets.length > 0 && targets.every(
    (name) => Boolean(state.risingOwnedTargets?.[name])
  );
  if (allCollected && !state.risingCompletionRewardGranted) {
    state.risingCompletionRewardGranted = true;
    state.rewards.push({
      id: `infinite-complete-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      pulls: state.totalPulls,
      type: "infinite_completion_messi",
      fixedName: pool.completionReward || "梅西",
      label: "双增能决胜高光梅西",
      sourceLabel: "集齐4名指定目标球员赠送",
    });
    added = true;
  }
  if (added && !pendingFavoredHitEvent && !isAnyHitModalOpen()) {
    maybeAutoOpenRewards();
  }
}

function addShopScholarReward(sourceLabel, options = {}) {
  const id = `shop-scholar-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  if (options.randomDrop) {
    state.shopRandomScholarRewards = Math.max(0, Number(state.shopRandomScholarRewards) || 0) + 1;
  }
  state.rewards.push({
    id,
    pulls: state.totalPulls,
    type: "shop_scholar_pack",
    label: "学霸礼包",
    sourceLabel: sourceLabel || "学霸礼包",
  });
}

function unlockShopPackageRewardsIfNeeded() {
  const pool = getShopPackageConfig();
  if (!pool) return;
  const total = Math.max(0, Number(state.totalPulls) || 0);
  const every = Math.max(1, Number(pool.scholarEveryPacks || 10));
  const limit = Math.max(0, Number(pool.scholarMilestoneLimit || 10));
  const shouldGrant = Math.min(limit, Math.floor(total / every));
  while ((state.shopScholarMilestonesGranted || 0) < shouldGrant) {
    state.shopScholarMilestonesGranted += 1;
    addShopScholarReward(`${state.shopScholarMilestonesGranted * every}个春日礼包赠送`);
  }

  if (!state.shopSelect80Granted && total >= Number(pool.firstSelectPacks || 80)) {
    state.shopSelect80Granted = true;
    state.pendingSelectRewardCount += 1;
    state.pendingSelectMilestones.push({
      pulls: total,
      sourceLabel: "80个春日礼包自选",
      candidateNames: (pool.springPackagePlayers || []).slice(),
    });
  }

  if (!state.shopSelect120Granted && total >= Number(pool.allSelectPacks || 120)) {
    state.shopSelect120Granted = true;
    state.pendingSelectRewardCount += 1;
    state.pendingSelectMilestones.push({
      pulls: total,
      sourceLabel: "120个春日礼包11人自选",
      candidateNames: (pool.empoweredCards || []).slice(),
    });
  }

  maybeAutoOpenRewards();
}

function addReturnedGold(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (value <= 0) return;
  state.shopReturnedGold = Math.max(0, Number(state.shopReturnedGold) || 0) + value;
  if (activeModeKey === REAL_MODE_KEY) {
    if (realModeMeta.remainingGold == null) realModeMeta.remainingGold = 0;
    realModeMeta.remainingGold += value;
  }
}

function rollWeightedItem(items) {
  const list = Array.isArray(items) ? items : [];
  const total = list.reduce((sum, item) => sum + Math.max(0, Number(item.probability) || 0), 0);
  if (total <= 0) return null;
  const r = Math.random() * total;
  let cumulative = 0;
  for (const item of list) {
    cumulative += Math.max(0, Number(item.probability) || 0);
    if (r < cumulative) return item;
  }
  return list[list.length - 1] || null;
}

function rollSpringShopPackage() {
  const pool = getShopPackageConfig();
  if (!pool) return;
  const packagePrice = getPoolPricePerPull(pool);
  if (!spendGoldAmount(packagePrice)) {
    openInsufficientGoldModal();
    return;
  }

  state.totalPulls += 1;
  const springPlayers = pool.springPackagePlayers || [];
  if (Math.random() < 0.04) {
    recordSingleDraw(
      createEmpoweredCard(randomFromArray(springPlayers)),
      "spring-shop",
      { countTowardsTotal: false, sourcePulls: state.totalPulls }
    );
  } else {
    recordSingleDraw(createFiveStarCard(), "spring-shop", {
      countTowardsTotal: false,
      sourcePulls: state.totalPulls,
    });
  }

  if (Math.random() < getShopScholarDropProbability(pool)) {
    addShopScholarReward("春日礼包10%随机获得", { randomDrop: true });
  }

  unlockShopPackageRewardsIfNeeded();
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function rollShopScholarPackCard(reward) {
  const pool = getShopPackageConfig();
  if (!pool) return null;
  const item = rollWeightedItem(pool.scholarPackConfig || []);
  if (!item) return null;
  if (item.type === "empowered_fixed") {
    return createEmpoweredCard(item.fixedName);
  }
  if (item.type === "spring_random") {
    return createEmpoweredCard(randomFromArray(pool.springPackagePlayers || []));
  }
  if (item.type === "gold") {
    addReturnedGold(item.amount);
    return { type: "gold", name: `${item.amount} 金币` };
  }
  return { type: "token", name: item.label || "礼包道具" };
}

function drawHighlightTicket(count = 1) {
  const cfg = getHighlightTicketConfig();
  const pool = getCurrentPool();
  if (!cfg || !pool) return;
  const total = Math.max(1, Math.floor(Number(count) || 1));
  pendingFavoredHitEvent = null;
  state.highlightTicketBatchRemaining = total;
  continueHighlightTicketBatch();
}

function continueHighlightTicketBatch() {
  const cfg = getHighlightTicketConfig();
  const pool = getCurrentPool();
  if (!cfg || !pool) return;
  if (isAnyHitModalOpen()) return;
  let didDraw = false;
  while ((Number(state.highlightTicketBatchRemaining) || 0) > 0) {
    state.highlightTicketBatchRemaining -= 1;
    didDraw = true;
    pendingFavoredHitEvent = null;
    state.highlightTicketPulls = Math.max(0, Number(state.highlightTicketPulls) || 0) + 1;
    const hit = Math.random() < clamp01(Number(cfg.probability) || 0);
    const card = hit ? createEmpoweredCard() : createFiveStarCard();
    recordSingleDraw(card, "highlight-ticket", {
      countTowardsTotal: false,
      ticketPullIndex: state.highlightTicketPulls,
      excludeFromGoldStats: true,
    });
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) {
      renderAll();
      showFavoredHitAnimationIfNeeded();
      return;
    }
  }
  if (didDraw) {
    renderAll();
  }
  showFavoredHitAnimationIfNeeded();
}

function resumeHighlightTicketBatchIfNeeded() {
  if ((Number(state.highlightTicketBatchRemaining) || 0) <= 0) return;
  if (isAnyHitModalOpen()) return;
  continueHighlightTicketBatch();
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

function getExchangeBonusGiftConfig(pool = getCurrentPool()) {
  const cfg = pool?.exchangeBonusGiftConfig;
  if (!cfg) return null;
  const everyPulls = Math.max(1, Math.floor(Number(cfg.everyPulls) || 0));
  const chance = clamp01(Number(cfg.chance) || 0);
  if (chance <= 0) return null;
  return {
    everyPulls,
    chance,
    label: cfg.label || `${Math.round(chance * 100)}% 随机增能卡包`,
    sourceLabel: cfg.sourceLabel || `每${everyPulls}抽随机增能卡包`,
    candidateNames: Array.isArray(cfg.candidateNames) ? cfg.candidateNames.slice() : null,
  };
}

function unlockExchangeBonusGiftsIfNeeded() {
  const pool = getCurrentPool();
  const cfg = getExchangeBonusGiftConfig(pool);
  if (!cfg) return;
  const total = Math.max(0, Number(state.totalPulls) || 0);
  const shouldGrant = Math.floor(total / cfg.everyPulls);
  while ((state.exchangeBonusGiftMilestonesGranted || 0) < shouldGrant) {
    state.exchangeBonusGiftMilestonesGranted += 1;
    const pulls = state.exchangeBonusGiftMilestonesGranted * cfg.everyPulls;
    state.rewards.push({
      id: `exchange-gift-${pulls}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      pulls,
      type: "exchange_target_chance",
      chance: cfg.chance,
      candidateNames: cfg.candidateNames || (pool.empoweredCards || []).slice(),
      label: cfg.label,
      sourceLabel: cfg.sourceLabel,
    });
  }
  maybeAutoOpenRewards();
}

function getGloryConfig(pool = getCurrentPool()) {
  return pool?.gloryConfig || null;
}

function interpolateGloryProbability(completedPulls, fromPulls, fromProb, toPulls, toProb) {
  const span = Math.max(1, toPulls - fromPulls);
  return fromProb + (completedPulls - fromPulls) * ((toProb - fromProb) / span);
}

function getGloryValueProbability(completedPulls) {
  const n = Math.max(0, Math.floor(Number(completedPulls) || 0));
  if (n <= 5) return interpolateGloryProbability(n, 0, 0.006, 5, 0.03);
  if (n <= 10) return interpolateGloryProbability(n, 5, 0.03, 10, 0.0375);
  if (n <= 15) return interpolateGloryProbability(n, 10, 0.0375, 15, 0.045);
  if (n <= 20) return interpolateGloryProbability(n, 15, 0.045, 20, 0.0525);
  if (n <= 25) return interpolateGloryProbability(n, 20, 0.0525, 25, 0.0588);
  if (n <= 30) return interpolateGloryProbability(n, 25, 0.0588, 30, 0.06);
  return 0.06;
}

function formatGloryPercent(p) {
  return `${(clamp01(Number(p) || 0) * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

function rollGloryValueCount(completedPulls) {
  const p = getGloryValueProbability(completedPulls);
  const guaranteed = completedPulls >= 70;
  const randomRolls = guaranteed ? 9 : 10;
  let count = guaranteed ? 1 : 0;
  for (let i = 0; i < randomRolls; i += 1) {
    if (Math.random() < p) count += 1;
  }
  return count;
}

function calcBinomialExact(n, p, k) {
  const trials = Math.max(0, Math.floor(Number(n) || 0));
  const hits = Math.max(0, Math.floor(Number(k) || 0));
  const prob = clamp01(Number(p) || 0);
  if (hits > trials) return 0;
  let comb = 1;
  for (let i = 1; i <= hits; i += 1) {
    comb *= (trials - hits + i) / i;
  }
  return comb * (prob ** hits) * ((1 - prob) ** (trials - hits));
}

function calcGloryTargetPullMetrics(targetValue = 36, maxPulls = 400) {
  const target = Math.max(1, Math.floor(Number(targetValue) || 36));
  let dist = new Array(target).fill(0);
  dist[0] = 1;
  let expected = 0;
  let lowerPulls = null;
  let upperPulls = null;
  let cumulativeHit = 0;
  for (let completedPulls = 0; completedPulls < maxPulls; completedPulls += 1) {
    const survival = dist.reduce((sum, p) => sum + p, 0);
    expected += survival;
    if (survival < 1e-10) break;
    const p = getGloryValueProbability(completedPulls);
    const randomRolls = completedPulls >= 70 ? 9 : 10;
    const guaranteed = completedPulls >= 70 ? 1 : 0;
    const gainDist = new Array(randomRolls + guaranteed + 1).fill(0);
    for (let k = 0; k <= randomRolls; k += 1) {
      gainDist[k + guaranteed] = calcBinomialExact(randomRolls, p, k);
    }
    const next = new Array(target).fill(0);
    let hitThisPull = 0;
    for (let current = 0; current < target; current += 1) {
      const base = dist[current];
      if (base <= 0) continue;
      gainDist.forEach((prob, gain) => {
        if (prob <= 0) return;
        const to = current + gain;
        if (to < target) {
          next[to] += base * prob;
        } else {
          hitThisPull += base * prob;
        }
      });
    }
    cumulativeHit += hitThisPull;
    const pullNumber = completedPulls + 1;
    if (lowerPulls == null && cumulativeHit >= 0.025) lowerPulls = pullNumber;
    if (upperPulls == null && cumulativeHit >= 0.975) upperPulls = pullNumber;
    dist = next;
  }
  return {
    expected,
    lowerPulls: lowerPulls ?? 0,
    upperPulls: upperPulls ?? maxPulls,
  };
}

function calcGloryExpectedPullsToTarget(targetValue = 36, maxPulls = 400) {
  return calcGloryTargetPullMetrics(targetValue, maxPulls).expected;
}

function addGloryReward(type, pulls, label, extra = {}) {
  state.rewards.push({
    id: `glory-${type}-${pulls}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    pulls,
    type,
    label,
    sourceLabel: extra.sourceLabel || label,
    ...extra,
  });
}

function unlockGloryMilestonesIfNeeded() {
  const cfg = getGloryConfig();
  if (!cfg) return;
  state.gloryMilestonesGranted = state.gloryMilestonesGranted || [];
  const total = Math.max(0, Number(state.totalPulls) || 0);
  (cfg.milestones || []).forEach((m) => {
    if (total >= m.pulls && !state.gloryMilestonesGranted.includes(m.pulls)) {
      state.gloryMilestonesGranted.push(m.pulls);
      addGloryReward(m.type, m.pulls, m.label);
    }
  });
  maybeAutoOpenRewards();
}

function rollGloryHighlightBoxCard(reward = {}) {
  const cfg = getGloryConfig();
  const chance = reward.chance == null ? 0.15 : Number(reward.chance) || 0;
  if (Math.random() < chance) {
    return createEmpoweredCard(cfg?.highlightTarget || "克洛泽");
  }
  return createEmpoweredCard(cfg?.highlightFallback || "巴蒂斯图塔");
}

function openGloryDreamBoxCard() {
  const cfg = getGloryConfig();
  const players = (cfg?.dreamBoxPlayers || []).slice();
  if (!players.length) return createEmpoweredCard(cfg?.highlightFallback || "巴蒂斯图塔");
  state.gloryDreamBoxRemaining = Array.isArray(state.gloryDreamBoxRemaining)
    ? state.gloryDreamBoxRemaining.filter((name) => players.includes(name))
    : [];
  if (state.gloryDreamBoxRemaining.length === 0) {
    state.gloryDreamBoxRemaining = players.slice();
  }
  const name = randomFromArray(state.gloryDreamBoxRemaining);
  state.gloryDreamBoxRemaining = state.gloryDreamBoxRemaining.filter((item) => item !== name);
  return createEmpoweredCard(name);
}

function getStarPackConfig(pool = getCurrentPool()) {
  return isStarPackPool(pool) ? pool.starPackConfig || null : null;
}

function getStarPackCategoryById(categoryId, pool = getCurrentPool()) {
  return (getStarPackConfig(pool)?.packCategories || []).find(
    (category) => category.id === categoryId
  ) || null;
}

function rollStarPackCategory(pool = getCurrentPool()) {
  const categories = getStarPackConfig(pool)?.packCategories || [];
  const totalWeight = categories.reduce(
    (sum, category) => sum + Math.max(0, Number(category.weight) || 0),
    0
  );
  if (!categories.length) return null;
  if (totalWeight <= 0) return categories[0];
  let roll = Math.random() * totalWeight;
  for (const category of categories) {
    roll -= Math.max(0, Number(category.weight) || 0);
    if (roll < 0) return category;
  }
  return categories[categories.length - 1];
}

function createStarPackTearRoute() {
  const kinds = Object.keys(STAR_PACK_TEAR_PROBABILITIES);
  for (let attempt = 0; attempt < 10000; attempt += 1) {
    const route = [];
    const counts = { potential: 0, signing: 0, tear: 0 };
    while (route.length < STAR_PACK_MAX_TILES && counts.tear < 2) {
      const roll = Math.random();
      let cumulative = 0;
      let kind = "tear";
      for (const candidate of kinds) {
        cumulative += STAR_PACK_TEAR_PROBABILITIES[candidate];
        if (roll < cumulative) {
          kind = candidate;
          break;
        }
      }
      route.push(kind);
      counts[kind] += 1;
    }
    const hasUpgrade =
      Math.floor(counts.potential / 2) > 0 || Math.floor(counts.signing / 2) > 0;
    if (counts.tear >= 2 && hasUpgrade) return route;
  }
  return ["potential", "potential", "tear", "signing", "tear"];
}

function createStarPackLuckyMatrix(packCount, routeLength) {
  const count = Math.max(1, Math.floor(Number(packCount) || 1));
  const length = Math.max(1, Math.floor(Number(routeLength) || 1));
  return Array.from({ length: count }, () => {
    const row = Array.from(
      { length },
      () => Math.random() < STAR_PACK_LUCKY_STAR_BASE_RATE
    );
    if (!row.some(Boolean)) {
      row[Math.floor(Math.random() * length)] = true;
    }
    return row;
  });
}

function getStarPackBatchProgress(batch = state.starPackBatch) {
  const revealedKinds = batch?.revealedKinds || [];
  const potentialCount = revealedKinds.filter((kind) => kind === "potential").length;
  const signingCount = revealedKinds.filter((kind) => kind === "signing").length;
  const tearCount = revealedKinds.filter((kind) => kind === "tear").length;
  const potentialTier = Math.min(3, Math.floor(potentialCount / 2));
  const signingTier = Math.min(3, Math.floor(signingCount / 2));
  return {
    potentialCount,
    signingCount,
    tearCount,
    potentialTier,
    signingTier,
    rating: 99 + potentialTier,
    coreRate: STAR_PACK_SIGNING_RATES[signingTier],
  };
}

function unlockStarPackVieiraMilestoneIfNeeded() {
  const cfg = getStarPackConfig();
  const target = Math.max(1, Number(cfg?.vieiraMilestonePacks) || 100);
  if (
    !cfg ||
    state.starPackVieiraMilestoneGranted ||
    state.starPackVieiraGuaranteeClaimable ||
    Math.max(0, Number(state.starPackCompletedPacks) || 0) < target
  ) {
    return;
  }
  state.starPackVieiraGuaranteeClaimable = true;
}

function claimStarPackVieiraGuarantee() {
  if (
    !isStarPackPool() ||
    !state.starPackVieiraGuaranteeClaimable ||
    state.starPackVieiraMilestoneGranted
  ) {
    return;
  }
  const cfg = getStarPackConfig();
  const target = Math.max(1, Number(cfg?.vieiraMilestonePacks) || 100);
  state.starPackVieiraGuaranteeClaimable = false;
  state.starPackVieiraMilestoneGranted = true;
  recordSingleDraw(createEmpoweredCard(cfg?.vieiraName || "维埃拉"), "star-pack-guarantee-100", {
    countTowardsTotal: false,
    milestonePulls: target,
    sourcePulls: target,
    excludeFromGoldStats: true,
  });
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function purchaseStarPackBatch(packCount) {
  if (!isStarPackPool()) return false;
  const currentBatch = state.starPackBatch;
  if (currentBatch && currentBatch.status !== "opened") return false;
  const count = [1, 3, 10].includes(Number(packCount)) ? Number(packCount) : 1;
  const price = count * getPoolPricePerPull();
  if (!spendGoldAmount(price)) {
    openInsufficientGoldModal();
    return false;
  }

  const route = createStarPackTearRoute();
  const category = rollStarPackCategory();
  const startPackIndex = Math.max(0, Number(state.totalPulls) || 0) + 1;
  state.totalPulls = startPackIndex + count - 1;
  state.starPackBatch = {
    count,
    startPackIndex,
    categoryId: category?.id || "",
    route,
    luckyMatrix: createStarPackLuckyMatrix(count, route.length),
    step: 0,
    revealedKinds: [],
    revealedTiles: {},
    starsGained: 0,
    status: "tearing",
    results: [],
    openedCount: 0,
    directCoreHits: 0,
    statsBatchIndex: null,
  };
  renderAll();
  return true;
}

function finishStarPackBatch() {
  const batch = state.starPackBatch;
  if (!batch || batch.status !== "tearing") return;
  batch.status = "opening";
  batch.openedCount = 0;
  batch.directCoreHits = 0;
  state.starPackCompletedBatchSizes = Array.isArray(state.starPackCompletedBatchSizes)
    ? state.starPackCompletedBatchSizes
    : [];
  batch.statsBatchIndex = state.starPackCompletedBatchSizes.length;
  state.starPackCompletedBatchSizes.push(0);
  openNextStarPackResult();
}

function openNextStarPackResult() {
  const batch = state.starPackBatch;
  if (
    !isStarPackPool() ||
    !batch ||
    batch.status !== "opening" ||
    isAnyHitModalOpen()
  ) {
    return;
  }

  const category = getStarPackCategoryById(batch.categoryId);
  const progress = getStarPackBatchProgress(batch);

  while (batch.openedCount < batch.count) {
    const index = batch.openedCount;
    const sourcePackIndex =
      Math.max(1, Number(batch.startPackIndex) || 1) + index;
    let card;
    if (Math.random() < progress.coreRate) {
      card = createEmpoweredCard(randomFromArray(category?.players || []));
      batch.directCoreHits += 1;
      state.starPackCoreHits =
        Math.max(0, Number(state.starPackCoreHits) || 0) + 1;
      recordSingleDraw(card, "star-pack-core", {
        countTowardsTotal: false,
        sourcePulls: sourcePackIndex,
      });
    } else {
      card = {
        type: "star5",
        name: "五星普卡",
      };
      state.starPackOtherHits = Math.max(0, Number(state.starPackOtherHits) || 0) + 1;
      recordSingleDraw(card, "star-pack-five-star", {
        countTowardsTotal: false,
        sourcePulls: sourcePackIndex,
      });
    }
    batch.results.push(card);
    batch.openedCount += 1;
    state.starPackCompletedPacks =
      Math.max(0, Number(state.starPackCompletedPacks) || 0) + 1;
    unlockStarPackVieiraMilestoneIfNeeded();
    if (batch.statsBatchIndex != null) {
      state.starPackCompletedBatchSizes[batch.statsBatchIndex] = batch.openedCount;
    }

    renderAll();
    showFavoredHitAnimationIfNeeded();
    if (isAnyHitModalOpen()) return;
  }

  batch.status = "opened";
  renderAll();
}

function resumeStarPackBatchIfNeeded() {
  if (!isStarPackPool()) return;
  const batch = state.starPackBatch;
  if (!batch || batch.status !== "opening" || isAnyHitModalOpen()) return;
  openNextStarPackResult();
}

function revealStarPackTile(tileIndex) {
  if (!isStarPackPool()) return;
  const batch = state.starPackBatch;
  const index = Math.max(0, Math.min(STAR_PACK_MAX_TILES - 1, Number(tileIndex) || 0));
  if (
    !batch ||
    batch.status !== "tearing" ||
    batch.revealedTiles[index] ||
    batch.step >= batch.route.length
  ) {
    return;
  }

  const kind = batch.route[batch.step];
  const stars = (batch.luckyMatrix || []).reduce(
    (sum, row) => sum + (row?.[batch.step] ? 1 : 0),
    0
  );
  batch.revealedTiles[index] = { kind, stars, order: batch.step + 1 };
  batch.revealedKinds.push(kind);
  batch.step += 1;
  batch.starsGained += stars;
  state.starPackLuckyStars =
    Math.max(0, Number(state.starPackLuckyStars) || 0) + stars;

  if (getStarPackBatchProgress(batch).tearCount >= 2) {
    finishStarPackBatch();
    return;
  }
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function addStarPackHistoryCard(card, source) {
  recordSingleDraw(card, source, {
    countTowardsTotal: false,
    sourcePulls: state.totalPulls,
    excludeFromGoldStats: true,
  });
}

function grantStarPackSelectReward(sourceLabel, historyName, historySource) {
  const cfg = getStarPackConfig();
  state.pendingSelectRewardCount += 1;
  state.pendingSelectMilestones.push({
    pulls: state.totalPulls,
    sourceLabel,
    candidateNames: (cfg?.directPlayers || []).slice(),
  });
  addStarPackHistoryCard(
    { type: "star_pack_select", name: historyName },
    historySource
  );
}

function openStarPackVieiraChance(hitSource, missSource) {
  const cfg = getStarPackConfig();
  if (Math.random() < 0.1) {
    addStarPackHistoryCard(
      createEmpoweredCard(cfg?.vieiraName || "维埃拉"),
      hitSource
    );
  } else {
    state.starPackOtherHits =
      Math.max(0, Number(state.starPackOtherHits) || 0) + 1;
    addStarPackHistoryCard(
      { type: "star5", name: "五星普卡" },
      missSource
    );
  }
}

function openStarLuckyBox() {
  if (!isStarPackPool()) return;
  if (state.starPackChoiceBoxPending) return;
  const cfg = getStarPackConfig();
  const cost = Math.max(1, Number(cfg?.luckyBoxCost) || 15);
  const currentStars = Math.max(0, Number(state.starPackLuckyStars) || 0);
  if (currentStars < cost) return;

  state.starPackLuckyStars = currentStars - cost;
  const boxNumber = Math.max(0, Number(state.starPackLuckyBoxesOpened) || 0) + 1;
  state.starPackLuckyBoxesOpened = boxNumber;
  if (boxNumber === 8) {
    state.starPackChoiceBoxPending = true;
    renderAll();
    return;
  }

  const roll = Math.random();
  if (roll < 0.01) {
    grantStarPackSelectReward(
      "幸运宝箱 · 1%自选球星包",
      "1%自选球星包",
      "star-pack-lucky-select"
    );
  } else if (roll < 0.04) {
    addStarPackHistoryCard(
      createEmpoweredCard(randomFromArray(cfg?.directPlayers || [])),
      "star-pack-lucky-random"
    );
  } else if (roll < 0.1) {
    openStarPackVieiraChance(
      "star-pack-lucky-vieira",
      "star-pack-lucky-vieira-miss"
    );
  } else {
    addStarPackHistoryCard(
      { type: "star_pack_item", name: "幸运宝箱道具" },
      "star-pack-lucky-item"
    );
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function claimStarPackChoiceBox(choice) {
  if (!isStarPackPool() || !state.starPackChoiceBoxPending) return;
  const cfg = getStarPackConfig();
  state.starPackChoiceBoxPending = false;

  if (choice === "select") {
    grantStarPackSelectReward(
      "第8个幸运宝箱自选箱 · 自选球星包",
      "第8箱自选：自选球星包",
      "star-pack-choice-select"
    );
  } else if (choice === "random") {
    addStarPackHistoryCard(
      createEmpoweredCard(randomFromArray(cfg?.directPlayers || [])),
      "star-pack-choice-random"
    );
  } else if (choice === "vieira") {
    openStarPackVieiraChance(
      "star-pack-choice-vieira",
      "star-pack-choice-vieira-miss"
    );
  } else if (choice === "item") {
    addStarPackHistoryCard(
      { type: "star_pack_item", name: "自选箱道具" },
      "star-pack-choice-item"
    );
  } else {
    state.starPackChoiceBoxPending = true;
    return;
  }

  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function getBinomialProbability(n, k, probability) {
  if (k < 0 || k > n) return 0;
  let coefficient = 1;
  for (let index = 1; index <= k; index += 1) {
    coefficient = (coefficient * (n - index + 1)) / index;
  }
  return (
    coefficient *
    probability ** k *
    (1 - probability) ** (n - k)
  );
}

function getStarPackBatchHitDistribution(batchSize) {
  const size = Math.max(1, Math.floor(Number(batchSize) || 1));
  const distribution = new Array(size + 1).fill(0);
  STAR_PACK_ROUTE_METRICS.signingTierWeights.forEach((weight, tier) => {
    const rate = STAR_PACK_SIGNING_RATES[tier];
    for (let hits = 0; hits <= size; hits += 1) {
      distribution[hits] += weight * getBinomialProbability(size, hits, rate);
    }
  });
  return distribution;
}

function getStarPackCoreHitPercentile() {
  const batches = Array.isArray(state.starPackCompletedBatchSizes)
    ? state.starPackCompletedBatchSizes
    : [];
  if (!batches.length) return 0;
  let distribution = [1];
  batches.forEach((batchSize) => {
    const batchDistribution = getStarPackBatchHitDistribution(batchSize);
    const next = new Array(distribution.length + batchDistribution.length - 1).fill(0);
    distribution.forEach((leftProbability, leftHits) => {
      batchDistribution.forEach((rightProbability, rightHits) => {
        next[leftHits + rightHits] += leftProbability * rightProbability;
      });
    });
    distribution = next;
  });
  const observed = Math.max(0, Math.floor(Number(state.starPackCoreHits) || 0));
  return (
    distribution
      .slice(0, Math.min(distribution.length, observed))
      .reduce((sum, probability) => sum + probability, 0) * 100
  );
}

function rollGloryBoxPull(source = "glory-box") {
  if (!isGloryBoxPool()) return false;
  const price = getPoolPricePerPull();
  if (!spendGoldAmount(price)) {
    openInsufficientGoldModal();
    return false;
  }
  const completedPulls = Math.max(0, Number(state.totalPulls) || 0);
  const gained = rollGloryValueCount(completedPulls);
  state.totalPulls = completedPulls + 1;
  state.gloryValue = Math.max(0, Number(state.gloryValue) || 0) + gained;
  recordSingleDraw({ type: "glory_value", name: `荣耀值 +${gained}` }, source, {
    countTowardsTotal: false,
    sourcePulls: state.totalPulls,
  });
  unlockGloryMilestonesIfNeeded();
  return true;
}

function autoToTargetGloryValue(targetValue) {
  pendingFavoredHitEvent = null;
  const target = Math.max(0, Math.floor(Number(targetValue) || 0));
  if (!isGloryBoxPool() || target <= 0) return;
  let didDraw = false;
  const MAX_AUTO_DRAWS = 300000;
  for (let i = 0; i < MAX_AUTO_DRAWS; i += 1) {
    if ((Number(state.gloryValue) || 0) >= target) break;
    if (!rollGloryBoxPull("glory-auto-value")) break;
    didDraw = true;
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
  }
  if (didDraw) renderAll();
  showFavoredHitAnimationIfNeeded();
}

function consumeGloryValue(cost) {
  const current = Math.max(0, Number(state.gloryValue) || 0);
  if (current < cost) {
    window.alert(`荣耀值不足：需要 ${cost}，当前 ${current}`);
    return false;
  }
  state.gloryValue = current - cost;
  return true;
}

function exchangeGloryLahmDirect() {
  if (!isGloryBoxPool() || !consumeGloryValue(36)) return;
  const card = createEmpoweredCard(getGloryConfig()?.mainPrize || "拉姆");
  recordSingleDraw(card, "glory-exchange:36荣耀值兑换拉姆", { countTowardsTotal: false });
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

function exchangeGloryChancePack(kind) {
  if (!isGloryBoxPool()) return;
  const cfgMap = {
    lahm5: { cost: 2, max: 1, type: "glory_lahm_chance", chance: 0.05, label: "5%拉姆卡包" },
    highlight10: { cost: 3, max: 2, type: "glory_highlight_chance", chance: 0.1, label: "10%高光礼盒" },
    highlight30: { cost: 6, max: 2, type: "glory_highlight_chance", chance: 0.3, label: "30%高光礼盒" },
  };
  const cfg = cfgMap[kind];
  if (!cfg) return;
  state.gloryExchangeCounts = state.gloryExchangeCounts || {};
  const used = Math.max(0, Number(state.gloryExchangeCounts[kind]) || 0);
  if (used >= cfg.max) {
    window.alert(`${cfg.label} 已达到兑换上限`);
    return;
  }
  if (!consumeGloryValue(cfg.cost)) return;
  state.gloryExchangeCounts[kind] = used + 1;
  addGloryReward(cfg.type, state.totalPulls, cfg.label, {
    chance: cfg.chance,
    sourceLabel: `${cfg.cost}荣耀值兑换${cfg.label}`,
  });
  renderAll();
  maybeAutoOpenRewards();
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

function isRisingPoolComplete(pool = getCurrentPool(), stateObj = state) {
  const targets = getRisingTargetPlayers(pool);
  return targets.length > 0 && targets.every(
    (name) => Boolean(stateObj?.risingOwnedTargets?.[name])
  );
}

function rollRisingPull(source = "infinite-passion") {
  const pool = getCurrentPool();
  if (!isAccumulatedNonRepeatPool(pool)) return null;
  const targets = getRisingTargetPlayers(pool);
  const owned = state.risingOwnedTargets || (state.risingOwnedTargets = {});
  const remaining = targets.filter((name) => !owned[name]);
  if (!remaining.length) return null;
  const hitProbability = getCurrentRisingProbability(pool, state);
  const rollConfig = getCurrentRollPoolConfig();
  const hit = remaining.length > 0 && Math.random() < hitProbability;
  let card;

  if (hit) {
    const name = randomFromArray(remaining);
    owned[name] = true;
    state.risingHitInCurrentTen = true;
    card = createEmpoweredCard(name);
  } else {
    const config = rollConfig.filter((item) => item.type !== "empowered");
    const r = Math.random();
    let cumulative = hitProbability;
    card = null;
    for (const item of config) {
      cumulative += item.probability;
      if (r < cumulative) {
        card = { type: item.type, name: item.label };
        break;
      }
    }
    if (!card) card = { type: "star3", name: "三星普卡" };
  }

  const cap = Math.max(1, Number(getRisingProbabilityConfig(pool)?.guaranteePulls) || 191);
  state.risingPityProgress = Math.min(
    cap - 1,
    Math.max(0, Number(state.risingPityProgress) || 0) + 1
  );
  recordSingleDraw(card, source);
  if (state.totalPulls % 10 === 0) {
    if (state.risingHitInCurrentTen) {
      state.risingPityProgress = 0;
      // 命中后仅补齐当前十连；到概率重置点便结束本次批量操作。
      state.risingBatchRemaining = 0;
    }
    state.risingHitInCurrentTen = false;
  }
  if (isRisingPoolComplete(pool, state)) {
    state.risingBatchRemaining = 0;
    state.risingPityProgress = 0;
    state.risingHitInCurrentTen = false;
  }
  return card;
}

function continueRisingBatch() {
  if (!isAccumulatedNonRepeatPool()) return;
  let changed = false;
  while ((Number(state.risingBatchRemaining) || 0) > 0) {
    if (isRisingPoolComplete()) {
      state.risingBatchRemaining = 0;
      break;
    }
    if (!spendGoldForPulls(1)) {
      state.risingBatchRemaining = 0;
      break;
    }
    state.risingBatchRemaining -= 1;
    const card = rollRisingPull("无限热烈指定抽取");
    if (!card) {
      state.risingBatchRemaining = 0;
      break;
    }
    changed = true;
    if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
  }
  if (changed) renderAll();
  showFavoredHitAnimationIfNeeded();
  if ((Number(state.risingBatchRemaining) || 0) > 0 && !isAnyHitModalOpen()) {
    window.setTimeout(resumeRisingBatchIfNeeded, 0);
  }
  if ((Number(state.risingBatchRemaining) || 0) <= 0 && !isAnyHitModalOpen()) {
    maybeAutoOpenRewards();
  }
}

function startRisingBatch(count) {
  if (!isAccumulatedNonRepeatPool()) return;
  if (isRisingPoolComplete()) return;
  const total = Math.max(1, Math.floor(Number(count) || 0));
  if ((Number(state.risingBatchRemaining) || 0) > 0) return;
  if (!canAffordPulls(total)) {
    openInsufficientGoldModal();
    return;
  }
  state.risingBatchRemaining = total;
  pendingFavoredHitEvent = null;
  continueRisingBatch();
}

function resumeRisingBatchIfNeeded() {
  if (!isAccumulatedNonRepeatPool()) return;
  if ((Number(state.risingBatchRemaining) || 0) <= 0 || isAnyHitModalOpen()) return;
  continueRisingBatch();
}

function singlePull() {
  if (isAccumulatedNonRepeatPool()) {
    startRisingBatch(1);
    return;
  }
  if (isGloryBoxPool()) {
    pendingFavoredHitEvent = null;
    rollGloryBoxPull("glory-single");
    renderAll();
    showFavoredHitAnimationIfNeeded();
    return;
  }
  if (isShopPackagePool()) {
    pendingFavoredHitEvent = null;
    rollSpringShopPackage();
    return;
  }
  if (isDiscountLimitedPool()) return;
  pendingFavoredHitEvent = null;
  if (!spendGoldForPulls(1)) return;
  const card = rollBaseCard();
  recordSingleDraw(card, "single");
  renderAll();
  showFavoredHitAnimationIfNeeded();
}

// 十连抽：可选开启“至少 1 张五星及以上”保底（只对本次十连生效）
function tenPull() {
  if (isAccumulatedNonRepeatPool()) {
    startRisingBatch(10);
    return;
  }
  if (isGloryBoxPool()) {
    pendingFavoredHitEvent = null;
    let didDraw = false;
    for (let i = 0; i < 10; i += 1) {
      if (!rollGloryBoxPull("glory-ten")) break;
      didDraw = true;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    if (didDraw) renderAll();
    showFavoredHitAnimationIfNeeded();
    return;
  }
  if (isShopPackagePool()) return;
  if (isDiscountLimitedPool() && getRemainingPullSlots() < 10) return;
  pendingFavoredHitEvent = null;
  if (!spendGoldForPulls(10)) return;
  const batch = [];
  const batchEmpoweredNames = [];

  for (let i = 0; i < 10; i += 1) {
    const card = rollBaseCard(batchEmpoweredNames);
    batch.push(card);
    if (card.type === "empowered" && card.name) {
      batchEmpoweredNames.push(card.name);
    }
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
    if (!isDiscountLimitedPool() && (pendingFavoredHitEvent || isAnyHitModalOpen())) {
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

  if (isDiscountLimitedPool()) {
    const cap = getPoolPullCap();
    const cappedTarget = cap > 0 ? Math.min(target, cap) : target;
    const current = Math.max(0, Number(state.totalPulls) || 0);
    const need = cappedTarget - current;
    if (need <= 0) return;
    const batches = Math.floor(need / 10);
    for (let i = 0; i < batches; i += 1) {
      tenPull();
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    return;
  }

  if (isShopPackagePool()) {
    const cappedTarget = Math.max(0, Math.floor(Number(target) || 0));
    let didDraw = false;
    while ((Number(state.totalPulls) || 0) < cappedTarget) {
      rollSpringShopPackage();
      didDraw = true;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    if (didDraw) renderAll();
    return;
  }

  if (isAccumulatedNonRepeatPool()) {
    const pool = getCurrentPool();
    const rows = [
      { pulls: "基础机制", text: "目标球员与150名五星球员合计5%；4名目标球员平分5% ÷ 151，合计约0.03311%，初始单人约0.008278%" },
      { pulls: "十连内命中", text: "命中后按当前概率补齐至下一个10抽边界，补抽期间不再触发191抽保底，随后重置并停止本次批量抽取" },
      { pulls: "不重复", text: `伊涅斯塔 / 阿圭罗 / 罗梅罗 / 内马尔之间不重复，当前剩余球员平分增能概率` },
      { pulls: "概率路线", text: "0/30/60/90/120/150/160/170/180抽后依次为1/2/3/5/8/10/12/15/50倍" },
      { pulls: "第191抽", text: "单轮保底获得1名尚未拥有的指定目标球员；补齐当前十连后重置" },
      { pulls: "集齐4人", text: `额外获得${pool.completionReward}，只发放一次` },
      { pulls: "集齐后", text: "立即结束本池抽取，所有抽卡按钮停用" },
      { pulls: "前100抽", text: "8000金币购买100抽，并获得5%梅西经纪人包；未中为五星普卡" },
      { pulls: "101-500抽", text: `每18000金币购买200抽，并获得1个96+高光经纪人包；5%${pool.completionReward}，否则${pool.fallbackPlayer}，共购买两次` },
      { pulls: "500抽以后", text: "固定800金币/十连（80金币/抽）" },
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

  if (isGloryBoxPool()) {
    const cappedTarget = Math.max(0, Math.floor(Number(target) || 0));
    let didDraw = false;
    while ((Number(state.totalPulls) || 0) < cappedTarget) {
      if (!rollGloryBoxPull("glory-auto")) break;
      didDraw = true;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    if (didDraw) renderAll();
    showFavoredHitAnimationIfNeeded();
    return;
  }

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
  if (isAccumulatedNonRepeatPool()) {
    startRisingBatch(count);
    return;
  }
  if (isDiscountLimitedPool()) {
    const allowed = Math.min(count, getRemainingPullSlots());
    const batches = Math.floor(allowed / 10);
    for (let i = 0; i < batches; i += 1) {
      tenPull();
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    return;
  }
  if (isShopPackagePool()) {
    let didDraw = false;
    for (let i = 0; i < count; i += 1) {
      rollSpringShopPackage();
      didDraw = true;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    if (didDraw) renderAll();
    return;
  }
  if (isGloryBoxPool()) {
    let didDraw = false;
    for (let i = 0; i < count; i += 1) {
      if (!rollGloryBoxPull("glory-auto-count")) break;
      didDraw = true;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
    if (didDraw) renderAll();
    showFavoredHitAnimationIfNeeded();
    return;
  }
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
  if (isHallRoadPool()) {
    const pool = getCurrentPool();
    return (
      targetName === (pool.hallRoadLegend || "小罗") &&
      state.rewards.some((reward) => reward.type === "hall_legend")
    );
  }
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
  if (isGloryBoxPool()) return;
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

  if (isAccumulatedNonRepeatPool()) {
    const beforeCounts = {};
    missingTargets.forEach((name) => {
      beforeCounts[name] = Number(state.empoweredCounts[name]) || 0;
    });
    let didDraw = false;
    for (let i = 0; i < 800; i += 1) {
      if (!spendGoldForPulls(1)) break;
      rollRisingPull("无限热烈一键心仪");
      didDraw = true;
      if (missingTargets.some(
        (name) => (Number(state.empoweredCounts[name]) || 0) > beforeCounts[name]
      )) break;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
      if (state.rewards.some((reward) =>
        ["infinite_messi_chance", "infinite_guaranteed_pack", "infinite_completion_messi"].includes(reward.type)
      )) break;
    }
    if (didDraw) renderAll();
    showFavoredHitAnimationIfNeeded();
    return;
  }

  if (isShopPackagePool()) {
    const MAX_AUTO_DRAWS = 200000;
    for (let i = 0; i < MAX_AUTO_DRAWS; i += 1) {
      const beforeMissing = missingTargets.filter((name) => (state.empoweredCounts[name] || 0) <= 0);
      if (!beforeMissing.length) break;
      rollSpringShopPackage();
      const afterMissing = beforeMissing.filter((name) => (state.empoweredCounts[name] || 0) <= 0);
      if (afterMissing.length < beforeMissing.length) break;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
      if (hasSelectRewardAvailable()) break;
    }
    return;
  }

  if (isDiscountLimitedPool()) {
    const maxBatches = Math.floor(getRemainingPullSlots() / 10);
    for (let i = 0; i < maxBatches; i += 1) {
      const beforeMissing = missingTargets.filter((name) => (state.empoweredCounts[name] || 0) <= 0);
      if (!beforeMissing.length) break;
      tenPull();
      const afterMissing = beforeMissing.filter((name) => (state.empoweredCounts[name] || 0) <= 0);
      if (afterMissing.length < beforeMissing.length) break;
      if (pendingFavoredHitEvent || isAnyHitModalOpen()) break;
    }
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
  const prevOwnedMap = getOwnedEmpoweredMap(state, getCurrentPool());
  stateByModeAndPool[activeModeKey][activePoolKey] = createInitialState(
    getCurrentPool().empoweredCards
  );
  state = stateByModeAndPool[activeModeKey][activePoolKey];
  state.resetCount = prevResetCount + 1;
  state.ownedEmpoweredNames = { ...state.ownedEmpoweredNames, ...prevOwnedMap };
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
  const starPackLuckySourceLabels = {
    "star-pack-lucky-select": "幸运宝箱 · 1%自选球星包",
    "star-pack-lucky-random": "幸运宝箱 · 3%随机增能包",
    "star-pack-lucky-vieira": "幸运宝箱 · 6%含10%维埃拉包",
    "star-pack-lucky-vieira-miss": "幸运宝箱 · 6%含10%维埃拉包",
    "star-pack-lucky-item": "幸运宝箱 · 90%道具包",
    "star-pack-choice-select": "第8个幸运宝箱自选箱 · 自选球星包",
    "star-pack-choice-random": "第8个幸运宝箱自选箱 · 随机增能包",
    "star-pack-choice-vieira": "第8个幸运宝箱自选箱 · 10%维埃拉包",
    "star-pack-choice-vieira-miss": "第8个幸运宝箱自选箱 · 10%维埃拉包",
    "star-pack-choice-item": "第8个幸运宝箱自选箱 · 道具包",
    "star-pack-guarantee-100": "保底100个球星包",
  };
  if (starPackLuckySourceLabels[entry.source]) {
    return starPackLuckySourceLabels[entry.source];
  }
  if (entry.source === "highlight-ticket" && entry.ticketPullIndex != null) {
    return `第 ${entry.ticketPullIndex} 张高光券`;
  }
  if (entry.source === "spring-shop" && entry.sourcePulls != null) {
    return `第 ${entry.sourcePulls} 抽春日礼包`;
  }
  if (typeof entry.source === "string" && entry.source.startsWith("glory-") && entry.sourcePulls != null) {
    return `第 ${entry.sourcePulls} 抽荣耀礼盒`;
  }
  if (typeof entry.source === "string" && entry.source.startsWith("star-pack") && entry.sourcePulls != null) {
    return `累计第 ${entry.sourcePulls} 个球星卡包`;
  }

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

function isShopPackagePool(pool = getCurrentPool()) {
  return pool.progressionType === "shop_package";
}

function isGloryBoxPool(pool = getCurrentPool()) {
  return (pool || getCurrentPool()).progressionType === "glory_box";
}

function isStarPackPool(pool = getCurrentPool()) {
  return (pool || getCurrentPool()).progressionType === "star_pack";
}

function isHallRoadPool(pool = getCurrentPool()) {
  return (pool || getCurrentPool()).progressionType === "hall_road";
}

function isHighlightTicketPool(pool = getCurrentPool()) {
  return Boolean(pool && pool.highlightTicketConfig);
}

function getHighlightTicketConfig(pool = getCurrentPool()) {
  return isHighlightTicketPool(pool) ? pool.highlightTicketConfig || null : null;
}

function getHighlightTicketDescription(pool = getCurrentPool()) {
  const cfg = getHighlightTicketConfig(pool);
  return cfg?.description || "高光券：10% 概率获得增能卡";
}

function getShopPackageConfig(pool = getCurrentPool()) {
  if (!isShopPackagePool(pool)) return null;
  return pool;
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
  if (isHallRoadPool(pool)) return getHallRoadStatNames(pool);
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

function getExchangeConfig(pool = getCurrentPool()) {
  return (
    pool.exchangeConfig || {
      specificPlayers: pool.exchangeSpecificPlayers || [],
      fixedSelect42: null,
      select47Players: null,
      hasSkin52: false,
    }
  );
}

function isNonRepeatExchangePool(pool = getCurrentPool()) {
  return (
    pool.progressionType === "exchange_badge" &&
    Boolean(pool.exchangeNoRepeatUntilComplete)
  );
}

function isNonRepeatEmpoweredPool(pool = getCurrentPool()) {
  return isNonRepeatExchangePool(pool) || Boolean(pool.nonRepeatEmpowered);
}

function getOwnedEmpoweredMap(stateObj = state, pool = getCurrentPool()) {
  const names = pool.empoweredCards || [];
  const base = stateObj?.ownedEmpoweredNames || {};
  const map = {};
  names.forEach((name) => {
    map[name] = Boolean(base[name]);
  });
  return map;
}

function getPresetOwnedNames(stateObj = state, pool = getCurrentPool()) {
  const ownedMap = getOwnedEmpoweredMap(stateObj, pool);
  return (pool.empoweredCards || []).filter((name) => ownedMap[name]);
}

function getPresetOwnedKey(pool = getCurrentPool(), stateObj = state) {
  if (!isNonRepeatExchangePool(pool)) return "";
  return getPresetOwnedNames(stateObj, pool).join("|");
}

function getProbabilityVariantKey(pool = getCurrentPool(), stateObj = state) {
  if (!isNonRepeatEmpoweredPool(pool)) return activePoolKey;
  return `${activePoolKey}|owned:${getPresetOwnedKey(pool, stateObj)}`;
}

function getCurrentOwnedEmpoweredNames(pool = getCurrentPool(), stateObj = state) {
  const owned = new Set(getPresetOwnedNames(stateObj, pool));
  (pool.empoweredCards || []).forEach((name) => {
    if ((Number(stateObj?.empoweredCounts?.[name]) || 0) > 0) owned.add(name);
  });
  return owned;
}

function getCurrentAvailableEmpoweredNames(pool = getCurrentPool(), stateObj = state) {
  const names = (pool.empoweredCards || []).slice();
  if (!isNonRepeatEmpoweredPool(pool)) return names;
  const owned = getCurrentOwnedEmpoweredNames(pool, stateObj);
  if (owned.size >= names.length) return names;
  return names.filter((name) => !owned.has(name));
}

function getPresetOwnedMask(pool = getCurrentPool(), stateObj = state) {
  let mask = 0;
  const ownedMap = getOwnedEmpoweredMap(stateObj, pool);
  (pool.empoweredCards || []).forEach((name, idx) => {
    if (ownedMap[name]) mask |= 1 << idx;
  });
  return mask;
}

function bitCount(value) {
  let v = Number(value) || 0;
  let count = 0;
  while (v) {
    v &= v - 1;
    count += 1;
  }
  return count;
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
      const rewardCandidates =
        Array.isArray(reward.candidateNames) && reward.candidateNames.length > 0
          ? reward.candidateNames
          : reward.targetName
          ? [reward.targetName]
          : [];
      const card = isHit
        ? createEmpoweredCard(randomFromArray(rewardCandidates))
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
    case "shop_scholar_pack": {
      const card = rollShopScholarPackCard(reward);
      if (card) {
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
      }
      break;
    }
    case "hall_legend": {
      const legendName = getCurrentPool().hallRoadLegend || "小罗";
      const card = createEmpoweredCard(legendName);
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "free_ten": {
      for (let i = 0; i < 10; i += 1) {
        const card = rollBaseCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
      }
      break;
    }
    case "glory_highlight_box": {
      const card = rollGloryHighlightBoxCard(reward);
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "glory_dream_box": {
      const card = openGloryDreamBoxCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "glory_lahm_chance": {
      const card = Math.random() < (reward.chance || 0.05)
        ? createEmpoweredCard(getGloryConfig()?.mainPrize || "拉姆")
        : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "glory_highlight_chance": {
      const card = Math.random() < (reward.chance || 0)
        ? rollGloryHighlightBoxCard({ chance: 0.15 })
        : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
      });
      break;
    }
    case "infinite_messi_chance": {
      const card = Math.random() < (reward.chance || 0.05)
        ? createEmpoweredCard(getCurrentPool().completionReward || "梅西")
        : createFiveStarCard();
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
        excludeFromGoldStats: true,
      });
      break;
    }
    case "infinite_guaranteed_pack": {
      const card = Math.random() < (reward.chance || 0.05)
        ? createEmpoweredCard(getCurrentPool().completionReward || "梅西")
        : createEmpoweredCard(getCurrentPool().fallbackPlayer || "巴蒂斯图塔");
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
        excludeFromGoldStats: true,
      });
      break;
    }
    case "infinite_completion_messi": {
      const card = createEmpoweredCard(reward.fixedName || getCurrentPool().completionReward || "梅西");
      recordSingleDraw(card, toRewardSourceText(reward), {
        countTowardsTotal: false,
        milestonePulls: reward.pulls,
        excludeFromGoldStats: true,
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
        const rewardCandidates =
          Array.isArray(reward.candidateNames) && reward.candidateNames.length > 0
            ? reward.candidateNames
            : reward.targetName
            ? [reward.targetName]
            : [];
        const card = isHit
          ? createEmpoweredCard(randomFromArray(rewardCandidates))
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
      case "shop_scholar_pack": {
        const card = rollShopScholarPackCard(reward);
        if (card) {
          recordSingleDraw(card, toRewardSourceText(reward), {
            countTowardsTotal: false,
            milestonePulls: reward.pulls,
          });
        }
        break;
      }
      case "hall_legend": {
        const legendName = getCurrentPool().hallRoadLegend || "小罗";
        const card = createEmpoweredCard(legendName);
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "free_ten": {
        for (let i = 0; i < 10; i += 1) {
          const card = rollBaseCard();
          recordSingleDraw(card, toRewardSourceText(reward), {
            countTowardsTotal: false,
            milestonePulls: reward.pulls,
          });
        }
        break;
      }
      case "glory_highlight_box": {
        const card = rollGloryHighlightBoxCard(reward);
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "glory_dream_box": {
        const card = openGloryDreamBoxCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "glory_lahm_chance": {
        const card = Math.random() < (reward.chance || 0.05)
          ? createEmpoweredCard(getGloryConfig()?.mainPrize || "拉姆")
          : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "glory_highlight_chance": {
        const card = Math.random() < (reward.chance || 0)
          ? rollGloryHighlightBoxCard({ chance: 0.15 })
          : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
        });
        break;
      }
      case "infinite_messi_chance": {
        const card = Math.random() < (reward.chance || 0.05)
          ? createEmpoweredCard(getCurrentPool().completionReward || "梅西")
          : createFiveStarCard();
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
          excludeFromGoldStats: true,
        });
        break;
      }
      case "infinite_guaranteed_pack": {
        const card = Math.random() < (reward.chance || 0.05)
          ? createEmpoweredCard(getCurrentPool().completionReward || "梅西")
          : createEmpoweredCard(getCurrentPool().fallbackPlayer || "巴蒂斯图塔");
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
          excludeFromGoldStats: true,
        });
        break;
      }
      case "infinite_completion_messi": {
        const card = createEmpoweredCard(
          reward.fixedName || getCurrentPool().completionReward || "梅西"
        );
        recordSingleDraw(card, toRewardSourceText(reward), {
          countTowardsTotal: false,
          milestonePulls: reward.pulls,
          excludeFromGoldStats: true,
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
    excludeFromGoldStats: Boolean(
      sourceLabel && sourceLabel.includes("幸运宝箱")
    ),
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
    if (isStarPackPool()) {
      const pool = getCurrentPool();
      const cfg = getStarPackConfig(pool);
      probabilitySectionTitle.textContent = "球星卡包概率";
      empoweredNamesTitle.textContent = "球员类别与卡包：";
      colName.textContent = "项目";
      colValue.textContent = "概率";
      [
        { label: "单格：球员潜力提升", probability: STAR_PACK_TEAR_PROBABILITIES.potential },
        { label: "单格：签约概率提升", probability: STAR_PACK_TEAR_PROBABILITIES.signing },
        { label: "单格：撕开卡包", probability: STAR_PACK_TEAR_PROBABILITIES.tear },
        ...STAR_PACK_SIGNING_RATES.map((rate, tier) => ({
          label: `最终签约爆率为${formatPercent(rate)}的路线占比`,
          probability: STAR_PACK_ROUTE_METRICS.signingTierWeights[tier],
          displayProbability: `${(
            STAR_PACK_ROUTE_METRICS.signingTierWeights[tier] * 100
          ).toFixed(2)}%`,
        })),
        {
          label: "单个卡包平均出核心概率（路线加权）",
          probability: STAR_PACK_ROUTE_METRICS.expectedCoreRate,
          displayProbability: `${(
            STAR_PACK_ROUTE_METRICS.expectedCoreRate * 100
          ).toFixed(2)}%`,
        },
        {
          label: "单个卡包平均出五星普卡概率",
          probability: 1 - STAR_PACK_ROUTE_METRICS.expectedCoreRate,
          displayProbability: `${(
            (1 - STAR_PACK_ROUTE_METRICS.expectedCoreRate) * 100
          ).toFixed(2)}%`,
        },
        {
          label: "翻格获得幸运星综合概率（含保底）",
          probability: STAR_PACK_LUCKY_STAR_RATE,
        },
        { label: "史诗高光包", probability: 1 / 3, displayProbability: "33.33%" },
        { label: "梦幻精选包", probability: 1 / 3, displayProbability: "33.33%" },
        { label: "史诗+ST混合包", probability: 1 / 3, displayProbability: "33.33%" },
        { label: "普通幸运宝箱：自选球星", probability: 0.01 },
        { label: "普通幸运宝箱：随机增能", probability: 0.03 },
        { label: "普通幸运宝箱：10%维埃拉卡包", probability: 0.06 },
        { label: "普通幸运宝箱：实际获得维埃拉", probability: 0.006 },
        { label: "普通幸运宝箱：其他道具", probability: 0.9 },
      ].forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent =
          item.displayProbability || formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent =
        "史诗高光（7人）：里贝里 / 鲁尼 / 贝克汉姆 / 马克莱莱 / 佩蒂特 / 欧文 / 维埃拉" +
        "（维埃拉仅来自幸运宝箱10%维埃拉包或100包保底领取）；" +
        "梦幻精选（6人）：登贝莱 / 姆巴佩 / 凯恩 / 孔德 / 格列兹曼 / 坎特；" +
        "史诗高光包、梦幻精选包、史诗+ST混合包各占33.33%。";
    } else if (isAccumulatedNonRepeatPool()) {
      const pool = getCurrentPool();
      const currentConfig = getCurrentRollPoolConfig();
      const owned = new Set(getRisingOwnedTargetNames());
      const remainingTargetCount = Math.max(0, getRisingTargetPlayers(pool).length - owned.size);
      const currentRate = getCurrentRisingProbability(pool, state);
      probabilitySectionTitle.textContent = "当前递增不重复概率";
      empoweredNamesTitle.textContent = "指定目标球员（剩余球员概率平分）：";
      colName.textContent = "项目";
      colValue.textContent = "概率";
      currentConfig.forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.type === "empowered"
          ? `当前目标球员合计（剩余${remainingTargetCount}名）`
          : item.label;
        tdProb.textContent = item.type === "empowered" && currentRate >= 1
          ? "100%（本抽保底）"
          : item.type === "empowered"
          ? formatRisingPercent(item.probability)
          : item.type === "star5"
          ? `${(item.probability * 100).toFixed(4).replace(/\.?0+$/, "")}%`
          : formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      (getRisingProbabilityConfig(pool)?.boosts || []).forEach((boost) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = boost.pulls === 0 ? "初始总爆率" : `连续${boost.pulls}抽未中后总爆率`;
        const baseRate = getBaseEmpoweredProbability(pool.poolConfig || []);
        tdProb.textContent = `${formatRisingPercent(baseRate * boost.multiplier)}（${boost.multiplier}倍）`;
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent =
        getRisingTargetPlayers(pool)
          .map((name) => owned.has(name) ? `${name}（已获得）` : name)
          .join(" / ") +
        `；集齐赠送${pool.completionReward}；礼包配菜${pool.fallbackPlayer}`;
    } else if (isChainPool()) {
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
    } else if (isShopPackagePool()) {
      const pool = getCurrentPool();
      probabilitySectionTitle.textContent = "商城礼包概率";
      empoweredNamesTitle.textContent = "增能卡名单：";
      colName.textContent = "礼包内容";
      colValue.textContent = "概率";
      (pool.poolConfig || []).forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent = formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      (pool.scholarPackConfig || []).forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = `学霸礼包：${item.label}`;
        tdProb.textContent = formatPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent = `主菜：瓦拉内 / 春日礼包10人：${(pool.springPackagePlayers || []).join(" / ")}`;
    } else if (isGloryBoxPool()) {
      const pool = getCurrentPool();
      const cfg = getGloryConfig(pool);
      const completedPulls = Math.max(0, Number(state.totalPulls) || 0);
      probabilitySectionTitle.textContent = "荣耀礼盒概率";
      empoweredNamesTitle.textContent = "荣耀礼盒球员：";
      colName.textContent = "项目";
      colValue.textContent = "概率";
      [
        { label: "当前荣耀值单次爆率", probability: getGloryValueProbability(completedPulls) },
        { label: "荣耀高光礼盒：克洛泽", probability: 0.15 },
        { label: "荣耀高光礼盒：巴蒂斯图塔", probability: 0.85 },
        { label: "5%拉姆卡包：拉姆", probability: 0.05 },
        { label: "10%高光礼盒", probability: 0.1 },
        { label: "30%高光礼盒", probability: 0.3 },
      ].forEach((item) => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdProb = document.createElement("td");
        tdName.textContent = item.label;
        tdProb.textContent = formatGloryPercent(item.probability);
        tr.appendChild(tdName);
        tr.appendChild(tdProb);
        tbody.appendChild(tr);
      });
      namesSpan.textContent =
        `大奖：${cfg?.mainPrize || "拉姆"} / 高光礼盒：${cfg?.highlightTarget || "克洛泽"}、${cfg?.highlightFallback || "巴蒂斯图塔"} / ` +
        `箱式：${(cfg?.dreamBoxPlayers || []).join(" / ")}`;
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
      if (isHighlightTicketPool()) {
        const ticketCfg = getHighlightTicketConfig();
        const extraRows = [
          { label: "高光券增能卡", probability: clamp01(Number(ticketCfg?.probability) || 0) },
          {
            label: "高光券五星普卡",
            probability: clamp01(1 - clamp01(Number(ticketCfg?.probability) || 0)),
          },
        ];
        extraRows.forEach((item) => {
          const tr = document.createElement("tr");
          const tdName = document.createElement("td");
          const tdProb = document.createElement("td");
          tdName.textContent = item.label;
          tdProb.textContent = formatPercent(item.probability);
          tr.appendChild(tdName);
          tr.appendChild(tdProb);
          tbody.appendChild(tr);
        });
      }
      const bonusGiftCfg = isExchangePool() ? getExchangeBonusGiftConfig() : null;
      if (bonusGiftCfg) {
        [
          { label: "10%随机史诗包：史诗球员", probability: bonusGiftCfg.chance },
          {
            label: "10%随机史诗包：五星普卡",
            probability: clamp01(1 - bonusGiftCfg.chance),
          },
        ].forEach((item) => {
          const tr = document.createElement("tr");
          const tdName = document.createElement("td");
          const tdProb = document.createElement("td");
          tdName.textContent = item.label;
          tdProb.textContent = formatPercent(item.probability);
          tr.appendChild(tdName);
          tr.appendChild(tdProb);
          tbody.appendChild(tr);
        });
      }
      if (isNonRepeatEmpoweredPool()) {
        const ownedNames = getCurrentOwnedEmpoweredNames();
        namesSpan.textContent = empoweredCards
          .map((name) => (ownedNames.has(name) ? `${name}（已拥有）` : name))
          .join(" / ");
      } else {
        namesSpan.textContent = empoweredCards.join(" / ");
      }
    }
  }

  // 填充自选下拉框
  const select = document.getElementById("selectRewardChoice");
  const favSelect = document.getElementById("favEmpoweredChoice");
  const chainFavSelect = document.getElementById("chainFavEmpoweredChoice");
  const ownedSelect = document.getElementById("ownedEmpoweredChoice");
  const ownedRow = document.getElementById("ownedEmpoweredRow");
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
    const hallFavCandidates = isHallRoadPool() ? getHallRoadFeaturedNames() : null;
    const displayCards = hallFavCandidates || empoweredCards;
    displayCards.forEach((name) => {
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

  if (ownedRow && ownedSelect) {
    if (isNonRepeatExchangePool()) {
      const currentValues = Array.from(ownedSelect.selectedOptions || []).map((o) => o.value);
      const ownedMap = getOwnedEmpoweredMap();
      ownedRow.classList.remove("hidden");
      ownedSelect.innerHTML = "";
      empoweredCards.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (currentValues.includes(name) || ownedMap[name]) {
          opt.selected = true;
        }
        ownedSelect.appendChild(opt);
      });
      renderFavTagSelector("ownedEmpoweredChoice", "ownedEmpoweredTags");
      updateFavSelectAllButton("ownedEmpoweredChoice", "btnOwnedSelectAll");
    } else {
      ownedRow.classList.add("hidden");
      ownedSelect.innerHTML = "";
      const ownedTags = document.getElementById("ownedEmpoweredTags");
      if (ownedTags) ownedTags.innerHTML = "";
      const btnOwnedSelectAll = document.getElementById("btnOwnedSelectAll");
      if (btnOwnedSelectAll) btnOwnedSelectAll.textContent = "一键全选";
    }
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
  const goldCost = getGoldCostForCurrentState();
  const diamondCost = Math.floor(goldCost * 0.9);
  const statBadgeItem = document.getElementById("statBadgeItem");
  const statEmpoweredLabel = document.getElementById("statEmpoweredLabel");
  const statSelectedItem = document.getElementById("statSelectedItem");
  const statNormalLabel = document.getElementById("statNormalLabel");
  const empoweredStatsTitle = document.getElementById("empoweredStatsTitle");
  const statEmpoweredEl = document.getElementById("statEmpowered");
  const returnedGoldCostItem = document.getElementById("returnedGoldCostItem");
  const returnedGoldValue = document.getElementById("returnedGoldValue");

  const ids = {
    statTotalPulls: totalPulls,
    statBadges: state.badges,
    statSelected: state.stats.selected,
    statNormal: isStarPackPool()
      ? Math.max(0, Number(state.starPackOtherHits) || 0)
      : (state.stats.star5 || 0) + (state.stats.star4 || 0) + (state.stats.star3 || 0),
    costGold: goldCost,
    costDiamond: diamondCost,
  };
  Object.entries(ids).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  });

  if (statEmpoweredLabel) {
    statEmpoweredLabel.textContent = isStarPackPool() ? "球星卡" : "增能卡";
  }
  if (statSelectedItem) {
    statSelectedItem.classList.toggle("hidden", isStarPackPool());
  }
  if (statNormalLabel) {
    statNormalLabel.textContent = isStarPackPool() ? "五星普卡" : "普卡";
  }
  if (empoweredStatsTitle) {
    empoweredStatsTitle.textContent = isStarPackPool() ? "球星卡明细" : "增能卡明细";
  }

  if (statEmpoweredEl) {
    const empoweredCount = Math.max(0, Math.floor(Number(state.stats.empowered) || 0));
    if (isStarPackPool()) {
      const directCoreHits = Math.max(
        0,
        Math.floor(Number(state.starPackCoreHits) || 0)
      );
      const percentile = getStarPackCoreHitPercentile();
      const extraHits = Math.max(0, empoweredCount - directCoreHits);
      const avgGoldPerCore =
        directCoreHits > 0 ? Math.floor(goldCost / directCoreHits) : "-";
      statEmpoweredEl.innerHTML =
        `<span class="stat-main">${empoweredCount}</span>` +
        `<span class="stat-exceed-note">卡包核心 ${directCoreHits} 张，宝箱/赠礼 ${extraHits} 张；` +
        `平均 <span class="expected-value">${avgGoldPerCore}</span> 金币/卡包核心，` +
        `超过 <span class="expected-value">${percentile.toFixed(2)}%</span> 的同批次玩家</span>`;
    } else {
    const goldEmpoweredCount = Math.max(0, Math.floor(Number(getGoldStats().empowered) || 0));
    const progressCount = isChainPool()
      ? Math.max(0, Math.floor(Number(state.chainTierProgress) || 0))
      : Math.max(0, Math.floor(Number(state.totalPulls) || 0));
    const exceedPercent = getExceedPercentForEmpoweredCountByProgress(
      progressCount,
      goldEmpoweredCount
    );
    const avgGoldPerEmpowered =
      goldEmpoweredCount > 0 ? Math.floor(goldCost / goldEmpoweredCount) : "-";
    statEmpoweredEl.innerHTML =
      `<span class="stat-main">${empoweredCount}</span>` +
      `<span class="stat-exceed-note">平均 <span class="expected-value">${avgGoldPerEmpowered}</span> 金币/增能卡，` +
      `超过 <span class="expected-value">${exceedPercent.toFixed(2)}%</span> 的玩家（仅金币抽）</span>`;
    }
  }

  if (statBadgeItem) {
    if (isExchangePool()) {
      statBadgeItem.classList.remove("hidden");
    } else {
      statBadgeItem.classList.add("hidden");
    }
  }
  if (returnedGoldCostItem && returnedGoldValue) {
    if (isShopPackagePool()) {
      returnedGoldCostItem.classList.remove("hidden");
      returnedGoldValue.textContent = String(Math.max(0, Number(state.shopReturnedGold) || 0));
    } else {
      returnedGoldCostItem.classList.add("hidden");
      returnedGoldValue.textContent = "0";
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
  const presetOwnedNames = getCurrentOwnedEmpoweredNames();
  const goldCounts = getGoldEmpoweredCounts();
  const goldDetails = getGoldEmpoweredDetails();
  getEmpoweredStatNames().forEach((name) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdCount = document.createElement("td");
    const count = state.empoweredCounts[name] || 0;
    const goldCount = goldCounts[name] || 0;
    tdName.textContent = name;
    if (favoredNames.has(name)) {
      if (goldCount > 0) {
        const firstHit = (goldDetails[name] || [])[0] || null;
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
        )}%</span> 的玩家（仅金币抽）</span>`;
      } else if (count > 0) {
        tdCount.innerHTML = `${count} <span class="stat-exceed-note-inline">${
          isAccumulatedNonRepeatPool() ? "赠礼获得" : "高光券获得"
        }</span>`;
      } else if (presetOwnedNames.has(name)) {
        tdCount.innerHTML = `${count} <span class="stat-exceed-note-inline">已拥有</span>`;
      } else {
        tdCount.innerHTML = `${count} <span class="stat-exceed-note-inline">未获得</span>`;
      }
    } else {
      tdCount.textContent = presetOwnedNames.has(name) && count <= 0 ? `${count}（已拥有）` : String(count);
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
  if (isStarPackPool()) {
    const completed = Math.max(0, Number(state.starPackCompletedPacks) || 0);
    if (completed <= 0) {
      el.textContent = "当前批次尚未撕开";
      return;
    }
    const coreHits = Math.max(0, Number(state.starPackCoreHits) || 0);
    const exceedPercent = getStarPackCoreHitPercentile();
    const grade = getLuckGradeByExceedPercent(exceedPercent);
    const expected = completed * STAR_PACK_ROUTE_METRICS.expectedCoreRate;
    el.textContent =
      `${grade}｜${completed} 包开出 ${coreHits} 名核心球员，` +
      `期望 ${expected.toFixed(2)} 名，超过 ${exceedPercent.toFixed(2)}% 的同批次玩家`;
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

  if (isStarPackPool()) {
    const completed = Math.max(0, Number(state.starPackCompletedPacks) || 0);
    const target = Math.max(
      1,
      Number(getStarPackConfig()?.vieiraMilestonePacks) || 100
    );
    if (state.starPackVieiraMilestoneGranted) {
      textEl.textContent = "100 包保底维埃拉已领取。";
      fillEl.style.width = "100%";
    } else if (state.starPackVieiraGuaranteeClaimable || completed >= target) {
      textEl.textContent = "已开完100个球星包，请在抽卡区领取保底维埃拉。";
      fillEl.style.width = "100%";
    } else {
      textEl.textContent =
        `距离保底维埃拉还差 ${target - completed} 个已开卡包；` +
        `当前幸运星 ${state.starPackLuckyStars || 0} / 15`;
      fillEl.style.width = `${Math.max(
        0,
        Math.min(100, (completed / target) * 100)
      )}%`;
    }
    return;
  }

  if (isAccumulatedNonRepeatPool()) {
    const pool = getCurrentPool();
    const targets = getRisingTargetPlayers(pool);
    const ownedCount = getRisingOwnedTargetNames().length;
    const progress = Math.max(0, Number(state.risingPityProgress) || 0);
    const cap = Math.max(1, Number(getRisingProbabilityConfig(pool)?.guaranteePulls) || 191);
    if (ownedCount >= targets.length) {
      textEl.textContent = `4名指定目标已集齐，${pool.completionReward}赠礼已解锁。`;
      fillEl.style.width = "100%";
    } else if (state.risingHitInCurrentTen) {
      const pullsToBoundary = Math.max(0, 10 - (Math.max(0, Number(state.totalPulls) || 0) % 10));
      textEl.textContent =
        `本十连已经命中；再补 ${pullsToBoundary} 抽后重置并停止，补抽不再触发191抽保底。`;
      fillEl.style.width = `${Math.min(100, progress / cap * 100)}%`;
    } else {
      const remain = Math.max(1, cap - progress);
      textEl.textContent =
        `已获得 ${ownedCount}/4；当前爆率 ${formatRisingPercent(getCurrentRisingProbability(pool, state))}；` +
        `最迟再抽 ${remain} 次获得下一名不重复目标球员。`;
      fillEl.style.width = `${Math.min(100, progress / cap * 100)}%`;
    }
    return;
  }

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

  if (isShopPackagePool()) {
    const total = Math.max(0, Number(state.totalPulls) || 0);
    const marks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120];
    const next = marks.find((m) => m > total);
    if (!next) {
      textEl.textContent = "120个春日礼包节点已完成。";
      fillEl.style.width = "100%";
      return;
    }
    const prev = marks.filter((m) => m <= total).slice(-1)[0] || 0;
    const need = next - total;
    const percent = Math.max(0, Math.min(100, ((total - prev) / Math.max(1, next - prev)) * 100));
    textEl.textContent = `距离 ${next} 个春日礼包节点还差 ${need} 个`;
    fillEl.style.width = `${percent}%`;
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

  if (isDiscountLimitedPool()) {
    const cap = getPoolPullCap();
    const total = Math.max(0, Number(state.totalPulls) || 0);
    const freeCfg = getCurrentPool().bonusFreePullConfig || null;
    if (freeCfg) {
      const paidPulls = Math.max(0, Math.floor(Number(freeCfg.paidPulls) || 0));
      const freePulls = Math.max(0, Math.floor(Number(freeCfg.freePulls) || 0));
      const cycle = paidPulls + freePulls;
      const cycleIndex = cycle > 0 ? total % cycle : 0;
      const nextTenCost = getPullCostForRange(total, 10);
      textEl.textContent =
        cycle > 0
          ? `买${paidPulls}送${freePulls}：本轮第 ${cycleIndex + 1}/${cycle} 抽，下一次十连 ${nextTenCost} 金币`
          : `下一次十连 ${nextTenCost} 金币`;
      fillEl.style.width = cycle > 0 ? `${Math.max(0, Math.min(100, (cycleIndex / cycle) * 100))}%` : "0%";
      return;
    }
    if (cap <= 0) {
      const discountLimit = Math.max(0, Number(getCurrentPool().discountPullLimit) || 0);
      const remainingDiscount = Math.max(0, discountLimit - total);
      textEl.textContent = remainingDiscount > 0
        ? `前 ${discountLimit} 抽享 7 折，剩余折扣抽数 ${remainingDiscount} 抽`
        : "折扣抽数已用完，后续按原价十连。";
      fillEl.style.width = discountLimit > 0
        ? `${Math.max(0, Math.min(100, (total / discountLimit) * 100))}%`
        : "0%";
      return;
    }
    const remain = Math.max(0, cap - total);
    const percent = cap > 0 ? Math.max(0, Math.min(100, (total / cap) * 100)) : 0;
    if (remain <= 0) {
      textEl.textContent = `本轮 ${cap} 抽已完成，重置后可继续抽。`;
      fillEl.style.width = "100%";
      return;
    }
    textEl.textContent = `本轮剩余 ${remain} 抽（仅支持十连，10抽=${getPullCostForRange(total, 10)}金币）`;
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
      case "star_pack_other":
        tag.textContent = "其他";
        break;
      case "star_pack_select":
        tag.textContent = "自选";
        break;
      case "star_pack_item":
        tag.textContent = "道具";
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
  const btnGloryExchangeLahm36 = document.getElementById("btnGloryExchangeLahm36");
  const btnGloryExchangeLahm5 = document.getElementById("btnGloryExchangeLahm5");
  const btnGloryExchangeHighlight10 = document.getElementById("btnGloryExchangeHighlight10");
  const btnGloryExchangeHighlight30 = document.getElementById("btnGloryExchangeHighlight30");

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
    : isShopPackagePool()
    ? "待开启学霸礼包 / 自选包"
    : isGloryBoxPool()
    ? "待开启荣耀礼盒奖励"
    : isStarPackPool()
    ? "幸运宝箱自选奖励"
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
        : isShopPackagePool()
        ? reward.type === "shop_scholar_pack"
          ? "学霸礼包"
          : "商城奖励"
        : isChainPool()
        ? `第${reward.tier || "?"}档奖励`
        : `${reward.pulls} 抽奖励`;
      const typeSpan = document.createElement("span");
      typeSpan.className = "reward-type";

      let typeText = reward.label || "";
      if (!typeText) {
        typeText = reward.type;
      }
      if (isShopPackagePool() && reward.type === "shop_scholar_pack" && reward.sourceLabel) {
        typeText = `${typeText}（${reward.sourceLabel}）`;
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

function renderGloryBoxPanel() {
  const panel = document.getElementById("gloryBoxPanel");
  if (!panel) return;
  if (!isGloryBoxPool()) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  const value = Math.max(0, Number(state.gloryValue) || 0);
  const counts = state.gloryExchangeCounts || {};
  const valueDisplay = document.getElementById("gloryValueDisplay");
  const hint = document.getElementById("gloryExchangeHint");
  const btnLahm36 = document.getElementById("btnGloryExchangeLahm36");
  const btnLahm5 = document.getElementById("btnGloryExchangeLahm5");
  const btnHighlight10 = document.getElementById("btnGloryExchangeHighlight10");
  const btnHighlight30 = document.getElementById("btnGloryExchangeHighlight30");
  if (valueDisplay) valueDisplay.textContent = String(value);
  if (btnLahm36) btnLahm36.disabled = value < 36;
  if (btnLahm5) {
    const used = Math.max(0, Number(counts.lahm5) || 0);
    btnLahm5.disabled = value < 2 || used >= 1;
    btnLahm5.textContent = `2 荣耀值兑换 5%拉姆卡包（${used}/1）`;
  }
  if (btnHighlight10) {
    const used = Math.max(0, Number(counts.highlight10) || 0);
    btnHighlight10.disabled = value < 3 || used >= 2;
    btnHighlight10.textContent = `3 荣耀值兑换 10%高光礼盒（${used}/2）`;
  }
  if (btnHighlight30) {
    const used = Math.max(0, Number(counts.highlight30) || 0);
    btnHighlight30.disabled = value < 6 || used >= 2;
    btnHighlight30.textContent = `6 荣耀值兑换 30%高光礼盒（${used}/2）`;
  }
  if (hint) {
    const completedPulls = Math.max(0, Number(state.totalPulls) || 0);
    const p = getGloryValueProbability(completedPulls);
    hint.textContent = `当前荣耀值单次爆率：${formatGloryPercent(p)}；抽完70抽后每抽额外必得1个荣耀值`;
  }
}

function renderGloryDrawSummary() {
  const summary = document.getElementById("gloryBoxSummary");
  if (!summary) return;
  if (!isGloryBoxPool()) {
    summary.classList.add("hidden");
    return;
  }

  const completedPulls = Math.max(0, Number(state.totalPulls) || 0);
  const gloryValue = Math.max(0, Number(state.gloryValue) || 0);
  const metrics = calcGloryTargetPullMetrics(36);
  const pricePerPull = getPoolPricePerPull();
  const expectedGold = Math.round(metrics.expected * pricePerPull);
  const lowerGold = metrics.lowerPulls * pricePerPull;
  const upperGold = metrics.upperPulls * pricePerPull;
  const setText = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  setText("glorySummaryValue", String(gloryValue));
  setText("glorySummaryPulls", String(completedPulls));
  setText("glorySummaryRate", formatGloryPercent(getGloryValueProbability(completedPulls)));
  setText("glorySummaryExpectedPulls", `${metrics.expected.toFixed(2)}抽`);
  setText("glorySummaryExpectedGold", `${expectedGold.toLocaleString()}金币`);
  setText(
    "glorySummaryInterval",
    `${metrics.lowerPulls}-${metrics.upperPulls}抽 / ${lowerGold.toLocaleString()}-${upperGold.toLocaleString()}金币`
  );
  summary.classList.remove("hidden");
}

function renderRisingPoolSummary() {
  const panel = document.getElementById("risingPoolSummary");
  if (!panel) return;
  if (!isAccumulatedNonRepeatPool()) {
    panel.classList.add("hidden");
    return;
  }

  const pool = getCurrentPool();
  const firstMetrics = calcRisingFirstTargetOperationMetrics(pool);
  const metrics = getFavoredSetExpectedMetrics(getRisingTargetPlayers(pool));
  if (!metrics) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  const expectedPulls = Math.round(metrics.allExpected);
  const expectedGold = Math.round(metrics.allExpectedGold);
  const lowerPulls = Math.max(0, Number(metrics.allLowerPulls) || 0);
  const upperPulls = Math.max(0, Number(metrics.allUpperPulls) || 0);
  const lowerGold = Math.max(0, Number(metrics.allLowerGold) || 0);
  const upperGold = Math.max(0, Number(metrics.allUpperGold) || 0);
  const setSummaryText = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  setSummaryText("risingSummaryFirstHit", `${firstMetrics.expectedHitPulls.toFixed(2)}抽`);
  setSummaryText("risingSummaryFirstConsumed", `${firstMetrics.expectedConsumedPulls.toFixed(2)}抽`);
  setSummaryText(
    "risingSummaryFirstGold",
    `${Math.round(firstMetrics.expectedGold).toLocaleString("zh-CN")}金币`
  );
  setSummaryText(
    "risingSummaryFirstPullInterval",
    `${firstMetrics.lowerConsumedPulls}-${firstMetrics.upperConsumedPulls}抽`
  );
  setSummaryText(
    "risingSummaryFirstGoldInterval",
    `${firstMetrics.lowerGold.toLocaleString("zh-CN")}-${firstMetrics.upperGold.toLocaleString("zh-CN")}金币`
  );
  setSummaryText("risingSummaryExpectedPulls", `${expectedPulls}抽`);
  setSummaryText("risingSummaryExpectedGold", `${expectedGold.toLocaleString("zh-CN")}金币`);
  setSummaryText("risingSummaryPullInterval", `${lowerPulls}-${upperPulls}抽`);
  setSummaryText(
    "risingSummaryGoldInterval",
    `${lowerGold.toLocaleString("zh-CN")}-${upperGold.toLocaleString("zh-CN")}金币`
  );
}

function renderStarPackPanel() {
  const panel = document.getElementById("starPackDrawPanel");
  if (!panel) return;
  if (!isStarPackPool()) {
    panel.classList.add("hidden");
    return;
  }

  const batch = state.starPackBatch;
  const progress = getStarPackBatchProgress(batch);
  const category = getStarPackCategoryById(batch?.categoryId);
  const categoryRevealed = progress.tearCount >= 1;
  const purchased = Math.max(0, Number(state.totalPulls) || 0);
  const luckyStars = Math.max(0, Number(state.starPackLuckyStars) || 0);
  const luckyBoxes = Math.max(0, Number(state.starPackLuckyBoxesOpened) || 0);
  const choiceBoxPending = Boolean(state.starPackChoiceBoxPending);
  const completedPacks = Math.max(0, Number(state.starPackCompletedPacks) || 0);
  const guaranteeTarget = Math.max(
    1,
    Number(getStarPackConfig()?.vieiraMilestonePacks) || 100
  );
  const guaranteeClaimable = Boolean(
    state.starPackVieiraGuaranteeClaimable &&
      !state.starPackVieiraMilestoneGranted
  );
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  };

  setText("starPackPurchasedCount", purchased);
  setText("starPackLuckyStars", luckyStars);
  setText("starPackLuckyBoxes", luckyBoxes);
  setText(
    "starPackGuaranteeProgress",
    `${Math.min(completedPacks, guaranteeTarget)}/${guaranteeTarget}`
  );
  setText(
    "starPackExpectedRate",
    `${(STAR_PACK_ROUTE_METRICS.expectedCoreRate * 100).toFixed(2)}%`
  );

  const purchaseButtons = panel.querySelectorAll("button[data-star-pack-count]");
  purchaseButtons.forEach((button) => {
    button.disabled = Boolean(batch && batch.status !== "opened");
  });
  const luckyButton = document.getElementById("btnOpenStarLuckyBox");
  if (luckyButton) {
    const available = Math.floor(
      luckyStars / Math.max(1, Number(getStarPackConfig()?.luckyBoxCost) || 15)
    );
    const batchOpening = Boolean(batch && batch.status !== "opened");
    luckyButton.disabled = available <= 0 || choiceBoxPending || batchOpening;
    luckyButton.textContent = choiceBoxPending
      ? "请先领取第8箱自选"
      : batchOpening
      ? "请先开完本批卡包"
      : available > 0
      ? `开启幸运宝箱（可开 ${available}）`
      : "开启幸运宝箱（需15星）";
  }

  const choicePanel = document.getElementById("starPackChoicePanel");
  if (choicePanel) {
    choicePanel.classList.toggle("hidden", !choiceBoxPending);
  }
  panel.querySelectorAll("button[data-star-lucky-choice]").forEach((button) => {
    button.disabled = !choiceBoxPending;
  });

  const guaranteePanel = document.getElementById("starPackGuaranteePanel");
  if (guaranteePanel) {
    guaranteePanel.classList.toggle("hidden", !guaranteeClaimable);
  }
  const claimGuaranteeButton = document.getElementById("btnClaimStarPackVieira");
  if (claimGuaranteeButton) {
    claimGuaranteeButton.disabled = !guaranteeClaimable;
  }

  const status = document.getElementById("starPackBatchStatus");
  if (status) {
    if (!batch) {
      status.textContent = "请选择购买数量";
    } else if (batch.status === "tearing") {
      status.textContent =
        `本批 ${batch.count} 包共享九宫格 · 已翻 ${batch.step} 格 · 最多 ${STAR_PACK_MAX_TILES} 格` +
        (categoryRevealed ? ` · ${category?.label || "卡包类型已揭晓"}` : "");
    } else if (batch.status === "opening") {
      status.textContent =
        `正在逐包开启 ${batch.openedCount || 0}/${batch.count} · ` +
        `${category?.label || "球星卡包"} · ${progress.rating}+ / ${formatPercent(
          progress.coreRate
        )}`;
    } else {
      status.textContent =
        `本批 ${batch.count} 包已开启 · ${category?.label || "球星卡包"} · ` +
        `${progress.rating}+ / ${formatPercent(progress.coreRate)}`;
    }
  }

  const boostStatus = document.getElementById("starPackBoostStatus");
  if (boostStatus) {
    boostStatus.textContent =
      `潜力 ${progress.rating}+ · 核心概率 ${formatPercent(progress.coreRate)}` +
      (categoryRevealed ? ` · ${category?.label || ""}` : " · 类型未揭晓");
  }

  const lane = document.getElementById("starPackBatchLane");
  if (lane) {
    lane.innerHTML = "";
    if (!batch) {
      const empty = document.createElement("div");
      empty.className = "star-pack-empty";
      empty.textContent = "购买后，这里会显示本批共享九宫格、逐个开奖的卡包。";
      lane.appendChild(empty);
    } else {
      const card = document.createElement("div");
      card.className = `star-pack-envelope ${categoryRevealed ? batch.categoryId : "sealed"}`;
      if (batch.status === "opened") {
        card.classList.add("opened");
      }
      const packMark = document.createElement("span");
      packMark.className = "star-pack-envelope-mark";
      packMark.textContent = categoryRevealed
        ? category?.label || "球星卡包"
        : "球星卡包";
      const packCount = document.createElement("span");
      packCount.className = "star-pack-envelope-index";
      packCount.textContent =
        batch.status === "opening"
          ? `×${batch.count} · ${batch.openedCount || 0}/${batch.count}`
          : `×${batch.count}`;
      card.appendChild(packMark);
      card.appendChild(packCount);
      lane.appendChild(card);
    }
  }

  const grid = document.getElementById("starPackTearGrid");
  if (grid) {
    grid.innerHTML = "";
    const kindLabels = {
      potential: "潜力提升",
      signing: "签约提升",
      tear: "撕开卡包",
    };
    for (let index = 0; index < STAR_PACK_MAX_TILES; index += 1) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "star-pack-tile";
      const revealed = batch?.revealedTiles?.[index] || null;
      if (revealed) {
        tile.classList.add("revealed", revealed.kind);
        const tearOrder = batch.revealedKinds
          .slice(0, revealed.order)
          .filter((kind) => kind === "tear").length;
        const title = document.createElement("span");
        title.className = "star-pack-tile-title";
        title.textContent =
          revealed.kind === "tear"
            ? `${kindLabels[revealed.kind]} ${tearOrder}/2`
            : kindLabels[revealed.kind];
        tile.appendChild(title);
        if (revealed.stars > 0) {
          const star = document.createElement("span");
          star.className = "star-pack-tile-stars";
          star.textContent = `幸运星 +${revealed.stars}`;
          tile.appendChild(star);
        }
      } else {
        tile.classList.add("covered");
        tile.textContent = "点击翻开";
        tile.disabled = !batch || batch.status !== "tearing";
        tile.addEventListener("click", () => revealStarPackTile(index));
      }
      grid.appendChild(tile);
    }
  }

  const hint = document.getElementById("starPackTearHint");
  if (hint) {
    if (!batch) {
      hint.textContent = "购买后点击任意卡背开始撕卡，最多翻开 9 格。";
    } else if (batch.status === "tearing") {
      hint.textContent =
        "同一格提升会作用于本批全部卡包；第二个“撕开卡包”出现后按包序逐个开奖。";
    } else if (batch.status === "opening") {
      hint.textContent =
        `正在开启累计第 ${Math.min(
          Math.max(1, Number(batch.startPackIndex) || 1) +
            Math.max(0, Number(batch.openedCount) || 0),
          state.totalPulls
        )} 个球星卡包；出核心时会暂停播放动画。`;
    } else {
      hint.textContent =
        `本批获得幸运星 ${batch.starsGained || 0} 颗。可继续购买下一批卡包。`;
    }
  }

  panel.classList.remove("hidden");
}

function renderMilestonesTable() {
  const tbody = document.getElementById("milestoneTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (isStarPackPool()) {
    const rows = [
      { pulls: "每包 800 金币", text: "可同时购买1包、3包或10包；同批共享九宫格提升，随后按包序逐个开奖" },
      { pulls: "九宫格", text: "潜力40% / 签约25% / 撕开35%；最多9格，且至少获得一次潜力或签约提升" },
      { pulls: "潜力提升", text: "每2个提升一档：99+ / 100+ / 101+ / 102+" },
      { pulls: "签约提升", text: "每2个提升一档：5% / 10% / 30% / 100%" },
      {
        pulls: "单包核心概率",
        text: `按全部合法九宫格路线加权为${(
          STAR_PACK_ROUTE_METRICS.expectedCoreRate * 100
        ).toFixed(2)}%；表示每个包平均开出核心球员的概率`,
      },
      { pulls: "卡包类型", text: "史诗高光包 / 梦幻精选包 / 史诗+ST混合包各占1/3" },
      { pulls: "开启结果", text: "翻到第二个撕开卡包后逐包开奖；每包来源序号独立记录，出核心先播放动画再继续，未出则为五星普卡" },
      {
        pulls: "幸运星",
        text: `翻格综合概率33%（含每包至少1颗保底）；平均每包${STAR_PACK_ROUTE_METRICS.expectedLuckyStarsPerPack.toFixed(
          2
        )}颗；15颗开启幸运宝箱`,
      },
      {
        pulls: "普通幸运宝箱",
        text: "1%自选球星包 / 3%随机增能包 / 6%含10%维埃拉包 / 90%道具包；维埃拉实际概率0.6%，概率包未中均为五星普卡",
      },
      {
        pulls: "第8个幸运宝箱",
        text: "固定变为自选箱，可在自选球星包、随机增能包、10%维埃拉包、道具包中自选一个",
      },
      { pulls: "开完100包", text: "出现保底领取窗口；手动领取维埃拉，来源记录为“保底100个球星包”" },
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

  if (isGloryBoxPool()) {
    const cfg = getGloryConfig();
    const rows = [
      { pulls: "单次抽取", text: "1000金币抽1次，每次进行10次荣耀值判定" },
      { pulls: "荣耀值概率", text: "第1抽0.6%，第5抽3%，第10抽3.75%，第15抽4.5%，第20抽5.25%，第25抽5.88%，第30抽起6%" },
      { pulls: "70抽以后", text: "每抽必得1个荣耀值，剩余9次按6%判定" },
      { pulls: "36 荣耀值", text: `兑换大奖${cfg?.mainPrize || "拉姆"}` },
      { pulls: "2/3/6 荣耀值", text: "兑换5%拉姆卡包 / 10%高光礼盒 / 30%高光礼盒" },
    ];
    (cfg?.milestones || []).forEach((m) => {
      rows.push({ pulls: `${m.pulls} 抽`, text: m.label });
    });
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

  if (isDiscountLimitedPool()) {
    const pool = getCurrentPool();
    const cap = getPoolPullCap(pool);
    const discountLimit = Math.max(0, Number(pool.discountPullLimit) || 0);
    const freeCfg = pool.bonusFreePullConfig || null;
    const rows = [
      { pulls: "每次十连", text: "保证至少 1 名 5星球员" },
      {
        pulls: "抽取限制",
        text: cap > 0 ? `仅可十连，最多抽 ${cap} 次` : "仅可十连，无兑换徽章保底",
      },
      {
        pulls: "折扣说明",
        text: freeCfg
          ? `买 ${freeCfg.paidPulls} 抽送 ${freeCfg.freePulls} 抽，赠送抽不消耗金币`
          : discountLimit > 0
          ? `前 ${discountLimit} 抽 7 折，之后恢复原价`
          : `单次十连消耗 ${getPullCostForRange(0, 10, pool)} 金币`,
      },
    ];
    if (isNonRepeatEmpoweredPool(pool)) {
      rows.push({ pulls: "增能机制", text: "增能卡不重复，集齐前不会重复获得已出的增能卡" });
    }
    if (isHighlightTicketPool()) {
      rows.push({ pulls: "高光券", text: getHighlightTicketDescription().replace(/^高光券：/, "") });
    }
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

  if (isShopPackagePool()) {
    const rows = [
      { pulls: "单次购买", text: "688金币购买1个春日礼包" },
      { pulls: "春日礼包", text: "4%获得春日礼包10人中的增能卡（10人平分）" },
      { pulls: "春日礼包", text: "其余96%获得五星普卡" },
      { pulls: "额外奖励", text: "每个春日礼包独立10%获得1个学霸礼包" },
      { pulls: "每10个春日礼包", text: "免费获得1个学霸礼包（最多10次）" },
      { pulls: "80个春日礼包", text: "春日礼包10人自选" },
      { pulls: "120个春日礼包", text: "11人自选（含瓦拉内）" },
      { pulls: "学霸礼包", text: "0.2%瓦拉内 / 15%春日礼包随机球员 / 其余为金币或代币" },
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
    const bonusGiftCfg = getExchangeBonusGiftConfig();
    const specificText = (cfg.specificPlayers || []).join("/");
    const exchangeRows = [
      { pulls: "每 10 抽", text: "赠送 1 个徽章" },
      { pulls: "6 徽章", text: `兑换 10% 特定增能球员卡（${specificText}）` },
      { pulls: "25 徽章", text: "兑换随机增能卡必得券" },
    ];
    if (bonusGiftCfg) {
      exchangeRows.push({
        pulls: `每 ${bonusGiftCfg.everyPulls} 抽`,
        text: bonusGiftCfg.label,
      });
    }
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
    if (isHighlightTicketPool()) {
      exchangeRows.push({
        pulls: "高光券",
        text: getHighlightTicketDescription().replace(/^高光券：/, ""),
      });
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

  if (isHighlightTicketPool()) {
    const tr = document.createElement("tr");
    const tdPulls = document.createElement("td");
    const tdLabel = document.createElement("td");
    tdPulls.textContent = "高光券";
    tdLabel.textContent = getHighlightTicketDescription().replace(/^高光券：/, "");
    tr.appendChild(tdPulls);
    tr.appendChild(tdLabel);
    tbody.appendChild(tr);
  }
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
  const setBtn = (btn, text, drawCount, targetTotal, targetBadges, hidden = false, targetGlory = null) => {
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
    if (targetGlory == null) {
      btn.removeAttribute("data-target-glory");
    } else {
      btn.setAttribute("data-target-glory", String(targetGlory));
    }
    if (hidden) {
      btn.classList.add("hidden");
    } else {
      btn.classList.remove("hidden");
    }
  };

  if (isAccumulatedNonRepeatPool(pool)) {
    setBtn(btnQuick60, "抽10次", 10, null, null);
    setBtn(btnQuick250, "抽50次", 50, null, null);
    setBtn(btnQuick420, "抽100次", 100, null, null);
    setBtn(btnQuick470, "抽150次", 150, null, null);
    setBtn(btnQuick520, "抽200次", 200, null, null);
    return;
  }

  if (pool.progressionType === "milestone") {
    if (pool.poolType === "accumulated_gift") {
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

  if (isDiscountLimitedPool()) {
    const cap = getPoolPullCap(pool);
    if (cap > 0) {
      setBtn(btnQuick60, "一键抽 10", 10, null, null);
      setBtn(btnQuick250, "一键抽 20", 20, null, null);
      setBtn(btnQuick420, "一键抽 30", 30, null, null);
      setBtn(btnQuick470, "一键抽 30", 30, null, null, true);
      setBtn(btnQuick520, "一键抽 30", 30, null, null, true);
      return;
    }
    setBtn(btnQuick60, "一键抽 10", 10, null, null);
    setBtn(btnQuick250, "一键抽 30", 30, null, null);
    setBtn(btnQuick420, "一键抽 50", 50, null, null);
    setBtn(btnQuick470, "一键抽 100", 100, null, null);
    setBtn(btnQuick520, "一键抽 200", 200, null, null);
    return;
  }

  if (isShopPackagePool()) {
    setBtn(btnQuick60, "一键再买 10 个", 10, null, null);
    setBtn(btnQuick250, "一键买到 50 个", null, 50, null);
    setBtn(btnQuick420, "一键买到 80 个", null, 80, null);
    setBtn(btnQuick470, "一键买到 120 个", null, 120, null);
    setBtn(btnQuick520, "一键买到 120 个", null, 120, null, true);
    return;
  }

  if (isGloryBoxPool()) {
    setBtn(btnQuick60, "一键抽到 2 荣耀值", null, null, null, false, 2);
    setBtn(btnQuick250, "一键抽到 3 荣耀值", null, null, null, false, 3);
    setBtn(btnQuick420, "一键抽到 6 荣耀值", null, null, null, false, 6);
    setBtn(btnQuick470, "一键抽到 36 荣耀值", null, null, null, false, 36);
    setBtn(btnQuick520, "一键抽到 36 荣耀值", null, null, null, true, 36);
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
  const starPack = document.getElementById("starPackDrawPanel");
  const chainTierStatus = document.getElementById("chainTierStatus");
  const chainTierProgressBar = document.getElementById("chainTierProgressBar");
  const chainTierProgressFill = document.getElementById("chainTierProgressFill");
  const seasonRoundInfo = document.getElementById("seasonRoundInfo");
  const highlightTicketPanel = document.getElementById("highlightTicketPanel");
  const highlightTicketHint = document.getElementById("highlightTicketHint");
  const highlightTicketFooter = document.getElementById("highlightTicketFooter");
  const highlightTicketCount = document.getElementById("highlightTicketCount");
  if (
    !normal ||
    !chain ||
    !starPack ||
    !chainTierStatus ||
    !chainTierProgressBar ||
    !chainTierProgressFill
  ) {
    return;
  }

  if (isStarPackPool()) {
    normal.classList.add("hidden");
    chain.classList.add("hidden");
    starPack.classList.remove("hidden");
    chainTierProgressBar.innerHTML = "";
    chainTierProgressFill.style.width = "0%";
    if (seasonRoundInfo) seasonRoundInfo.classList.add("hidden");
    return;
  }
  starPack.classList.add("hidden");

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
    if (highlightTicketPanel) {
      highlightTicketPanel.classList.toggle("hidden", !isHighlightTicketPool());
    }
    if (highlightTicketHint) {
      highlightTicketHint.textContent = getHighlightTicketDescription();
    }
    if (highlightTicketFooter) {
      highlightTicketFooter.classList.toggle("hidden", !isHighlightTicketPool());
    }
    if (highlightTicketCount) {
      highlightTicketCount.textContent = String(Math.max(0, Number(state.highlightTicketPulls) || 0));
    }
    if (seasonRoundInfo) {
      if (isSeasonPool()) {
        const progress = state.seasonProgressPulls || 0;
        seasonRoundInfo.textContent = `当前轮次进度：${progress} / 500`;
        seasonRoundInfo.classList.remove("hidden");
      } else if (isDiscountLimitedPool()) {
        const cap = getPoolPullCap();
        if (cap > 0) {
          seasonRoundInfo.textContent = `本轮进度：${state.totalPulls || 0} / ${cap}`;
        } else {
          const discountLimit = Math.max(0, Number(getCurrentPool().discountPullLimit) || 0);
          const remainingDiscount = Math.max(0, discountLimit - Math.max(0, Number(state.totalPulls) || 0));
          seasonRoundInfo.textContent = `已抽：${state.totalPulls || 0}；剩余7折抽数：${remainingDiscount}`;
        }
        seasonRoundInfo.classList.remove("hidden");
      } else if (isAccumulatedGuaranteePool()) {
        seasonRoundInfo.textContent = `当前定向进度：${state.totalPulls || 0} / ${getAccumulatedGuaranteeProgressCap()}`;
        seasonRoundInfo.classList.remove("hidden");
      } else if (isAccumulatedNonRepeatPool()) {
        const pool = getCurrentPool();
        const ownedCount = getRisingOwnedTargetNames().length;
        if (isRisingPoolComplete(pool, state)) {
          seasonRoundInfo.textContent =
            `已抽：${state.totalPulls || 0}；已获得目标：4/4；本池已完成，不能继续抽取`;
        } else {
          const progress = Math.max(0, Number(state.risingPityProgress) || 0);
          const cap = Math.max(1, Number(getRisingProbabilityConfig(pool)?.guaranteePulls) || 191);
          const rate = getCurrentRisingProbability(pool, state);
          const nextCost = getPullCostForRange(state.totalPulls || 0, 10, pool);
          seasonRoundInfo.textContent =
            `已抽：${state.totalPulls || 0}；已获得目标：${ownedCount}/4；` +
            `当前十连递增进度：${progress}/${cap}；当前爆率：${rate >= 1 ? "100%保底" : formatRisingPercent(rate)}；` +
            `下一次10抽：${nextCost}金币`;
        }
        seasonRoundInfo.classList.remove("hidden");
      } else if (isShopPackagePool()) {
        seasonRoundInfo.textContent =
          `已获得春日礼包：${state.totalPulls || 0} 个；` +
          `10%随机学霸礼包：${state.shopRandomScholarRewards || 0} 个；` +
          `10个赠送学霸礼包：${state.shopScholarMilestonesGranted || 0} / 10`;
        seasonRoundInfo.classList.remove("hidden");
      } else if (isGloryBoxPool()) {
        const completedPulls = Math.max(0, Number(state.totalPulls) || 0);
        const gloryMetrics = calcGloryTargetPullMetrics(36);
        const pricePerPull = getPoolPricePerPull();
        const expectedGold = Math.round(gloryMetrics.expected * pricePerPull);
        const lowerGold = gloryMetrics.lowerPulls * pricePerPull;
        const upperGold = gloryMetrics.upperPulls * pricePerPull;
        seasonRoundInfo.textContent =
          `已抽：${state.totalPulls || 0}；荣耀值：${state.gloryValue || 0}；` +
          `当前爆率：${formatGloryPercent(getGloryValueProbability(completedPulls))}；` +
          `36荣耀值期望花费：${expectedGold.toLocaleString()}金币；` +
          `95%区间：${lowerGold.toLocaleString()}-${upperGold.toLocaleString()}金币`;
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
  renderHallRoadPanel();
  renderGloryBoxPanel();
  renderGloryDrawSummary();
  renderRisingPoolSummary();
  renderStarPackPanel();
  renderMomentPreview();
  const btnSingle = document.getElementById("btnSingle");
  const btnTen = document.getElementById("btnTen");
  const btnFifty = document.getElementById("btnFifty");
  if (btnSingle) btnSingle.classList.toggle("hidden", isDiscountLimitedPool() || isAccumulatedNonRepeatPool());
  if (btnFifty) btnFifty.classList.toggle("hidden", isDiscountLimitedPool() || isShopPackagePool() || isGloryBoxPool() || isAccumulatedNonRepeatPool());
  if (btnTen) btnTen.classList.toggle("hidden", isShopPackagePool() || isAccumulatedNonRepeatPool());
  if (btnSingle) btnSingle.textContent = isShopPackagePool()
    ? "购买春日礼包（688金币）"
    : isGloryBoxPool()
    ? "抽1次荣耀礼盒（1000金币）"
    : "单抽";
  if (btnTen) btnTen.textContent = isDiscountLimitedPool()
    ? `十连抽（${getPullCostForRange(state.totalPulls || 0, 10)}金币）`
    : isGloryBoxPool()
    ? "抽10次荣耀礼盒（10000金币）"
    : "十连抽";
  const risingCompleted = isAccumulatedNonRepeatPool() && isRisingPoolComplete();
  ["btnQuick60", "btnQuick250", "btnQuick420", "btnQuick470", "btnQuick520"]
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((button) => {
      button.disabled = risingCompleted;
    });
  const btnAutoToFav = document.getElementById("btnAutoToFav");
  if (btnAutoToFav) btnAutoToFav.disabled = risingCompleted;
}

// ================= 事件绑定 =================

function bindEvents() {
  const btnSingle = document.getElementById("btnSingle");
  const btnTen = document.getElementById("btnTen");
  const btnFifty = document.getElementById("btnFifty");
  const starPackPurchaseButtons = document.querySelectorAll(
    "button[data-star-pack-count]"
  );
  const starPackChoiceButtons = document.querySelectorAll(
    "button[data-star-lucky-choice]"
  );
  const btnOpenStarLuckyBox = document.getElementById("btnOpenStarLuckyBox");
  const btnClaimStarPackVieira = document.getElementById(
    "btnClaimStarPackVieira"
  );
  const btnResetStarPack = document.getElementById("btnResetStarPack");
  const btnReset = document.getElementById("btnReset");
  const btnResetChain = document.getElementById("btnResetChain");
  const quickButtons = document.querySelectorAll(
    ".quick-buttons button[data-target-total], .quick-buttons button[data-draw-count], .quick-buttons button[data-target-badges], .quick-buttons button[data-target-glory]"
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
  const btnOwnedSelectAll = document.getElementById("btnOwnedSelectAll");
  const favEmpoweredChoice = document.getElementById("favEmpoweredChoice");
  const chainFavEmpoweredChoice = document.getElementById("chainFavEmpoweredChoice");
  const ownedEmpoweredChoice = document.getElementById("ownedEmpoweredChoice");
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
  const btnHighlightSingle = document.getElementById("btnHighlightSingle");
  const btnHighlightTen = document.getElementById("btnHighlightTen");
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
  if (btnHighlightSingle) {
    btnHighlightSingle.addEventListener("click", () => {
      drawHighlightTicket(1);
    });
  }
  if (btnHighlightTen) {
    btnHighlightTen.addEventListener("click", () => {
      const cfg = getHighlightTicketConfig();
      drawHighlightTicket(Number(cfg?.batchSize) || 10);
    });
  }
  if (btnFifty) {
    btnFifty.addEventListener("click", () => {
      autoDrawCount(50);
    });
  }
  starPackPurchaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      purchaseStarPackBatch(button.getAttribute("data-star-pack-count"));
    });
  });
  if (btnOpenStarLuckyBox) {
    btnOpenStarLuckyBox.addEventListener("click", () => {
      openStarLuckyBox();
    });
  }
  starPackChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      claimStarPackChoiceBox(button.getAttribute("data-star-lucky-choice"));
    });
  });
  if (btnClaimStarPackVieira) {
    btnClaimStarPackVieira.addEventListener("click", () => {
      claimStarPackVieiraGuarantee();
    });
  }
  if (btnResetStarPack) {
    btnResetStarPack.addEventListener("click", () => {
      resetAll();
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
      const targetGlory = btn.getAttribute("data-target-glory");
      if (targetGlory != null) {
        autoToTargetGloryValue(targetGlory);
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
  if (ownedEmpoweredChoice) {
    ownedEmpoweredChoice.addEventListener("change", () => {
      const selected = new Set(
        Array.from(ownedEmpoweredChoice.selectedOptions || []).map((opt) => opt.value)
      );
      const names = getCurrentPool().empoweredCards || [];
      const nextMap = { ...(state.ownedEmpoweredNames || {}) };
      names.forEach((name) => {
        nextMap[name] = selected.has(name);
      });
      state.ownedEmpoweredNames = nextMap;
      renderFavTagSelector("ownedEmpoweredChoice", "ownedEmpoweredTags");
      updateFavSelectAllButton("ownedEmpoweredChoice", "btnOwnedSelectAll");
      renderAll();
    });
  }
  if (btnOwnedSelectAll && ownedEmpoweredChoice) {
    btnOwnedSelectAll.addEventListener("click", () => {
      const options = Array.from(ownedEmpoweredChoice.options || []);
      const selectedCount = Array.from(ownedEmpoweredChoice.selectedOptions || []).length;
      const allSelected = options.length > 0 && selectedCount === options.length;
      options.forEach((opt) => {
        opt.selected = !allSelected;
      });
      ownedEmpoweredChoice.dispatchEvent(new Event("change"));
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
  if (btnGloryExchangeLahm36) {
    btnGloryExchangeLahm36.addEventListener("click", () => {
      exchangeGloryLahmDirect();
    });
  }
  if (btnGloryExchangeLahm5) {
    btnGloryExchangeLahm5.addEventListener("click", () => {
      exchangeGloryChancePack("lahm5");
    });
  }
  if (btnGloryExchangeHighlight10) {
    btnGloryExchangeHighlight10.addEventListener("click", () => {
      exchangeGloryChancePack("highlight10");
    });
  }
  if (btnGloryExchangeHighlight30) {
    btnGloryExchangeHighlight30.addEventListener("click", () => {
      exchangeGloryChancePack("highlight30");
    });
  }
  const btnHallSacrifice = document.getElementById("btnHallSacrifice");
  if (btnHallSacrifice) {
    btnHallSacrifice.addEventListener("click", () => {
      const sel = document.getElementById("hallSacrificeChoice");
      if (sel && sel.value) sacrificeHallPlayer(sel.value);
    });
  }
}

// ================= 初始化 =================

// ================= 殿堂之路系统 =================

function getHallSacrificeValue(name, pool = getCurrentPool()) {
  if (!isHallRoadPool(pool)) return 0;
  if ((pool.hallRoadLegend || "") === name) return 1000;
  const base = (pool.hallRoadSuperstar || []).includes(name) ? 600
    : (pool.hallRoadSuper || []).includes(name) ? 500
    : 400;
  const times = (state.hallSacrificeCounts || {})[name] || 0;
  const extra = times > 0 ? 180 : 0;
  return base + extra;
}

function getHallDrawPointValue(name, pool = getCurrentPool()) {
  if (!isHallRoadPool(pool)) return 0;
  const drawn = state.hallDrawnPlayers || {};
  const alreadyDrawn = Array.from(new Set(Object.keys(drawn).filter(k => drawn[k])));
  if (alreadyDrawn.includes(name)) return 0;
  if ((pool.hallRoadLegend || "") === name) return 1000;
  return alreadyDrawn.length < 3 ? 300 : 150;
}

function getHallRoadStatNames(pool = getCurrentPool()) {
  const names = [];
  const push = (name) => {
    if (name && !names.includes(name)) names.push(name);
  };
  push(pool.hallRoadLegend || "");
  (pool.empoweredCards || []).forEach(push);
  return names;
}

function getHallRoadFeaturedNames(pool = getCurrentPool()) {
  const names = [];
  const push = (name) => {
    if (name && getHallRoadStatNames(pool).includes(name) && !names.includes(name)) {
      names.push(name);
    }
  };
  (pool.hallRoadFeaturedTargets || []).forEach(push);
  push(pool.hallRoadLegend || "");
  push("克鲁伊夫");
  if (names.length < 2) {
    (pool.hallRoadSuperstar || []).forEach(push);
  }
  return names.length ? names : getHallRoadStatNames(pool);
}

function createHallRoadSimulator(pool, targetNames = [], options = {}) {
  const legend = pool.hallRoadLegend || "小罗";
  const poolCards = (pool.empoweredCards || []).slice();
  const pAny = getBaseEmpoweredProbability(pool.poolConfig || []);
  const sacrificeAll = Boolean(options.sacrificeAll);
  const targets = targetNames.filter(Boolean);
  const targetCounts = {};
  const lit = {};
  const sacrificeCounts = {};
  const milestones = {};
  let paidDraws = 0;
  let points = 300;
  let totalEmpowered = 0;

  const getLitCount = () => Object.keys(lit).filter((name) => lit[name]).length;
  const getSacrificeValue = (name) => {
    if (!poolCards.includes(name)) return 0;
    const base = (pool.hallRoadSuperstar || []).includes(name) ? 600
      : (pool.hallRoadSuper || []).includes(name) ? 500
      : 400;
    return base + ((sacrificeCounts[name] || 0) > 0 ? 180 : 0);
  };
  const addCard = (name) => {
    if (!name) return;
    totalEmpowered += 1;
    targetCounts[name] = (targetCounts[name] || 0) + 1;
    if (!lit[name]) {
      const litCount = getLitCount();
      lit[name] = true;
      points += name === legend ? 1000 : litCount < 3 ? 300 : 150;
    }
    if (sacrificeAll && poolCards.includes(name)) {
      points += getSacrificeValue(name);
      sacrificeCounts[name] = (sacrificeCounts[name] || 0) + 1;
    }
  };
  const drawExtra = (count) => {
    for (let i = 0; i < count; i += 1) {
      if (Math.random() < pAny && poolCards.length > 0) {
        addCard(poolCards[Math.floor(Math.random() * poolCards.length)]);
        openMilestones();
      }
    }
  };
  const chooseSelectTarget = () => {
    const missingTarget = targets.find(
      (name) => name !== legend && poolCards.includes(name) && !targetCounts[name]
    );
    if (missingTarget) return missingTarget;
    return poolCards.length > 0 ? poolCards[Math.floor(Math.random() * poolCards.length)] : "";
  };
  function openMilestones() {
    let changed = true;
    while (changed) {
      changed = false;
      if (points >= 500 && !milestones[500]) {
        milestones[500] = true;
        changed = true;
        drawExtra(10);
      }
      if (points >= 1000 && !milestones[1000]) {
        milestones[1000] = true;
        changed = true;
        drawExtra(10);
      }
      if (points >= 2000 && !milestones[2000]) {
        milestones[2000] = true;
        changed = true;
        drawExtra(10);
      }
      if (points >= 3000 && !milestones[3000]) {
        milestones[3000] = true;
        changed = true;
        addCard(chooseSelectTarget());
      }
      if (points >= 5500 && !milestones[5500]) {
        milestones[5500] = true;
        changed = true;
        addCard(legend);
      }
    }
  }
  const drawPaid = () => {
    paidDraws += 1;
    if (Math.random() < pAny && poolCards.length > 0) {
      addCard(poolCards[Math.floor(Math.random() * poolCards.length)]);
    }
    openMilestones();
  };
  return {
    drawPaid,
    get paidDraws() { return paidDraws; },
    get totalEmpowered() { return totalEmpowered; },
    hasTarget(name) { return (targetCounts[name] || 0) > 0; },
    targetCount(name) { return targetCounts[name] || 0; },
    hasAnyTarget() { return targets.some((name) => (targetCounts[name] || 0) > 0); },
    hasAllTargets() { return targets.every((name) => (targetCounts[name] || 0) > 0); },
  };
}

function simulateHallRoadSpecificCDF(pool, drawCount, targetName, runs = 4000) {
  if (!isHallRoadPool(pool)) return 0;
  if (!getHallRoadStatNames(pool).includes(targetName)) return 0;
  let hits = 0;
  for (let run = 0; run < runs; run += 1) {
    const sim = createHallRoadSimulator(pool, [targetName], { sacrificeAll: true });
    for (let draw = 0; draw < drawCount; draw += 1) sim.drawPaid();
    if (sim.hasTarget(targetName)) hits += 1;
  }
  return hits / runs;
}

function simulateHallRoadSpecificCountAtLeastCDF(pool, drawCount, targetName, targetCount, runs = 4000) {
  if (!isHallRoadPool(pool)) return 0;
  if (!getHallRoadStatNames(pool).includes(targetName)) return 0;
  let hits = 0;
  for (let run = 0; run < runs; run += 1) {
    const sim = createHallRoadSimulator(pool, [targetName], { sacrificeAll: true });
    for (let draw = 0; draw < drawCount; draw += 1) sim.drawPaid();
    if (sim.targetCount(targetName) >= targetCount) hits += 1;
  }
  return hits / runs;
}

function simulateHallRoadEmpoweredAtLeastCDF(pool, drawCount, targetCount, runs = 4000) {
  if (!isHallRoadPool(pool)) return 0;
  let hits = 0;
  for (let run = 0; run < runs; run += 1) {
    const sim = createHallRoadSimulator(pool, [], { sacrificeAll: true });
    for (let draw = 0; draw < drawCount; draw += 1) sim.drawPaid();
    if (sim.totalEmpowered >= targetCount) hits += 1;
  }
  return hits / runs;
}

function simulateHallRoadGoal(targetName) {
  const pool = getCurrentPool();
  if (!isHallRoadPool(pool)) return 0;
  let totalDraws = 0;
  const RUNS = 2000;
  for (let run = 0; run < RUNS; run += 1) {
    const sim = createHallRoadSimulator(pool, [targetName], { sacrificeAll: true });
    while (!sim.hasTarget(targetName) && sim.paidDraws < 200000) {
      sim.drawPaid();
    }
    totalDraws += sim.paidDraws;
  }
  return Math.round(totalDraws / RUNS);
}

function simulateHallRoadFavoredSetMetrics(pool, selectedNames) {
  const targets = selectedNames.filter((name) => getHallRoadStatNames(pool).includes(name));
  if (!targets.length) return { anyExpected: 0, allExpected: 0, allProbAtCap: 0 };
  const RUNS = 2000;
  let anyTotal = 0;
  let allTotal = 0;
  let allAtCap = 0;
  for (let run = 0; run < RUNS; run += 1) {
    const sim = createHallRoadSimulator(pool, targets, { sacrificeAll: true });
    let anyDraws = null;
    let allDraws = null;
    while (sim.paidDraws < 200000) {
      sim.drawPaid();
      if (anyDraws == null && sim.hasAnyTarget()) anyDraws = sim.paidDraws;
      if (sim.hasAllTargets()) {
        allDraws = sim.paidDraws;
        break;
      }
    }
    anyTotal += anyDraws == null ? sim.paidDraws : anyDraws;
    allTotal += allDraws == null ? sim.paidDraws : allDraws;
    if (allDraws != null && allDraws <= 5500) allAtCap += 1;
  }
  return {
    anyExpected: Math.round(anyTotal / RUNS),
    allExpected: Math.round(allTotal / RUNS),
    allProbAtCap: allAtCap / RUNS,
  };
}

function addHallPointsOnDraw(name, pool = getCurrentPool()) {
  if (!isHallRoadPool(pool)) return;
  state.hallDrawnPlayers = state.hallDrawnPlayers || {};
  const pts = getHallDrawPointValue(name, pool);
  if (!state.hallDrawnPlayers[name]) state.hallDrawnPlayers[name] = 0;
  state.hallDrawnPlayers[name] += 1;
  state.hallPoints = Math.max(0, (state.hallPoints || 300)) + pts;
  unlockHallRoadMilestonesIfNeeded();
}

function sacrificeHallPlayer(name) {
  const pool = getCurrentPool();
  if (!isHallRoadPool(pool) || !name) return;
  const points = getHallSacrificeValue(name, pool);
  state.hallSacrificeCounts = state.hallSacrificeCounts || {};
  state.hallSacrificeCounts[name] = (state.hallSacrificeCounts[name] || 0) + 1;
  state.hallPoints = Math.max(0, (state.hallPoints || 300)) + points;
  const empoweredCounts = state.empoweredCounts || {};
  const empoweredDetails = state.empoweredDetails || {};
  if (empoweredCounts[name] > 0) {
    empoweredCounts[name] -= 1;
    if (empoweredDetails[name] && empoweredDetails[name].length > 0) {
      empoweredDetails[name].pop();
    }
    state.stats.empowered = Math.max(0, (state.stats.empowered || 0) - 1);
    const goldStats = getGoldStats();
    goldStats.empowered = Math.max(0, (goldStats.empowered || 0) - 1);
    const goldCounts = getGoldEmpoweredCounts();
    if (goldCounts[name] != null && goldCounts[name] > 0) goldCounts[name] -= 1;
    const goldDetails = getGoldEmpoweredDetails();
    if (goldDetails[name] && goldDetails[name].length > 0) {
      goldDetails[name].pop();
    }
  }
  unlockHallRoadMilestonesIfNeeded();
  renderAll();
}

function unlockHallRoadMilestonesIfNeeded() {
  const pool = getCurrentPool();
  if (!isHallRoadPool(pool)) return;
  const pts = Math.max(0, state.hallPoints || 300);
  const milestones = [500, 1000, 2000, 3000, 5500];
  state.hallMilestonesGranted = state.hallMilestonesGranted || [];
  milestones.forEach((target) => {
    if (pts >= target && !state.hallMilestonesGranted.includes(target)) {
      state.hallMilestonesGranted.push(target);
      if (target === 5500) {
        state.rewards.push({
          id: `hall-xiaoluo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          pulls: target,
          type: "hall_legend",
          label: "殿堂球员 - 小罗",
          sourceLabel: "殿堂值满5500",
        });
      } else if (target === 3000) {
        state.pendingSelectRewardCount = (state.pendingSelectRewardCount || 0) + 1;
        state.pendingSelectMilestones = state.pendingSelectMilestones || [];
        state.pendingSelectMilestones.push({
          pulls: target,
          sourceLabel: `殿堂值满${target}自选`,
          candidateNames: (pool.empoweredCards || []).slice(),
        });
      } else {
        state.rewards.push({
          id: `hall-free-${target}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          pulls: target,
          type: "free_ten",
          label: `殿堂值${target} - 免费十连`,
          sourceLabel: `殿堂值满${target}免费十连`,
        });
      }
    }
  });
}

function getHallSacrificeCandidates() {
  const pool = getCurrentPool();
  if (!isHallRoadPool(pool)) return [];
  const counts = state.empoweredCounts || {};
  return (pool.empoweredCards || []).filter(name => (counts[name] || 0) > 0);
}

function renderHallRoadPanel() {
  const panel = document.getElementById("hallRoadPanel");
  if (!panel) return;
  const pool = getCurrentPool();
  if (!isHallRoadPool(pool)) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  const pts = Math.max(0, state.hallPoints || 300);
  const ptsEl = document.getElementById("hallPointsValue");
  if (ptsEl) ptsEl.textContent = pts;
  const pct = Math.min(100, (pts / 5500) * 100);
  const fill = document.getElementById("hallPointsFill");
  if (fill) fill.style.width = pct + "%";
  const milestones = [500, 1000, 2000, 3000, 5500];
  const milestonesList = document.getElementById("hallMilestonesList");
  if (milestonesList) {
    milestonesList.innerHTML = milestones.map((m) => {
      const achieved = pts >= m || (state.hallMilestonesGranted || []).includes(m);
      let label = m === 5500 ? `${m} 殿堂值 - 获得小罗` :
        m === 3000 ? `${m} 殿堂值 - 自选40增能卡之一` :
        `${m} 殿堂值 - 送10抽`;
      return `<li class="${achieved ? 'achieved' : ''}">${achieved ? '✅ ' : ''}${label}</li>`;
    }).join("");
  }
  const sacrificeSel = document.getElementById("hallSacrificeChoice");
  if (sacrificeSel) {
    const candidates = getHallSacrificeCandidates();
    sacrificeSel.innerHTML = candidates.map((name) => {
      const value = getHallSacrificeValue(name);
      const count = (state.empoweredCounts || {})[name] || 0;
      return `<option value="${name}">${name} (×${count}, +${value}殿堂值)</option>`;
    }).join("");
    const btn = document.getElementById("btnHallSacrifice");
    if (btn) btn.disabled = candidates.length === 0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkAppSync();
  loadSkinMode();
  populatePoolTypeChoices();
  populatePoolSwitchChoicesByType(getCurrentPool().poolType || "carnival_gift");
  bindEvents();
  renderAll();
});
