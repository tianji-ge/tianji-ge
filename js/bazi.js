// 八字排盘算法（公历生日 + 时辰 → 四柱八字 + 五行）
// 依据：干支纪年以立春为界；月柱以二十四节气为界（五虎遁）；日柱以儒略日推算；时柱以五鼠遁。
// 适用范围：1900–2100 年。仅供传统文化参考与娱乐，不作任何命运定论。
(function () {
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const WX_GAN = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  // 地支五行：子亥水，寅卯木，巳午火，申酉金，辰戌丑未土
  const WX_ZHI = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  const ZHI_SHUXIANG = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };

  const sTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];

  function getTerm(y, n) {
    const off = 31556925974.7 * (y - 1900) + sTermInfo[n - 1] * 60000;
    const d = new Date(off + Date.UTC(1900, 0, 6, 2, 5));
    return d.getUTCDate();
  }

  // 节气所在日期（month 固定）
  const TERM_MONTH = { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9, 19: 10, 21: 11, 23: 12 };
  function termDate(y, n) {
    return new Date(y, TERM_MONTH[n] - 1, getTerm(y, n));
  }

  function gzIndex(jdn) {
    // 干支序号 0=甲子
    return ((jdn + 49) % 60 + 60) % 60;
  }

  function gregorianToJDN(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
  }

  // 时辰 → 时支序号
  function hourToZhi(h) {
    // 子 23-1, 丑 1-3 ... 以 子=0
    const h2 = (h + 1) % 24; // 23,0 -> 0; 1,2 -> 2? need care
    // 标准：23-1 子, 1-3 丑, 3-5 寅, 5-7 卯, 7-9 辰, 9-11 巳, 11-13 午, 13-15 未, 15-17 申, 17-19 酉, 19-21 戌, 21-23 亥
    let idx;
    if (h === 23 || h < 1) idx = 0;
    else if (h < 3) idx = 1;
    else if (h < 5) idx = 2;
    else if (h < 7) idx = 3;
    else if (h < 9) idx = 4;
    else if (h < 11) idx = 5;
    else if (h < 13) idx = 6;
    else if (h < 15) idx = 7;
    else if (h < 17) idx = 8;
    else if (h < 19) idx = 9;
    else if (h < 21) idx = 10;
    else idx = 11;
    return idx;
  }

  const SHICHEN = ['子时(23-01)', '丑时(01-03)', '寅时(03-05)', '卯时(05-07)', '辰时(07-09)', '巳时(09-11)', '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)'];

  function compute(y, m, d, h) {
    h = h == null ? 12 : h;
    const jdn = gregorianToJDN(y, m, d);
    const dayIdx = gzIndex(jdn);
    const dayGan = dayIdx % 10;
    const dayZhi = dayIdx % 12;

    // 年柱：以立春为界
    const lichunThis = termDate(y, 3); // 立春
    const ye = (new Date(y, m - 1, d) >= lichunThis) ? y : y - 1;
    const yearGan = ((ye - 4) % 10 + 10) % 10;
    const yearZhi = ((ye - 4) % 12 + 12) % 12;

    // 月柱：以节气为界
    const bd = new Date(y, m - 1, d);
    const boundaries = [
      { zhi: 2, start: termDate(ye, 3) },  // 寅 立春
      { zhi: 3, start: termDate(ye, 5) },  // 卯 惊蛰
      { zhi: 4, start: termDate(ye, 7) },  // 辰 清明
      { zhi: 5, start: termDate(ye, 9) },  // 巳 立夏
      { zhi: 6, start: termDate(ye, 11) }, // 午 芒种
      { zhi: 7, start: termDate(ye, 13) }, // 未 小暑
      { zhi: 8, start: termDate(ye, 15) }, // 申 立秋
      { zhi: 9, start: termDate(ye, 17) }, // 酉 白露
      { zhi: 10, start: termDate(ye, 19) }, // 戌 寒露
      { zhi: 11, start: termDate(ye, 21) }, // 亥 立冬
      { zhi: 0, start: termDate(ye, 23) },  // 子 大雪
      { zhi: 1, start: termDate(ye + 1, 1) }, // 丑 小寒
    ];
    let monthZhi = 1;
    for (let i = 0; i < boundaries.length; i++) {
      if (bd >= boundaries[i].start) monthZhi = boundaries[i].zhi;
    }
    const yueTou = (yearGan * 2 + 2) % 10;                 // 五虎遁：正月(寅)天干
    const monthGan = (yueTou + ((monthZhi - 2 + 12) % 12)) % 10;

    // 时柱
    const hourZhi = hourToZhi(h);
    const hourGan = ((dayGan % 5) * 2 + hourZhi) % 10;
    const shichen = SHICHEN[hourZhi];

    const pillars = [
      { name: '年柱', gan: yearGan, zhi: yearZhi },
      { name: '月柱', gan: monthGan, zhi: monthZhi },
      { name: '日柱', gan: dayGan, zhi: dayZhi },
      { name: '时柱', gan: hourGan, zhi: hourZhi },
    ];
    const bazi = pillars.map(p => GAN[p.gan] + ZHI[p.zhi]).join(' ');

    // 五行统计
    const chars = [
      { g: yearGan, z: yearZhi }, { g: monthGan, z: monthZhi },
      { g: dayGan, z: dayZhi }, { g: hourGan, z: hourZhi },
    ];
    const wx = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    chars.forEach(c => {
      wx[WX_GAN[c.g]]++;
      wx[WX_ZHI[c.z]]++;
    });
    const dayMaster = WX_GAN[dayGan];
    const wxList = Object.entries(wx).sort((a, b) => b[1] - a[1]);
    const max = wxList[0][1];
    const min = wxList[wxList.length - 1][1];
    const strong = wxList.filter(x => x[1] === max).map(x => x[0]);
    const weak = wxList.filter(x => x[1] === min).map(x => x[0]);

    const shuxiang = ZHI_SHUXIANG[ZHI[yearZhi]];

    let summary = `日主为${GAN[dayGan]}，五行属${dayMaster}。`;
    if (weak.length && weak[0] !== dayMaster) {
      summary += `命局中${weak.join('、')}偏弱，或可在后天环境与方位上补益；`;
    }
    if (strong.length) {
      summary += `${strong.join('、')}较旺，性情中显其气。`;
    }
    summary += `八字乃先天之数，后天修养、环境与抉择方为人生主导。此结果仅供文化参考，切勿执迷。`;

    return {
      bazi, pillars, dayMaster, wuxing: wx, wxList, shuxiang, shichen,
      yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi, summary,
    };
  }

  window.Bazi = { compute, GAN, ZHI, termDate, WX_GAN, WX_ZHI };
})();
