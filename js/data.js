/**
 * ============================================================
 * 瑞幸「幸运星期四 今天有惊喜」H5 活动页 - 演示数据配置
 * ------------------------------------------------------------
 * 所有活动文案、奖品数据、素材路径均集中在此文件，方便替换。
 * 替换真实素材时，仅需修改 img 字段指向新图片路径即可。
 * 注意：本页面为纯前端演示 Demo，不含任何真实接口与支付能力。
 * ============================================================
 */

window.LUCKIN_DEMO = {
  /** 活动基本信息 */
  activity: {
    storeName: '合肥贡街店',
    titleLine1: '幸运星期四',
    titleLine2: '今天有',
    titleHighlight: '惊喜',
    /** 初始演示抽奖次数（每次打开页面重置为该值） */
    initDrawCount: 2,
    /** 第二次抽奖固定中奖的九宫格下标（海蓝之谜套盒，位于 gridPrizes） */
    secondPrizeIndex: 8,
    /** 固定中奖结果：九宫格奖品的下标（0-8，4 为中心按钮）。设为 null 则随机 */
    fixedResultIndex: null,
  },

  /** 顶部滚动中奖播报（演示文案） */
  marquee: [
    'n********0抽中了7.7折券-指定自提饮品',
    'k*******3抽中了9.9元兑换券-指定自提饮品',
    'r********8抽中了全场自提饮品免单券',
    'c******5抽中了7.7折券-指定自提饮品',
    'u********9抽中了新疆辣皮子牛肉三明治免单券',
    'y********1抽中了0.01元杯品盲盒兑换券',
    'p********0抽中了7.7折券-指定自提饮品',
  ],

  /**
   * 九宫格奖品（按 3x3 顺序排列，下标 4 为中心抽奖按钮，不配置奖品）。
   * img: 素材路径（可整体替换为品牌原图）
   * tag: 奖品格底部小标签（免单券 / 兑换券），可为空
   * name: 完整奖品名（用于中奖弹窗与我的奖品）
   */
  gridPrizes: [
    { img: 'assets/img/prize-cup-quan.png',   tag: '',      name: '全场自提饮品免单券' },
    { img: 'assets/img/prize-cup-99.png',     tag: '',      name: '9.9元兑换券—指定自提饮品' },
    { img: 'assets/svg/prize-donut.svg',      tag: '免单券', name: '全场甜品简餐免单券' },
    { img: 'assets/svg/prize-kingcard.svg',   tag: '',      name: '瑞王卡-体验卡' },
    null, // 中心抽奖按钮占位
    { img: 'assets/svg/prize-exchange.svg',   tag: '兑换券', name: '0.01元杯品盲盒兑换券' },
    { img: 'assets/img/prize-cup-77.png',     tag: '',      name: '7.7折券—指定自提饮品' },
    { img: 'assets/svg/prize-sandwich.svg',   tag: '免单券', name: '新疆辣皮子牛肉三明治免单券' },
    // 下标 8：第二次抽奖固定大奖（海蓝之谜润唇膏+护手霜套盒）
    // mystery: true → 九宫格只显示「？」占位，保持神秘感，奖品图仅中奖弹窗揭示
    { img: 'assets/img/prize-lamer.jpg',      tag: '神秘大奖', name: '海蓝之谜润唇膏+护手霜套盒', mystery: true },
  ],

  /** 本期奖品池（横向滚动卡片；tag 为图片底部缎带标签，可为空） */
  prizePool: [
    { img: 'assets/img/prize-cup-77.png',     badge: '不限量',    tag: '',      name: '7.7折券—指定自提饮品',       soldOut: false },
    { img: 'assets/svg/prize-sandwich.svg',   badge: '共333份',   tag: '免单券', name: '新疆辣皮子牛肉三明治免单券', soldOut: true },
    { img: 'assets/img/prize-cup-quan.png',   badge: '共30000份', tag: '',      name: '全场自提饮品免单券',         soldOut: true },
    { img: 'assets/img/prize-cup-99.png',     badge: '共10000份', tag: '',      name: '9.9元兑换券—指定自提饮品',   soldOut: false },
    { img: 'assets/svg/prize-donut.svg',      badge: '共333份',   tag: '免单券', name: '全场甜品简餐免单券',         soldOut: true },
    { img: 'assets/svg/prize-kingcard.svg',   badge: '共333份',   tag: '',      name: '瑞王卡-体验卡',              soldOut: true },
    { img: 'assets/svg/prize-exchange.svg',   badge: '共10000份', tag: '兑换券', name: '0.01元杯品盲盒兑换券',       soldOut: true },
  ],

  /** 幸运星期三 超值限时购（演示商品；杯图为瑞幸官方风格杯插画 assets/img/cup-blue.webp） */
  flashSale: [
    { img: 'assets/img/cup-blue.webp', name: '生椰拿铁',   desc: '经典爆款 日限100杯', price: '9.9',  origin: '¥19.9' },
    { img: 'assets/img/cup-blue.webp', name: '橙C美式',    desc: '果咖清新 日限80杯',  price: '7.7',  origin: '¥16.9' },
    { img: 'assets/img/cup-blue.webp', name: '厚乳拿铁',   desc: '醇厚丝滑 日限60杯',  price: '12.9', origin: '¥22.9' },
  ],

  /** 活动规则（演示文案） */
  rules: [
    '【演示说明】本页面为前端技术演示 Demo，非瑞幸咖啡官方活动页面，所有奖品、次数、播报均为本地演示数据，不产生真实权益。',
    '1. 活动时间：演示环境长期有效（真实活动以官方页面为准）。',
    '2. 参与方式：活动期间进入页面，点击九宫格中心「抽免单」按钮即可参与抽奖，每人每天限抽 1 次（演示数据）。',
    '3. 奖品发放：抽中奖品后将发放至「我的奖品」，可点击页面右侧「我的奖品」查看（本地演示，仅保存在当前浏览器）。',
    '4. 奖品使用：中奖后请在有效期内使用，奖品不可折现、不可转赠。',
    '5. 其他：如对活动有疑问，请联系门店伙伴。本 Demo 不收集任何个人信息。',
  ],

  /** 文案常量 */
  texts: {
    drawBtnMain: '抽免单',
    drawBtnCountPrefix: '剩余抽奖次数',
    drawBtnEmpty: '次数已用完',
    drawBtnEmptyHint: '明天再来吧～',
    winTitle: '恭喜你中奖了！',
    winTip: '奖励已发放至「我的奖品」',
    winBtn: '立即领取',
    goDrinkToast: '演示环境：此处将跳转点单页（本地演示，不产生真实订单）☕',
    emptyCountToast: '今日抽奖次数已用完，明天再来吧～',
    myPrizesTitle: '我的奖品',
    myPrizesEmpty: '暂无奖品，快去抽奖吧！',
    rulesTitle: '活动规则',
    poolTitle: '本期奖品池',
    flashSaleTitle1: '幸运星期四',
    flashSaleTitle2: '超值',
    flashSaleTitle3: '限时购',
    flashSaleBtn: '立即抢购',
    flashSaleToast: '演示环境：此处将跳转限时购页（本地演示）',
  },
};
