// 九大测算模块引擎：八字算命 / 称骨算命 / 周易算命 / 八字运程 / 五行查询 / 九星论命 / 农历算命 / 鬼谷算命 / 生日算命
// 依据真实干支排盘与民间流传算法生成解读，仅供传统文化参考与娱乐，不作任何命运定论。
(function () {
  const D = () => window.FortuneData;
  const B = () => window.Bazi;
  const L = () => window.Lunar;

  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const WX_GAN = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const WX_ZHI = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const CN_D = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  // 十神：dayGan 对 otherGan
  function shiShen(dayGan, otherGan) {
    const rel = (otherGan - dayGan + 10) % 10; // 相对五行序：0同,1我生? 实际按五行
    // 五行序：木0 火1 土2 金3 水4
    const wG = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
    const dw = wG[dayGan], ow = wG[otherGan];
    const diff = (ow - dw + 5) % 5; // 0同,1我生,2我克,3克我,4生我
    const sameYY = ((dayGan % 2) === (otherGan % 2));
    if (diff === 0) return sameYY ? '比肩' : '劫财';
    if (diff === 1) return sameYY ? '食神' : '伤官';
    if (diff === 2) return sameYY ? '偏财' : '正财';
    if (diff === 3) return sameYY ? '七杀' : '正官';
    return sameYY ? '偏印' : '正印';
  }

  function fmtWeight(w) {
    const liang = Math.floor(w);
    const qian = Math.round((w - liang) * 10);
    const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let s = '';
    if (liang > 0) s += (liang === 1 ? '一' : CN[liang]) + '两';
    if (qian > 0) s += (s ? ' ' : '') + CN[qian] + '钱';
    return s || '一两';
  }

  // ===================== 1. 八字算命 =====================
  function bazi(input) {
    const b = B().compute(input.y, input.m, input.d, input.h);
    const dm = b.dayGan, dmWx = b.dayMaster;
    const others = [b.yearGan, b.monthGan, b.hourGan];
    const shiShenCount = {};
    [b.yearGan, b.monthGan, b.hourGan].forEach(g => { const s = shiShen(dm, g); shiShenCount[s] = (shiShenCount[s] || 0) + 1; });
    const topSS = Object.entries(shiShenCount).sort((a, c) => c[1] - a[1])[0];
    const wxList = b.wxList;
    const strongest = wxList[0][0], weakest = wxList[wxList.length - 1][0];
    const FD = D();

    const panel = [
      ['四柱八字', b.bazi],
      ['日主', GAN[dm] + '（' + dmWx + '）'],
      ['生肖', b.shuxiang],
      ['五行', Object.entries(b.wuxing).filter(x => x[1] > 0).map(x => x[0] + x[1]).join(' ') + (wxList.some(x => x[1] === 0) ? '　缺' + wxList.filter(x => x[1] === 0).map(x => x[0]).join('、') : '')]
    ];

    const paras = [];
    paras.push('【命局总论】你这盘八字，四柱为「' + b.bazi + '」。日主' + GAN[dm] + '，属' + dmWx + '。' + FD.DAYGAN_TXT[dm] + '从盘面看，年柱承载祖上根基，月柱司掌青年门庭，日柱坐守自身与配偶，时柱关照晚景与子息，四柱之间生克流转，构成了你独一无二的命盘底色。这一盘不是复制品，正因四柱组合千变万化，同样的日主，落在不同月令时辰，命局气象便截然不同——所以下面这些话，只对你这一盘说。');
    paras.push('【格局气象】盘面五行分布：' + Object.entries(b.wuxing).map(x => x[0] + ' ' + x[1] + '位').join('，') + '。' + FD.WX_STRONG[strongest] + (weakest !== strongest ? ('同时' + weakest + '气偏弱，' + FD.WX_WEAK_ADVICE[weakest]) : '五行俱全，气场流通，是难得的均衡之象。') + (topSS ? ('十神之中以「' + topSS[0] + '」最为得力，' + FD.SHISHEN_YUN[topSS[0]].split('：')[1] + '它在你的盘里不是客星，而是常驻的主事之星。') : ''));
    paras.push('【性情底色】' + FD.HUNYIN_TXT[dmWx] + '为人处世方面，你' + (dm % 2 === 0 ? '偏阳刚之性，遇事敢当，作风明快' : '偏阴柔之智，遇事沉得住气，谋定而后动') + '，这正是' + GAN[dm] + '日主最典型的行事印记。身边人给你的评价往往两极：懂你的人赞你有原则，不懂你的人嫌你有脾气——这恰恰说明你活得有棱角，没有磨成千人一面的圆石。');
    paras.push('【事业取向】' + FD.SHIYE_TXT[dmWx] + '结合你盘里' + strongest + '气得势的特点，做主导型、创造型的角色比做被动执行更适合你。三十岁前不妨多试多闯，把本事变成本钱；三十岁后聚焦深耕，事业曲线会明显抬头。记住：你这盘的贵人在「专」不在「杂」，一门精熟，胜过十样都会。');
    paras.push('【财缘福禄】你的财气走的是「' + (b.wuxing['金'] >= 3 || b.wuxing['土'] >= 3 ? '厚积' : '活络') + '」一路——' + (b.wuxing['金'] >= 3 || b.wuxing['土'] >= 3 ? '命里财库稳，赚多赚少都存得下，中年后不动产与积蓄渐丰，是越老越有钱盘的走向。' : '命里财如活水，机会多、来路广，但也容易来得快去得快，学会落袋为安，是你一生的财务功课。') + '正财靠双手，偏财靠眼光，你这盘宜以正财立身、偏财添彩，不可本末倒置。');
    paras.push('【大师叮嘱】这一盘的底子' + (wxList[0][1] - wxList[4][1] <= 2 ? '均衡大气，属于闷声发福的类型——不显山露水，但根基扎实' : '特征鲜明，属于扬长避短的类型——把旺的那口气用足，把弱的那处补上，命盘就活了') + '。命是底盘，运是路况，方向盘终究在你手里：立身正、交友慎、遇事稳，你的命盘上限，远比你自己以为的更高。此解仅供传统文化参考，人生走向仍在人为。');
    return { title: '八字精批', panel, paras };
  }

  // ===================== 2. 称骨算命 =====================
  function chenggu(input) {
    const lu = L().solarToLunar(new Date(input.y, input.m - 1, input.d));
    const FD = D();
    // 农历年干支序
    const gz = Math.floor(((lu.year - 4) % 60 + 60) % 60);
    const yw = FD.CG_YEAR[gz];
    const mw = FD.CG_MONTH[lu.month - 1];
    const dw = FD.CG_DAY[lu.day - 1];
    const hb = B().compute(input.y, input.m, input.d, input.h);
    const hw = FD.CG_HOUR[hb.hourZhi];
    const total = Math.round((yw + mw + dw + hw) * 10) / 10;
    const key = total.toFixed(1);
    const verse = FD.CG_VERSE[key] || '骨格清奇世所稀，福缘深厚自天机。勤修善念根基固，自有祥云绕舍飞。';

    const panel = [
      ['农历生日', lu.cnMonth + lu.cnDay + '（' + lu.ganZhiYear + '年 ' + lu.zodiac + '）'],
      ['年骨', fmtWeight(yw)], ['月骨', fmtWeight(mw)], ['日骨', fmtWeight(dw)], ['时骨', fmtWeight(hw)],
      ['总骨重', fmtWeight(total) + '（' + key + ' 两）']
    ];

    const grade = total >= 5.0 ? '重' : (total >= 3.6 ? '中' : '轻');
    const paras = [];
    paras.push('【称骨来历】此法托名唐代袁天罡，以农历年、月、日、时各配骨重，四骨相加，得一命之骨重，再以歌诀断之。你的农历生辰为' + lu.cnMonth + lu.cnDay + '，生于' + lu.ganZhiYear + '年（属' + lu.zodiac + '）。四骨合计：年' + fmtWeight(yw) + '、月' + fmtWeight(mw) + '、日' + fmtWeight(dw) + '、时' + fmtWeight(hw) + '，共得' + fmtWeight(total) + '。此盘骨重在你这一代人中并不常见，骨重之数，量的是命局的「分量」——不是富贵的唯一标尺，却是古人千年观察的一把尺子。');
    paras.push('【称骨歌诀】古歌有云：「' + verse.split('。')[0] + '。' + verse.split('。')[1] + '。」这四句是此骨重的总纲，字字有讲究：前两句说你命局的底色，后两句指你运势的走向。歌诀为古人口传千年而来，读它不要只看字面的吉凶，要看它提醒你什么——凡是好的，去乘势；凡是险的，去规避，这便是称骨算命真正的作用。');
    paras.push('【骨相细断】你的骨重属「' + grade + '骨」一路。' + (grade === '重' ? '骨重者，命局承载大：能扛事、能聚财、能撑起一个家族的格局。古书说「骨重福厚」，你这盘在中年之后的走势会明显优于早年，属于先修根、后结果的命。' : grade === '中' ? '骨居中者，命局最讲平衡：一生有起有落，但每一步都踩得实。你既享得了顺境，也扛得住逆境，这种「抗压性」正是中骨之命最值钱的本钱。' : '骨轻者，命局灵秀：祖荫虽薄，胜在身轻脑快，靠自己的巧思与勤勉白手起家。古法有言「骨轻志不轻」，你这盘的后天修为，比先天骨重重要得多。') + '四骨之中，你' + (yw >= dw && yw >= mw && yw >= hw ? '年骨最重，祖上与根基给你的托举最厚' : mw >= dw && mw >= hw ? '月骨最重，青年至中年的运程是你一生的黄金段' : dw >= hw ? '日骨最重，自身与配偶宫的分量最足，中年发力后劲十足' : '时骨最重，晚景与子息宫最有看头，越老越有福') + '。');
    paras.push('【运势节奏】以骨重推运：你的一生大约分三段——' + (grade === '重' ? '早年蓄势（三十岁前根基期，宜学本事、攒人品），中年发力（三十至五十，事业财库齐开，是称骨歌里「后来财源滚滚」的兑现期），晚年纳福（五十之后家业稳固，儿孙有靠）。' : grade === '中' ? '早年磨砺（三十岁前多学多做，运程虽有起伏但步步有得），中年转型（三十至五十，抓一次大机遇，命局便上一个台阶），晚年安稳（五十之后心宽福厚，细水长流）。' : '早年流徙（三十岁前多动多变，走的是「以动养运」的路），中年立定（三十至五十，选定一门深耕，越专注越出成绩），晚年回甘（五十之后，早年种下的因逐一结果）。') + '节奏对了，运势便顺；节奏错了，好运也会擦肩而过。');
    paras.push('【大师叮嘱】称骨之法重在「知重而修」：骨重是底盘，心性是方向盘。你这盘' + (total >= 4.5 ? '骨相本佳，再修德行，福泽更绵长' : '骨相有起伏，正合「命自我立」四字——你的每一步踏实，都在给自己的骨重「添分量」') + '。此解承民间传统算法整理，仅供文化参考与自省之用，切莫因歌诀字面吉凶而喜忧过度。');
    return { title: '称骨算命', panel, paras };
  }

  // ===================== 3. 周易算命（梅花易数起卦） =====================
  function zhouyi(input) {
    const lu = L().solarToLunar(new Date(input.y, input.m - 1, input.d));
    const hb = B().compute(input.y, input.m, input.d, input.h);
    const FD = D();
    const yz = (lu.year - 4) % 12 + 1; // 年支序 1-12
    const upIdx = (yz + lu.month + lu.day - 1) % 8;
    const lowIdx = (yz + lu.month + lu.day - 1 + hb.hourZhi + 1) % 8;
    const dong = (yz + lu.month + lu.day + hb.hourZhi + 1) % 6 + 1;
    const gua = FD.GUA64[upIdx + '' + lowIdx] || ['乾坤之象', '阴阳相济，刚柔并用手'];
    const guaName = gua[0], guaNote = gua[1];
    const upNat = FD.GUA_TRIG_NAT[upIdx], lowNat = FD.GUA_TRIG_NAT[lowIdx];

    const panel = [
      ['起卦方式', '梅花易数·生辰起卦'],
      ['本卦', guaName + '（上' + upNat + '下' + lowNat + '）'],
      ['动爻', '第' + ['一','二','三','四','五','六'][dong - 1] + '爻动'],
      ['卦气', FD.GUA_TRIG[upIdx] + '上' + FD.GUA_TRIG[lowIdx] + '下']
    ];

    const paras = [];
    paras.push('【起卦缘由】《周易》有言：易有太极，是生两仪，两仪生四象，四象生八卦。此卦不用摇钱、不用掷筊，以你的生辰为「数」起卦——农历' + lu.cnMonth + lu.cnDay + '，年支' + ZHI[((lu.year - 4) % 12 + 12) % 12] + '，配以时辰之数，得本卦「' + guaName + '」，第' + dong + '爻动。古人说「数从心生，卦由数起」，你出生那一刻的天地之数，本就与你的一生气息相通；这一卦，是替你把那一刻的天地密码重新翻开来看。');
    paras.push('【卦象总纲】「' + guaName + '」，上卦为' + upNat + '、下卦为' + lowNat + '，卦义曰：' + guaNote + '。上卦' + upNat + '主外在境遇，下卦' + lowNat + '主内在心性——你这一卦，外境是' + upNat + '之象，内质是' + lowNat + '之德。' + (upIdx === lowIdx ? '上下同象，为八纯卦之一：性情表里如一，气质纯粹，一生做事讲究一个「正」字，路子走得直，福报也来得稳。' : '上下异象，刚柔互济：你的性格里有两种力量在对话，遇强则能守，遇柔则能进，这种「两面性」恰是你应对复杂世事的看家本领。'));
    paras.push('【动爻示变】第' + dong + '爻动，是这一卦的「消息之门」。易之道，唯变所适：动爻所在，便是你命局中最活跃的变数。' + (dong <= 2 ? '动在初二爻，变在根基——你的学业、专业与立身之本，是此生反复打磨的重心，根基一深，万丈高楼自来。' : dong <= 4 ? '动在三、四爻，变在中枢——人际、事业、家庭这三者的平衡，是你一生的主战场，经营好中间这段，卦气自顺。' : '动在五上爻，变在高处——名望、格局与人生天花板，是你此生的修炼场，眼界有多高，卦象就能撑多远。') + '此爻之动提醒你：人生不是算出来的，是变出来的，顺势而变者昌。');
    paras.push('【卦断人生】以卦断你此生气象：「' + guaName + '」之命，' + (['乾','兑','离'].includes(FD.GUA_TRIG[upIdx]) ? '带阳明之气，行事宜光明正大，名声是你的开路先锋' : ['震','巽'].includes(FD.GUA_TRIG[upIdx]) ? '带动进之气，行事宜乘势而动，时机是你的胜负之手' : '带沉静之气，行事宜稳扎稳打，根基是你的立命之本') + '。三十岁前观卦养德，多学多做少计较；三十岁后以卦行事，该进则进、该止则止。你这一卦的大格局，藏在' + guaNote + '八个字里——读懂它，比多求十支签都管用。');
    paras.push('【大师叮嘱】《系辞》云：「积善之家，必有余庆。」卦是天地给你的镜子，照见的是此刻的势，不是一生的判词。善用此卦者，胜在「知机」二字：知进退之机，知得失之机，知取舍之机。此解以传统易学框架推演，仅供文化参考，决策仍在你自己。');
    return { title: '周易命卦', panel, paras };
  }

  // ===================== 4. 八字运程（大运·流年） =====================
  function yuncheng(input) {
    const b = B().compute(input.y, input.m, input.d, input.h);
    const FD = D();
    const male = input.gender === '男';
    const yangYear = b.yearGan % 2 === 0;
    const forward = (male && yangYear) || (!male && !yangYear);
    // 起运岁数（近似：顺数至下一节 / 逆数至上一节，三天折一年）
    const birth = new Date(input.y, input.m - 1, input.d);
    const JIES = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]; // 节 index
    let nearestDiff = 1e9;
    for (const jn of JIES) {
      for (const yy of [b.yearGan >= 0 ? input.y : input.y, input.y + 1, input.y - 1]) {
        try {
          const td = B().termDate(yy, jn);
          const diff = Math.abs((td - birth) / 86400000);
          if (diff < nearestDiff) nearestDiff = diff;
        } catch (e) {}
      }
    }
    const startAge = Math.max(1, Math.round(nearestDiff / 3));
    // 大运干支
    const dayuns = [];
    for (let i = 1; i <= 8; i++) {
      const g = ((b.monthGan + (forward ? i : -i)) % 10 + 10) % 10;
      const z = ((b.monthZhi + (forward ? i : -i)) % 12 + 12) % 12;
      dayuns.push({ age: startAge + (i - 1) * 10, gan: g, zhi: z, ss: shiShen(b.dayGan, g) });
    }
    const nowYear = 2026;
    const liunianGZ = ((nowYear - 4) % 60 + 60) % 60;
    const liunianSS = shiShen(b.dayGan, liunianGZ % 10);

    const panel = [
      ['四柱', b.bazi],
      ['大运方向', forward ? '顺行' : '逆行'],
      ['起运', '约 ' + startAge + ' 岁起运'],
      ['' + nowYear + ' 流年', GAN[liunianGZ % 10] + ZHI[liunianGZ % 12] + '（' + liunianSS + '年）']
    ];

    const paras = [];
    paras.push('【运程总说】命是静态的盘，运是流动的河。你生于' + GAN[b.yearGan] + ZHI[b.yearZhi] + '年，属' + (yangYear ? '阳年' : '阴年') + (male ? '男命' : '女命') + '，大运' + (forward ? '顺' : '逆') + '行，约 ' + startAge + ' 岁起运。古人讲「命好不如运好」——再好的命盘，运不帮扶也是英雄无用武之地；寻常的命盘，遇上几十年顺风顺水，一样能干出一番天地。你这一盘的大运走势，正是下面要细说的重点。');
    paras.push('【八步大运】你的大运每十年一换，' + (forward ? '顺排' : '逆排') + '自月柱' + GAN[b.monthGan] + ZHI[b.monthZhi] + '：' + dayuns.map(d => GAN[d.gan] + ZHI[d.zhi] + '（' + d.age + '起，' + d.ss + '）').join('、') + '。这八步运，就是你这辈子的八段路：' + dayuns.slice(0, 3).map(d => FD.SHISHEN_YUN[d.ss].split('：')[0] + '运先行').join('、') + '，走的是' + (forward ? '渐入佳境' : '先扬后稳') + '的节奏——早运定方向，中运见真章。');
    paras.push('【黄金大运】细看八步运中最旺的一段：' + (() => { const best = dayuns.slice(2, 6).sort((a, c) => ({ '正财': 5, '偏财': 5, '正官': 4, '食神': 4, '正印': 4 }[a.ss] || 3) - ({ '正财': 5, '偏财': 5, '正官': 4, '食神': 4, '正印': 4 }[c.ss] || 3))[0]; return GAN[best.gan] + ZHI[best.zhi] + '大运（' + best.age + ' 岁至 ' + (best.age + 9) + ' 岁），此运十年走' + best.ss + '，' + FD.SHISHEN_YUN[best.ss].split('：')[1] + '这是你一生的黄金窗口：该布局的提前布局，该出手的果断出手，十年窗口，错过再等十年。'; })());
    paras.push('【' + nowYear + ' 流年】今年' + GAN[liunianGZ % 10] + ZHI[liunianGZ % 12] + '，对你而言是「' + liunianSS + '」之年。' + FD.SHISHEN_YUN[liunianSS].split('：')[1] + '流年之事多在下半年应验，上半年宜布局，下半年宜收获。' + (liunianSS.includes('财') ? '财星高照之年，最忌眼高手低：机会要抓，但合同要看清，落袋才为安。' : liunianSS.includes('官') ? '官星主事之年，名利皆有分，最宜按部就班，一步一个脚印往上升。' : '此年宜蓄不宜泄：多学、多存、多陪家人，把根基养厚，来年自有一番新气象。'));
    paras.push('【未来三年】往后三年走势：明年起运星渐转，宜稳中带进；后年气象一新，是重新布局的好年头；第三年收官盘点，此三年恰是一个小周期——第一年蓄力、第二年发力、第三年收力，踩准节奏，胜过盲目狂奔。你的大运曲线整体' + (forward ? '向上' : '由动转稳') + '，中年之后更见厚度。');
    paras.push('【大师叮嘱】运程之法，重在「知运而动」：好运时全力进取，平运时修德蓄能，滞运时守正待时。天下没有十年全坏的运，也没有十年全好的运——真正的命理高手，不是改命，而是在对的时间做对的事。此解按传统子平大运法推演，仅供参考。');
    return { title: '八字运程', panel, paras };
  }

  // ===================== 5. 五行查询 =====================
  function wuxing(input) {
    const b = B().compute(input.y, input.m, input.d, input.h);
    const FD = D();
    const nayin = FD.NAYIN[Math.floor(((b.yearGan * 12 + b.yearZhi) % 60) / 2)];
    const wx = b.wuxing;
    const wxList = b.wxList;
    const max = wxList[0][1], min = wxList[4][1];
    const strong = wxList.filter(x => x[1] === max).map(x => x[0]);
    const weak = wxList.filter(x => x[1] === min).map(x => x[0]);
    const missing = wxList.filter(x => x[1] === 0).map(x => x[0]);
    const strongDm = strong.includes(b.dayMaster);
    const xiyong = strongDm ? { '木': '金水', '火': '水土', '土': '金水', '金': '火水', '水': '土木' }[b.dayMaster] : ({ '木': '水木', '火': '木火', '土': '火土', '金': '土金', '水': '金水' }[b.dayMaster]);

    const bar = ['金', '木', '水', '火', '土'].map(w => w + ' ' + wx[w]).join('　');
    const panel = [
      ['八字五行', bar],
      ['日主', GAN[b.dayGan] + '（' + b.dayMaster + '）'],
      ['年命纳音', nayin],
      ['喜用倾向', xiyong.split('').join('、')]
    ];

    const paras = [];
    paras.push('【五行排布】你八字「' + b.bazi + '」的五行分布为：' + bar + '（以干支本气计）。' + (missing.length ? '值得留意的是，你的命局缺' + missing.join('、') + '——所谓「缺」，不是灾难，而是提醒：缺者宜补，补之有道。' + FD.WX_WEAK_ADVICE[missing[0]] : '五行俱全，流通有情，是命理上很讨喜的格局——气场不偏枯，人生路走得稳。') + '五行之数，量的是先天禀赋的厚薄：哪一行旺，哪一行的性情就在你身上活得鲜明。');
    paras.push('【旺衰之辨】你的命局' + strong.join('、') + '气最旺、' + weak.join('、') + '气最弱。' + FD.WX_STRONG[strong[0]] + (weak[0] !== strong[0] ? '而' + weak.join('、') + '气偏弱之处，恰是你需要后天留意的短板——' + FD.WX_WEAK_ADVICE[weak[0]] : '') + '旺衰不是吉凶：旺有旺的用法，弱有弱的补法，关键是知己之短，扬己之长。');
    paras.push('【喜用神断】以日主' + GAN[b.dayGan] + '（' + b.dayMaster + '）论强弱：日主' + (strongDm ? '偏强，喜克泄耗，用' : '偏弱，喜生扶，用') + xiyong.split('').join('、') + '之气。落到生活里：' + xiyong.split('').map(w => ({ '金': '白色与金属质感之物、正西与西北方位', '木': '绿色与草木之境、正东与东南方位', '水': '黑蓝色与流动之境、正北方位', '火': '红紫色与光明之境、正南方位', '土': '黄色与厚重之物、中宫与西南方位' }[w])).join('；') + '——衣饰、居家、办公坐向，皆可循此微调，以顺命局之气。');
    paras.push('【纳音本命】你生于' + GAN[b.yearGan] + ZHI[b.yearZhi] + '年，年命纳音「' + nayin + '」。' + nayin.slice(-1) + '命之性：' + ({ '金': '金命人重义，话不多但守诺，风骨在内', '木': '木命人重仁，向上生长，最不肯服输', '水': '水命人重智，灵活变通，随方就圆', '火': '火命人重礼，热情开朗，感染力强', '土': '土命人重信，厚道稳当，值得托付' }[nayin.slice(-1)]) + '。纳音与日主五行相参而看，一表一里：纳音看你的先天底色，日主看你的立身之气，两相印证，命象更清。');
    paras.push('【五行调养】五行亦应五脏：' + ({ '金': '金应肺，秋日宜养，少辛多酸，呼吸系统的保养是你一生的功课', '木': '木应肝，春日宜养，戒怒戒躁，早睡早起最养肝气', '水': '水应肾，冬日宜养，少熬夜多蓄精，肾水足则耳聪目明', '火': '火应心，夏日宜养，静心安神，切忌大喜大悲', '土': '土应脾，长夏宜养，饮食有节，思虑过度最伤脾' }[b.dayMaster]) + '。养生即养运——五行流通之人，气色好、精神足，运势自然不差。');
    paras.push('【大师叮嘱】五行之法，不是缺什么就死补什么，而是求一个「流通」二字：让旺者泄其秀、弱者得其生，命局之气转起来，人生便顺起来。穿衣配色、方位朝向、行业选择，皆是顺气的小法门，信则有感，用则有验，仅供参考。');
    return { title: '五行查询', panel, paras };
  }

  // ===================== 6. 九星论命 =====================
  function jiuxing(input) {
    const FD = D();
    const ds = String(input.y).split('').reduce((a, c) => a + (+c), 0);
    let dsr = ds; while (dsr > 9) dsr = String(dsr).split('').reduce((a, c) => a + (+c), 0);
    if (dsr === 0) dsr = 9;
    let star = 11 - dsr;
    while (star > 9) star -= 9; while (star < 1) star += 9;
    const s = FD.JIUXING[star - 1];
    const nowYear = 2026;
    const yds = String(nowYear).split('').reduce((a, c) => a + (+c), 0);
    let yr = yds; while (yr > 9) yr = String(yr).split('').reduce((a, c) => a + (+c), 0);
    let nowStar = 11 - (yr || 9); while (nowStar > 9) nowStar -= 9; while (nowStar < 1) nowStar += 9;
    const gzY = ((input.y - 4) % 60 + 60) % 60;

    const panel = [
      ['本命星', s.name + '（' + s.wx + '）'],
      ['本命方位', s.dir],
      ['星曜主事', s.tag],
      ['' + nowYear + ' 年值星', FD.JIUXING[nowStar - 1].name]
    ];

    const paras = [];
    paras.push('【九星来历】九星论命源自上古洛书九宫：一白、二黑、三碧、四绿、五黄、六白、七赤、八白、九紫，九星轮值，各主一年之气。你生于' + input.y + '年，天地之气归于「' + s.name + '」，此星便是你的本命星，五行属' + s.wx + '，位居' + s.dir + '。九星论命与八字不同：八字看四柱生克，九星看当年天星入命——它更像你出生那一年，天上为你盖下的一枚印章，印记之下，藏着你的性情与运数。');
    paras.push('【本命星性】' + s.text + '综合而论，你这颗星的关键词是：' + s.tag + '。九星之性，比八字更「外显」——它决定你在人群中的第一印象、你的行事风格、以及你最容易被哪类机会眷顾。读懂自己的本命星，就是读懂你在这个世界上的「出厂设定」。');
    paras.push('【星曜配命】' + s.wx + '星之人，' + ({ '水': '宜近水而居，宜以智取胜；北方位是你的本命吉方，黑色蓝色系是你的护身色', '木': '宜近文近教，宜以仁立身；东与东南方位是你的本命吉方，绿色系是你的护身色', '火': '宜近光近热，宜以礼动人；南方位是你的本命吉方，红色紫色系是你的护身色', '土': '宜近土近实，宜以信立业；西南与东北方位是你的本命吉方，黄色米色系是你的护身色', '金': '宜近规近制，宜以义服人；西与西北方位是你的本命吉方，白色金色系是你的护身色' }[s.wx]) + '。事业方位上，' + s.tag.split('·')[1] + '是你此生最能发力的赛道，与其随大流，不如顺星而行。');
    paras.push('【' + nowYear + ' 值星】' + nowYear + ' 年天星轮值「' + FD.JIUXING[nowStar - 1].name + '」，与你本命' + s.name + '相配，' + ((nowStar % 3) === (star % 3) ? '星气相生相合：今年的天时站在你这边，宜进取、宜立事、宜把搁置的计划重新启动——这是顺势而为的一年。' : '星气有别，宜调不宜冲：今年不宜硬碰硬，多借力、多迂回，把节奏放缓半拍，反而走得更稳——这是以柔克刚的一年。') + '九星轮转，一年一变，知今年之气，便知今年该做什么、不该做什么。');
    paras.push('【九星大运】从大周期看，八白左辅星主运二十载，九紫右弼星正在接棒——离火九运之中，' + (s.wx === '火' ? '你这颗火命星正当运得令：文化、美学、心灵、光电、自媒体等「离火」行业全面抬头，你的星气与时代之气同频，这是几十年来你最好的窗口期。' : s.wx === '木' ? '你这颗木命星逢火运而秀：木生火，你的才华正是这个时代的燃料，宜多输出、多表达、多亮相，被看见就是你的运。' : '你这颗星在离火运中宜借火成事：文化包装、品牌打造、线上线下融合，凡能给传统行当「加光加温」的玩法，都旺你。'));
    paras.push('【大师叮嘱】九星之法贵在「顺星」：星是天的节奏，人是地的行者，踩准节奏的人，事半功倍。本命星不是宿命，而是禀赋——用对了是天赋，用错了是脾气。此解以紫白九星传统算法推演，仅供参考。');
    return { title: '九星论命', panel, paras };
  }

  // ===================== 7. 农历算命 =====================
  function nongli(input) {
    const lu = L().solarToLunar(new Date(input.y, input.m - 1, input.d));
    const FD = D();
    const zs = SHENGXIAO[(lu.year - 4) % 12];
    const mIdx = lu.month - 1, dIdx = lu.day - 1;

    const panel = [
      ['农历生辰', lu.cnYear + '年 ' + lu.cnMonth + lu.cnDay + (lu.isLeap ? '（闰）' : '')],
      ['生肖', zs],
      ['年柱干支', lu.ganZhiYear],
      ['月令·日辰', FD.NL_MONTH[mIdx].slice(2, 5) + ' · ' + CN_D[dIdx]]
    ];

    const paras = [];
    paras.push('【农历溯源】你的公历生日换算为农历：' + lu.cnYear + '年' + lu.cnMonth + lu.cnDay + (lu.isLeap ? '（闰月）' : '') + '，生肖属' + zs + '，年柱干支' + lu.ganZhiYear + '。农历是我们的老祖宗仰观天文、俯察物候定出的历法——月令讲生长收藏，日辰讲盈亏进退。以农历论命，看的是你与「天时」的契度：生于何月，得何月之气；生于何日，承何日之数。这一套，是刻在中国人骨子里的时间命理学。');
    paras.push('【月令之气】' + FD.NL_MONTH[mIdx]);
    paras.push('【日辰之数】你生于' + CN_D[dIdx] + '。' + FD.NL_DAY[dIdx] + '月令定你气质的大格局，日辰定你行事的细节奏——两者相合而看：' + FD.NL_MONTH[mIdx].slice(0, 6) + '所生，配' + CN_D[dIdx] + '之数，你这一生的路子，' + (dIdx < 10 ? '走得早也动得早，少年立志，青年出道，是「先飞」型的命' : dIdx < 20 ? '走得稳也站得稳，中年发力，厚积薄发，是「中坚」型的命' : '走得深也藏得深，大器晚成，越沉越香，是「后劲」型的命') + '。');
    paras.push('【生肖配月】属' + zs + '之人' + FD.NL_MONTH[mIdx].slice(2, 6) + '出生，传统上有「' + zs + '逢' + ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'][mIdx] + '」之说：生肖为你的本命属相，月令为你的气场底色，两者相配，' + ({ '鼠': '鼠性机敏，遇春月则灵气更足，一生不缺出路', '牛': '牛性勤恳，得土月则根基更深，一分耕耘一分获', '虎': '虎性威猛，逢山林之月则如虎添翼，事业格局大', '兔': '兔性温秀，得草木之月则文气更盛，人缘极旺', '龙': '龙性腾跃，逢水月则如龙得水，机遇常在流动中来', '蛇': '蛇性灵慧，得暖月则如蛇出洞，才华得以舒展', '马': '马性奔腾，逢旺月则日行千里，越忙越有奔头', '羊': '羊性温良，得安月则福泽绵长，家和是其命门', '猴': '猴性百变，逢生发之月则机变无穷，巧思一生', '鸡': '鸡性守信，得明亮之月则声名在外，贵人不断', '狗': '狗性忠义，得厚重之月则家业稳固，后福绵长', '猪': '猪性宽厚，逢丰足之月则衣食无忧，福气自来' }[zs]) + '。');
    paras.push('【命理节奏】以农历论你的运势节奏：早年看年柱，中年看月令，晚年看日辰。你年柱' + lu.ganZhiYear + '，' + ({ '鼠': '机变开路，早年多学多闯', '牛': '稳扎稳打，早年打底蓄力', '虎': '锐气逼人，早年敢想敢干', '兔': '灵秀内敛，早年以巧立身', '龙': '气象不凡，早年志存高远', '蛇': '心思深沉，早年谋定后动', '马': '奔腾不息，早年行走四方', '羊': '温润蓄福，早年广结善缘', '猴': '机敏百出，早年多艺在身', '鸡': '一诺千金，早年以信立名', '狗': '忠厚可靠，早年以勤补拙', '猪': '心宽体厚，早年福气暗藏' }[zs]) + '；中年' + FD.NL_MONTH[mIdx].slice(2, 6) + '之气主事，' + (['正月','二月','三月'].includes(['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'][mIdx]) ? '春气生发，中年宜乘势而上' : ['四月','五月','六月','七月'].includes(['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'][mIdx]) ? '夏秋之气盛，中年宜大展拳脚' : '秋冬之气藏，中年宜深耕蓄势') + '。');
    paras.push('【大师叮嘱】农历论命，最重「时令」二字：庄稼看节气，人生看月令，什么季节做什么事，便是对天时最大的敬重。你这一盘农历命，' + (dIdx % 3 === 0 ? '数理带「动」，一生宜动中求财，坐守反失机遇' : dIdx % 3 === 1 ? '数理带「稳」，一生宜稳中求进，急躁反误前程' : '数理带「巧」，一生宜以巧破局，蛮干不如巧干') + '。此解依传统农历民俗整理，仅供文化参考。');
    return { title: '农历论命', panel, paras };
  }

  // ===================== 8. 鬼谷算命 =====================
  function guigu(input) {
    const hb = B().compute(input.y, input.m, input.d, input.h);
    const FD = D();
    const yg = hb.yearGan;
    const g = FD.GUIGU_POEM[hb.hourZhi];
    const ganName = GAN[yg];
    const ganWx = WX_GAN[yg];
    const poemLines = g.poem.split('。');

    const panel = [
      ['年柱天干', ganName + '（' + ganWx + '）'],
      ['出生时辰', g.s],
      ['两头钳式', '以年干配时辰'],
      ['鬼谷断语', poemLines[0] + '，' + poemLines[1]]
    ];

    const paras = [];
    paras.push('【鬼谷来历】鬼谷子，战国奇人，纵横家之祖，相传著有「两头钳」论命之法：以出生年干为头、出生时辰为尾，两头相钳，中间夹出一个人的一生命象——故曰两头钳。你年干为' + ganName + '，属' + ganWx + '；生于' + g.s + '。年干是你命的头，管你的根基与祖荫；时辰是你命的尾，管你的晚景与归宿。两头一钳，中间几十年的路，便有了推演的坐标。');
    paras.push('【鬼谷诗断】' + g.desc + '诗曰：「' + g.poem + '。」这四句诗是这一盘的纲领：首句点你的天资，二句点你的心性，三句点你的早年路，末句点你的归宿处。逐句细品，会发现它说的不是「命好命坏」，而是「命的路数」——路数对了，平命也能走出好局；路数错了，好命也会走成僵局。');
    paras.push('【年干之性】年干' + ganName + '，' + ({ '甲': '甲木为栋梁，祖上有担当之气，你的家族血脉里藏着「顶事」的基因', '乙': '乙木为藤蔓，祖上多巧艺传家，你骨子里的韧劲是家传的', '丙': '丙火为太阳，祖上多热心人，你的光明磊落是家风所养', '丁': '丁火为灯烛，祖上或从业文教技艺，你的细致是家学渊源', '戊': '戊土为城墙，祖上重信守诺，你的厚重是家风底色', '己': '己土为田园，祖上勤俭持家，你的包容是家传的修养', '庚': '庚金为刀剑，祖上多刚毅之人，你的果决是血脉里的', '辛': '辛金为珠玉，祖上或有名望旧事，你的清贵气质有来处', '壬': '壬水为江河，祖上多走动经商，你的闯劲是家族记忆', '癸': '癸水为雨露，祖上心细如发，你的直觉敏锐是天生的' }[yg]) + '。年干之气与你' + g.s + '出生的时辰之气相合，构成你命局的「头尾呼应」：根基之气与归宿之气' + ((yg % 5 === hb.hourZhi % 2) ? '相协，一生路子顺，早年打下的底子晚景都能用上' : '互补，一生路子曲折，但正因曲折，两头的好处你都占全了') + '。');
    paras.push('【两头钳断】以两头钳法细断你的一生三段：早段（头运）——年干' + ganName + '之气主事，' + ({ '甲': '自立门户，不靠祖荫也敢闯', '乙': '以柔蓄势，人脉是早年最大的资产', '丙': '锋芒早露，少年得志亦招妒', '丁': '厚积细发，专业是早年的立身器', '戊': '稳字当头，早年多蓄力少冒进', '己': '以和为贵，早年广结善缘', '庚': '敢作敢当，早年多历练多担当', '辛': '内秀于心，早年宜磨技艺', '壬': '志在四方，早年多行走多见识', '癸': '慧心巧思，早年宜学一技傍身' }[yg]) + '；中段（钳运）——头尾相钳之处，正是中年，' + g.desc.slice(0, 30) + '，此段最要紧的是把早年所学变成中年所立；晚段（尾运）——' + g.s + '之气收束全局，晚景看' + ({ '水': '智慧与传承，儿孙中有聪慧者', '木': '仁德与荫泽，家声清正', '火': '名望与光彩，老来不减风范', '土': '田宅与安稳，家业有靠', '金': '威望与规矩，一门正气' }[WX_ZHI[hb.hourZhi] === '水' || WX_ZHI[hb.hourZhi] === '木' || WX_ZHI[hb.hourZhi] === '火' || WX_ZHI[hb.hourZhi] === '金' ? WX_ZHI[hb.hourZhi] : '土']) + '，归宿自有安顿。');
    paras.push('【大师叮嘱】鬼谷两头钳的精髓，在一个「钳」字：头尾相顾，首尾呼应——做事要善始善终，做人要有头有尾，这是这一法对你的最大启示。你这一盘，' + (g.poem.includes('福') || g.poem.includes('祥') || g.poem.includes('吉') ? '诗断带吉气，顺境时更要惜福积德' : '诗断带磨砺，逆境时切记诗中末句的转机') + '。诗诀承传统民俗整理推演，仅供文化参考，人生答卷终须自己书写。');
    return { title: '鬼谷两头钳', panel, paras };
  }

  // ===================== 9. 生日算命 =====================
  function shengri(input) {
    const FD = D();
    const digits = (String(input.y) + String(input.m).padStart(2, '0') + String(input.d).padStart(2, '0')).split('').reduce((a, c) => a + (+c), 0);
    let n = digits; while (n > 9) n = String(n).split('').reduce((a, c) => a + (+c), 0);
    const dayNum = input.d;
    const season = input.m <= 3 || input.m === 12 ? (input.m === 12 ? '冬' : '春') : input.m <= 6 ? '夏' : input.m <= 9 ? '秋' : '冬';
    const b = B().compute(input.y, input.m, input.d, 12);

    const panel = [
      ['生日数字', input.y + '-' + input.m + '-' + input.d],
      ['生命灵数', String(n)],
      ['出生季节', season],
      ['星座区间', ['摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯'][input.m - 1] + '座区间']
    ];

    const paras = [];
    paras.push('【生日密码】你的出生日期 ' + input.y + ' 年 ' + input.m + ' 月 ' + input.d + ' 日，将所有数字逐一相加，得 ' + digits + '，再化为单数，得生命灵数 ' + n + '。这个数字，西方称之为 Life Path Number，东方命理中也有类似的「命数」之说——两套体系殊途同归：出生之日，是天地给你写下的第一行代码。灵数 ' + n + '，便是你人格的底层算法，它影响你的思维模式、择业偏好、乃至缘分走向。');
    paras.push('【灵数天性】' + FD.LINGSHU[n]);
    paras.push('【季节烙印】你生于' + ({ '春': '春季——万物生发之季。春天出生的人，普遍带一股「新」气：好奇心强、接受力快、不容易被旧框架束缚。你的运势也常带「春」性：机会多在新的开始里，新城市、新行业、新关系，都是你的转运口', '夏': '夏季——烈日长风之季。夏天出生的人，普遍热力足、行动快、情绪浓。你的运势带「夏」性：怕闲不怕忙，忙碌中出成绩，安静中反而容易内耗。把自己放进有挑战的环境，是夏天命最好的活法', '秋': '秋季——硕果金风之季。秋天出生的人，普遍稳重、务实、有收获意识。你的运势带「秋」性：付出必有回响，最忌投机取巧。一步一个脚印攒下的东西，谁都拿不走', '冬': '冬季——藏锋养志之季。冬天出生的人，普遍沉静、深刻、耐得住寂寞。你的运势带「冬」性：大器晚成，越沉淀越有分量。年轻时看似慢半拍，其实是老天让你把根扎深' }[season]) + '。');
    paras.push('【日辰细断】你生于当月第 ' + dayNum + ' 日。日数在命理中主「行事的姿态」：' + (dayNum <= 10 ? '上旬出生者带「开创之姿」，凡事愿意打头阵，适合主导型角色，一生不惯跟在别人后面。' : dayNum <= 20 ? '中旬出生者带「协调之姿」，天生会找平衡点，适合协作型角色，一生把人聚在一起的本事最大。' : '下旬出生者带「收官之姿」，擅长把事做完整做漂亮，适合管理型角色，一生愈到后段愈见功力。') + '灵数 ' + n + ' 主管你的方向，日数主管你的打法——方向对、打法对，命局自然顺。');
    paras.push('【缘分与短板】灵数 ' + n + ' 之人在感情中最吸引的是' + ({ 1: '欣赏你果敢的同行者', 2: '需要你温柔以待的知心人', 3: '被你才华点亮的欣赏者', 4: '看重你踏实可靠的持家人', 5: '陪你说走就走的同路人', 6: '依恋你温暖担当的顾家人', 7: '与你灵魂共鸣的深谈者', 8: '与你并肩打江山的合伙人', 9: '被你大爱感召的同行者' }[n]) + '；而你此生要修的功课是' + ({ 1: '放下控制，学会倾听', 2: '守住立场，学会拒绝', 3: '收敛心神，学会聚焦', 4: '打开格局，学会变通', 5: '锚定目标，学会坚持', 6: '善待自己，学会放手', 7: '走出书斋，学会表达', 8: '松弛有度，学会享受', 9: '聚焦所爱，学会深耕' }[n]) + '。短板修好之日，就是运势上台阶之时。');
    paras.push('【大师叮嘱】生日算命之法，东西合参：灵数看天性，季节看气禀，日数看姿态，三者叠出一个立体的你。请记住：数字是参考，不是判决——同样的灵数 ' + n + '，有人活成了局限，有人活成了传奇，差别只在「知命而不认命」。此解仅供文化参考与自我探索之用。');
    return { title: '生日密码', panel, paras };
  }

  window.Fortune = { bazi, chenggu, zhouyi, yuncheng, wuxing, jiuxing, nongli, guigu, shengri };
})();
