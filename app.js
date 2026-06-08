const state = {
  route: "home",
  navOpen: false,
  assessment: {
    identity: "",
    direction: "",
    goal: "",
    answers: {}
  },
  result: null,
  selectedTaskId: "T01",
  careerTab: "jd",
  jd: {
    text: "",
    identity: "校招生",
    direction: "RAG",
    result: null,
    error: ""
  },
  work: {
    taskId: "T01",
    title: "",
    direction: "",
    background: "",
    body: "",
    focus: []
  },
  submission: null,
  errors: {}
};

const dimensions = [
  {
    id: "productJudgement",
    name: "AI 产品判断",
    short: "产品判断",
    risk: "容易把 AI 当默认解法，不能稳定判断场景是否真的需要 AI，以及成本、质量和风险如何取舍。"
  },
  {
    id: "requirementBreakdown",
    name: "需求拆解",
    short: "需求拆解",
    risk: "能描述功能，但较难拆清用户任务、流程边界、异常路径和可交付作品结构。"
  },
  {
    id: "dataExperiment",
    name: "数据与实验意识",
    short: "数据实验",
    risk: "被追问评估集、指标、失败 case 或线上反馈闭环时，回答会停留在概念层。"
  },
  {
    id: "technicalCollaboration",
    name: "技术协作理解",
    short: "技术协作",
    risk: "能复述技术名词，但不能和研发一起定位模型边界、失败来源和兜底策略。"
  },
  {
    id: "portfolioExpression",
    name: "作品表达能力",
    short: "作品表达",
    risk: "作品容易写成功能介绍，不能证明判断、取舍、验证和复盘能力。"
  }
];

const questions = [
  {
    id: "Q1",
    title: "当 JD 写“熟悉 RAG 产品或知识库问答”时，你通常会怎么理解？",
    dims: ["productJudgement", "technicalCollaboration"],
    options: [
      "只知道 RAG 是把资料接给大模型，但说不清细节。",
      "能解释检索增强生成的大致流程，但不知道怎么评估效果。",
      "能说出召回、重排、生成、引用来源和常见失败点。",
      "能把 RAG 拆成用户场景、数据源、检索策略、评估集和反馈闭环。"
    ]
  },
  {
    id: "Q2",
    title: "面对一个“用 AI 自动生成周报”的需求，你首先会判断什么？",
    dims: ["productJudgement", "requirementBreakdown"],
    options: [
      "先想页面长什么样。",
      "先找类似产品参考。",
      "先判断用户是否真的需要自动生成，以及输入数据是否足够。",
      "同时判断用户场景、AI 介入必要性、输入输出边界、失败风险和评估方式。"
    ]
  },
  {
    id: "Q3",
    title: "如果 Agent 连续两次调用工具失败，你会优先补什么设计？",
    dims: ["technicalCollaboration", "dataExperiment"],
    options: [
      "提示用户稍后再试。",
      "加一个“重新生成”按钮。",
      "增加失败原因提示和人工接管入口。",
      "设计失败分类、重试策略、人工兜底、用户告知和失败样本回流。"
    ]
  },
  {
    id: "Q4",
    title: "你要为 AI 搜索产品设计评估指标，会怎么做？",
    dims: ["dataExperiment"],
    options: [
      "看用户点击率和使用次数。",
      "加上用户满意度。",
      "区分相关性、真实性、覆盖率和响应速度。",
      "设计查询集、黄金答案、相关性评分、事实核查、人工抽检和线上反馈闭环。"
    ]
  },
  {
    id: "Q5",
    title: "当研发说“这个需求模型效果不稳定”时，你会怎么追问？",
    dims: ["technicalCollaboration", "requirementBreakdown"],
    options: [
      "问什么时候能优化好。",
      "问能不能换更好的模型。",
      "问不稳定出现在哪些输入、输出和用户场景。",
      "追问失败 case 分布、可接受阈值、兜底策略、评估样本和上线灰度方案。"
    ]
  },
  {
    id: "Q6",
    title: "你准备把一个 AI 项目写进作品集，最应该突出什么？",
    dims: ["portfolioExpression"],
    options: [
      "页面截图和功能列表。",
      "项目背景和自己做了哪些模块。",
      "用户问题、方案逻辑、指标变化和关键取舍。",
      "问题定义、AI 介入理由、技术边界、评估方法、失败复盘和面试追问准备。"
    ]
  },
  {
    id: "Q7",
    title: "如果你要做一个 2 小时训练任务，哪种交付物最能证明 AI PM 能力？",
    dims: ["portfolioExpression", "requirementBreakdown"],
    options: [
      "收集 10 篇相关资料链接。",
      "写一页产品介绍。",
      "写一个场景方案和基础流程。",
      "写出场景、AI 介入点、评估指标、失败 case、兜底方案和面试表达。"
    ]
  },
  {
    id: "Q8",
    title: "一个 AI 客服机器人上线后，用户投诉“答非所问”，你会先看什么？",
    dims: ["dataExperiment", "technicalCollaboration"],
    options: [
      "让模型回答得更礼貌。",
      "增加更多提示词。",
      "看问题类型、知识库覆盖和回答命中情况。",
      "拆分召回失败、理解失败、生成错误、业务规则缺失和人工转接失败。"
    ]
  },
  {
    id: "Q9",
    title: "当目标岗位要求“理解模型成本、延迟和质量取舍”时，你能做到什么程度？",
    dims: ["productJudgement", "dataExperiment"],
    options: [
      "知道大模型调用会有成本。",
      "能说不同模型价格和效果不同。",
      "能根据场景比较成本、延迟、准确率和用户体验。",
      "能写模型选择 memo，说明候选模型、评估样本、阈值、成本测算和降级策略。"
    ]
  },
  {
    id: "Q10",
    title: "面试官追问“你的 AI 产品如何持续变好”，你会怎么回答？",
    dims: ["dataExperiment", "portfolioExpression"],
    options: [
      "持续优化模型。",
      "收集用户反馈再迭代。",
      "建立反馈入口，定期分析失败 case。",
      "说明日志、用户反馈、人工标注、评估集更新、灰度实验和版本对比机制。"
    ]
  }
];

const levels = [
  {
    name: "L1 概念补课期",
    min: 0,
    max: 10,
    summary: "能识别一些 AI 名词，但还不能稳定转成产品判断。",
    advice: "先做基础场景拆解和 JD 翻译，不急着写复杂作品。"
  },
  {
    name: "L2 方案成型期",
    min: 11,
    max: 18,
    summary: "能说出基本方案，但评估指标、失败兜底和技术边界较弱。",
    advice: "优先完成一个结构化训练任务，沉淀作品片段。"
  },
  {
    name: "L3 面试准备期",
    min: 19,
    max: 25,
    summary: "已具备 AI PM 基本判断，作品需要补强证据链和追问准备。",
    advice: "做模型评估、Agent 兜底或项目复盘类任务。"
  },
  {
    name: "L4 作品打磨期",
    min: 26,
    max: 30,
    summary: "能较完整表达场景、技术取舍和评估闭环。",
    advice: "重点打磨作品集表达、面试追问和业务价值证明。"
  }
];

const recommendationMap = {
  productJudgement: ["T03", "T04", "T08"],
  requirementBreakdown: ["T05", "T02", "T06"],
  dataExperiment: ["T01", "T04", "T10"],
  technicalCollaboration: ["T02", "T07", "T08"],
  portfolioExpression: ["T09", "T10", "T05"]
};

const tiePriority = [
  "dataExperiment",
  "technicalCollaboration",
  "productJudgement",
  "requirementBreakdown",
  "portfolioExpression"
];

const levelTaskMap = {
  "L1": ["T05", "T09"],
  "L2": ["T01", "T02", "T06"],
  "L3": ["T03", "T04", "T07", "T10"],
  "L4": ["T09", "T10"]
};

const tasks = [
  {
    id: "T01",
    title: "为企业知识库问答设计 RAG 评估集",
    ability: "数据与实验意识、技术协作理解",
    level: "L2、L3",
    time: "2 小时",
    tag: "RAG 评估",
    portfolio: "RAG 评估方案作品片段",
    goal: "训练用户把“RAG 效果好不好”拆成可验证的评估样本和指标。",
    scenario: "一家 B2B SaaS 公司要上线内部知识库问答，用户会询问制度、产品文档、客户案例和操作流程。请设计一套小型 RAG 评估集。",
    knowledge: ["召回与生成的区别", "黄金答案与引用来源", "失败 case 分类", "人工抽检"],
    deliverable: "10 条测试问题、理想答案要点、引用来源要求、评分维度、失败 case 分类。",
    standard: "覆盖事实型、流程型、模糊型和越权型问题；能区分召回失败和生成失败；包含人工抽检方式。",
    interview: "准备回答：如何判断一次错误回答是检索问题还是生成问题？黄金样本如何构造？"
  },
  {
    id: "T02",
    title: "为客服 Agent 设计失败兜底方案",
    ability: "技术协作理解、需求拆解",
    level: "L2、L3",
    time: "2 小时",
    tag: "Agent 兜底",
    portfolio: "Agent 异常路径方案",
    goal: "训练 Agent 异常路径、人工接管和用户告知设计。",
    scenario: "一个电商客服 Agent 可以查询订单、解释退款规则、发起售后申请。请设计它在工具调用失败、用户意图不清和政策冲突时的兜底方案。",
    knowledge: ["工具调用失败", "人工接管", "意图澄清", "失败样本回流"],
    deliverable: "失败类型列表、处理流程、用户提示文案、人工接管规则、失败样本回流机制。",
    standard: "至少覆盖工具失败、权限不足、意图不清、政策冲突、用户情绪升级；说明哪些场景必须人工接管。",
    interview: "准备回答：连续失败几次必须转人工？用户如何知道当前状态？失败样本如何进入迭代？"
  },
  {
    id: "T03",
    title: "写一份模型选择 memo",
    ability: "AI 产品判断、数据与实验意识",
    level: "L3、L4",
    time: "2-3 小时",
    tag: "模型选择",
    portfolio: "模型选择与上线策略 memo",
    goal: "训练成本、延迟、质量、稳定性之间的产品取舍。",
    scenario: "假设你要为“AI 会议纪要摘要”功能选择模型，请在两个候选模型之间做选择，并说明上线策略。",
    knowledge: ["质量阈值", "成本估算", "响应延迟", "灰度与降级"],
    deliverable: "候选模型对比表、评估样本、质量指标、成本估算、延迟要求、降级策略。",
    standard: "不只写“效果更好”，要明确业务场景阈值、评估方法和不可接受风险。",
    interview: "准备回答：准确率、延迟和成本冲突时先保什么？如何定义上线阈值？"
  },
  {
    id: "T04",
    title: "为 AI 搜索产品设计真实性与相关性指标",
    ability: "数据与实验意识、AI 产品判断",
    level: "L2、L3",
    time: "2 小时",
    tag: "AI 搜索评估",
    portfolio: "AI 搜索评估指标方案",
    goal: "训练搜索类 AI 产品的效果拆解能力。",
    scenario: "一个 AI 搜索产品会综合网页和内部文档回答用户问题，请设计真实性、相关性和可用性指标。",
    knowledge: ["真实性", "相关性", "引用可信度", "测试查询集"],
    deliverable: "指标定义、评分样例、测试查询集、人工评审规则、线上反馈入口。",
    standard: "能区分“答案相关但不真实”“答案真实但没解决问题”“引用来源不可信”等情况。",
    interview: "准备回答：用户满意但答案不真实时如何处理？事实核查如何落地？"
  },
  {
    id: "T05",
    title: "拆解一个 AI 工作流并判断 AI 介入点",
    ability: "需求拆解、AI 产品判断",
    level: "L1、L2",
    time: "1.5 小时",
    tag: "工作流拆解",
    portfolio: "AI 介入点判断方案",
    goal: "训练用户判断 AI 应该介入流程的哪个环节，而不是把全流程都交给 AI。",
    scenario: "选择一个 AI PM 求职训练场景，例如 AI 作品评分助手、JD 技术要求翻译助手或面试项目复盘助手，拆解用户完成任务的完整流程，并判断哪些环节适合 AI。",
    knowledge: ["任务链路", "AI/规则/人工边界", "失败风险", "最小指标"],
    deliverable: "流程步骤、用户痛点、AI 介入点、非 AI 规则环节、失败风险、最小评估指标。",
    standard: "能说明为什么某些环节不适合 AI 自动化；至少列出 2 个需要人工确认的节点，并说明如何判断 AI 输出是否可用。",
    interview: "准备回答：为什么这里需要 AI？哪些环节必须保留人工确认？"
  },
  {
    id: "T06",
    title: "为 AI 写作产品设计用户反馈闭环",
    ability: "数据与实验意识、需求拆解",
    level: "L2、L3",
    time: "2 小时",
    tag: "反馈闭环",
    portfolio: "用户反馈到评估集更新方案",
    goal: "训练从用户反馈到评估集更新的闭环意识。",
    scenario: "一个 AI 写作产品支持生成小红书标题、公众号开头和邮件草稿。请设计用户反馈如何进入产品迭代。",
    knowledge: ["反馈标签", "日志字段", "人工审核", "评估集更新"],
    deliverable: "反馈入口、反馈标签、日志字段、人工审核规则、评估集更新流程。",
    standard: "反馈不只停留在点赞/点踩；能说明如何把失败样本变成下一轮评估材料。",
    interview: "准备回答：哪些用户反馈值得进入评估集？如何避免只优化高频表象问题？"
  },
  {
    id: "T07",
    title: "设计一个 Agent 工具调用评估方案",
    ability: "技术协作理解、数据与实验意识",
    level: "L3、L4",
    time: "2-3 小时",
    tag: "工具调用",
    portfolio: "Agent 工具调用评估方案",
    goal: "训练用户评估 Agent 是否正确选择工具、正确传参和正确处理结果。",
    scenario: "一个旅行 Agent 可以查航班、查酒店、生成行程。请设计工具调用评估方案。",
    knowledge: ["工具选择", "参数正确性", "任务成功率", "失败类型"],
    deliverable: "任务样本、工具选择标准、参数正确性检查、成功率指标、失败类型。",
    standard: "能区分“工具选错”“参数错”“工具结果正确但总结错误”“任务本身不可完成”。",
    interview: "准备回答：工具调用成功是否等于用户任务成功？如何检查参数错误？"
  },
  {
    id: "T08",
    title: "为多模态识别场景设计人工审核机制",
    ability: "AI 产品判断、技术协作理解",
    level: "L2、L3",
    time: "2 小时",
    tag: "多模态审核",
    portfolio: "风险分级与人审机制",
    goal: "训练多模态场景中的风险控制和人工审核设计。",
    scenario: "一个平台要用图片识别辅助审核商品违规内容。请设计模型判断不确定时的人审机制。",
    knowledge: ["置信度", "风险分级", "审核队列", "用户申诉"],
    deliverable: "风险分级、置信度处理、人工审核队列、误判反馈、用户申诉路径。",
    standard: "能说明哪些结果可自动通过、哪些必须人审、哪些需要二次复核。",
    interview: "准备回答：模型低置信度时如何排队？误杀和漏放哪个更不可接受？"
  },
  {
    id: "T09",
    title: "优化一段 AI PM 面试项目复盘",
    ability: "作品表达能力、AI 产品判断",
    level: "L1、L4",
    time: "1.5 小时",
    tag: "作品表达",
    portfolio: "面试项目复盘稿",
    goal: "训练作品表达，把经历改写成能被面试官追问和验证的作品片段。",
    scenario: "选择一个你做过或模拟的 AI 产品项目，把“我做了什么”改写成“我如何判断、取舍、验证和复盘”。",
    knowledge: ["能力证据", "关键取舍", "失败复盘", "追问准备"],
    deliverable: "项目背景、用户问题、方案取舍、指标设计、失败复盘、面试表达版本。",
    standard: "少写功能堆叠，多写关键判断；至少准备 5 个面试追问回答。",
    interview: "准备回答：这个项目最关键的产品判断是什么？如果重做你会先改哪里？"
  },
  {
    id: "T10",
    title: "为一个 AI 产品写失败 case 复盘",
    ability: "数据与实验意识、作品表达能力",
    level: "L3、L4",
    time: "2 小时",
    tag: "失败复盘",
    portfolio: "AI 产品失败 case 复盘",
    goal: "训练用户从失败样本中提取产品改进和评估规则。",
    scenario: "选一个 AI 产品失败场景，例如答非所问、幻觉、工具调用失败或用户不采纳，写一份失败 case 复盘。",
    knowledge: ["失败现象", "原因假设", "验证方式", "短期兜底", "长期迭代"],
    deliverable: "失败现象、影响用户、原因假设、验证方式、修复方案、后续指标。",
    standard: "不能只写“模型不好”；要说明问题定位路径、短期兜底和长期迭代机制。",
    interview: "准备回答：你如何定位失败来源？短期兜底和长期优化分别是什么？"
  }
];

const rubric = [
  {
    title: "问题定义与用户场景",
    coverage: "覆盖：问题定义、用户场景",
    high: "问题定义清晰，有真实约束、优先级判断和可验证目标。",
    low: "只描述功能，没有明确用户、场景和问题。",
    advice: "补充目标用户、具体任务、问题频率、影响范围和现有方案缺口。"
  },
  {
    title: "AI 介入必要性与技术边界",
    coverage: "覆盖：AI 介入必要性、技术边界",
    high: "能给出 AI / 规则 / 人工协作边界，并说明取舍理由。",
    low: "默认用 AI，没有解释为什么需要 AI。",
    advice: "说明 AI 适合处理的环节、不适合的环节，以及数据、成本、延迟和可靠性约束。"
  },
  {
    title: "方案拆解与协作可落地性",
    coverage: "覆盖：任务流程、协作边界、落地机制",
    high: "方案可以指导研发评估工作量，并包含上线、灰度或运营机制。",
    low: "方案停留在想法层，没有流程和角色分工。",
    advice: "补齐输入、输出、异常路径、数据/模型/工程/运营协作节点。"
  },
  {
    title: "评估指标与反馈闭环",
    coverage: "覆盖：评估指标、失败兜底、反馈闭环",
    high: "能把用户反馈、人工标注、评估集更新和产品迭代连成闭环。",
    low: "没有指标，或只有“用户满意度”这类泛指标。",
    advice: "加入离线评估、线上反馈、失败 case、版本对比和评估集更新方式。"
  },
  {
    title: "作品表达与面试说服力",
    coverage: "覆盖：业务价值、面试表达",
    high: "能把作品讲成“我如何判断、验证、协作和迭代”的能力证据。",
    low: "像功能说明，不像作品集案例。",
    advice: "减少功能堆叠，突出关键决策、失败复盘、个人贡献和追问准备。"
  }
];

const ignoreItems = [
  {
    title: "单纯追逐“又一个大模型排行榜第一”的新闻",
    reason: "如果没有对应到目标岗位、产品场景或评估方法，短期不需要投入学习。",
    action: "只记录它可能影响哪些产品指标，不展开追热点。"
  },
  {
    title: "泛泛收集“100 个 AI 工具合集”",
    reason: "工具清单不能直接证明 AI PM 的判断、拆解和评估能力。",
    action: "最多选一个工具，用 30 分钟拆解它的用户任务链路。"
  },
  {
    title: "没有产品落地信息的融资、发布会和概念演示",
    reason: "第一版目标用户更需要训练可交付作品，而不是追全行业动态。",
    action: "只看它是否能转成训练任务；不能转化就先忽略。"
  }
];

const jdKeywords = [
  {
    key: "RAG",
    aliases: ["rag", "知识库", "向量检索", "检索增强"],
    meaning: "大模型回答前先从资料库找证据，再基于证据生成答案。产品侧要关注资料质量、召回结果、答案可信度和引用来源。",
    task: "T01"
  },
  {
    key: "Agent",
    aliases: ["agent", "智能体", "工具调用", "function calling"],
    meaning: "让模型规划步骤并调用工具完成任务。产品侧要关注任务成功率、工具选择、参数正确性、失败兜底和人工接管。",
    task: "T02"
  },
  {
    key: "模型评估方法",
    aliases: ["评估", "准确率", "召回率", "满意度", "效果优化"],
    meaning: "不是只看用户喜不喜欢，而是要设计测试问题、理想答案、评分规则和失败样本分析。",
    task: "T04"
  },
  {
    key: "数据闭环",
    aliases: ["反馈闭环", "用户反馈", "日志", "迭代"],
    meaning: "把用户反馈、日志、人工标注和失败样本变成下一轮评估和产品迭代材料。",
    task: "T06"
  },
  {
    key: "成本 / 延迟 / 质量取舍",
    aliases: ["成本", "延迟", "质量", "模型选择", "降级"],
    meaning: "根据用户场景比较模型质量、调用成本、响应速度、稳定性和降级策略。",
    task: "T03"
  }
];

const identities = ["校招生", "实习生", "0-3 年 PM", "转岗者"];
const directions = ["AI 应用", "RAG", "Agent", "策略产品", "增长产品", "暂不确定"];
const goals = ["实习", "秋招", "转正", "转岗", "能力提升"];
const focusOptions = ["评估指标", "技术边界", "失败兜底", "业务价值", "面试表达"];

function taskById(id) {
  return tasks.find((task) => task.id === id) || tasks[0];
}

function dimensionById(id) {
  return dimensions.find((dimension) => dimension.id === id) || dimensions[0];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setRoute(route, params = {}) {
  if (params.taskId) {
    state.selectedTaskId = params.taskId;
    state.work.taskId = params.taskId;
  }
  if (params.tab) {
    state.careerTab = params.tab;
  }
  state.route = route;
  state.navOpen = false;
  const query = new URLSearchParams();
  if (route === "tasks" && state.selectedTaskId) {
    query.set("task", state.selectedTaskId);
  }
  if (route === "career") {
    query.set("tab", state.careerTab);
    if (state.work.taskId) query.set("task", state.work.taskId);
  }
  window.location.hash = `${route}${query.toString() ? `?${query.toString()}` : ""}`;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function parseHash() {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;
  const [route, query] = hash.split("?");
  state.route = ["home", "assessment", "result", "tasks", "career", "feedback"].includes(route)
    ? route
    : "home";
  const params = new URLSearchParams(query || "");
  if (params.get("task")) {
    state.selectedTaskId = params.get("task");
    state.work.taskId = params.get("task");
  }
  if (params.get("tab")) {
    state.careerTab = params.get("tab");
  }
}

function calculateResult() {
  const total = Object.values(state.assessment.answers).reduce((sum, value) => sum + Number(value), 0);
  const scores = dimensions.map((dimension) => {
    const linked = questions.filter((question) => question.dims.includes(dimension.id));
    const raw = linked.reduce((sum, question) => sum + Number(state.assessment.answers[question.id] ?? 0), 0);
    const score = Math.round((raw / (linked.length * 3)) * 100);
    return { ...dimension, score };
  });
  const level = levels.find((item) => total >= item.min && total <= item.max) || levels[0];
  const weakest = [...scores].sort(
    (a, b) => a.score - b.score || tiePriority.indexOf(a.id) - tiePriority.indexOf(b.id)
  )[0];
  const strongest = [...scores].sort((a, b) => b.score - a.score)[0];
  const levelKey = level.name.slice(0, 2);
  const dimensionIds = recommendationMap[weakest.id] || ["T01", "T04", "T09"];
  const levelIds = levelTaskMap[levelKey] || [];
  const levelMatched = dimensionIds.filter((id) => levelIds.includes(id));
  const recommendedIds = [...new Set([
    ...(levelMatched.length ? levelMatched : levelIds.slice(0, 1)),
    ...dimensionIds,
    ...levelIds
  ])].slice(0, 3);
  const recommendedTasks = recommendedIds.map(taskById);
  return {
    total,
    scores,
    level,
    weakest,
    strongest,
    recommendedTasks,
    shareText: `我的 AI PM 技术评估自测结果：${level.name}，总分 ${total}/30。当前最大短板是${weakest.name}，本周建议先完成「${recommendedTasks[0].title}」，沉淀一段可放进作品集的训练作品。`
  };
}

function submitAssessment() {
  const errors = {};
  if (!state.assessment.identity) errors.identity = "请选择当前身份。";
  if (!state.assessment.direction) errors.direction = "请选择目标方向。";
  if (!state.assessment.goal) errors.goal = "请选择求职目标。";
  questions.forEach((question) => {
    if (state.assessment.answers[question.id] === undefined) {
      errors[question.id] = "这道题还没有选择。";
    }
  });
  state.errors = errors;
  if (Object.keys(errors).length > 0) {
    render();
    return;
  }
  state.result = calculateResult();
  state.selectedTaskId = state.result.recommendedTasks[0].id;
  state.work.taskId = state.result.recommendedTasks[0].id;
  setRoute("result");
}

function generateJdResult() {
  state.jd.error = "";
  if (state.jd.text.trim().length < 20) {
    state.jd.error = "请至少粘贴一段包含岗位要求或技术要求的 JD 文本。";
    state.jd.result = null;
    render();
    return;
  }
  const text = state.jd.text.toLowerCase();
  const matched = jdKeywords.filter((item) =>
    item.aliases.some((alias) => text.includes(alias.toLowerCase()))
  );
  const keywords = matched.length ? matched : [jdKeywords[2], jdKeywords[3]];
  const primaryTask = taskById(keywords[0].task);
  state.jd.result = {
    keywords,
    primaryTask,
    profile: `这段 JD 通常不只是要求你知道技术名词，也要求你能把 ${keywords
      .map((item) => item.key)
      .join("、")} 拆成场景、数据、评估、失败兜底和协作边界。该结果只基于你粘贴的文本和公开通用知识，不代表公司内部面试标准。`,
    gap: `你需要补一份能证明“评估方法 + 技术边界 + 失败复盘”的作品。最小作品可以从「${primaryTask.title}」开始。`
  };
  render();
}

function submitWork() {
  const errors = {};
  if (!state.work.title.trim()) errors.workTitle = "请填写作品标题。";
  if (!state.work.direction.trim()) errors.workDirection = "请填写目标岗位或方向。";
  if (state.work.background.trim().length < 50) errors.workBackground = "作品背景建议不少于 50 字。";
  if (state.work.body.trim().length < 300) errors.workBody = "作品正文或片段建议不少于 300 字。";
  state.errors = errors;
  if (Object.keys(errors).length > 0) {
    render();
    return;
  }
  state.submission = {
    ...state.work,
    submittedAt: new Date().toLocaleString("zh-CN"),
    status: "待人工点评"
  };
  setRoute("feedback");
}

function copyShareText() {
  if (!state.result) return;
  navigator.clipboard
    ?.writeText(state.result.shareText)
    .then(() => {
      state.errors.copy = "";
      state.errors.copyOk = "结果文案已复制。";
      render();
    })
    .catch(() => {
      state.errors.copy = "当前浏览器不支持自动复制，请手动选择文案复制。";
      render();
    });
}

function navHtml() {
  const items = [
    ["home", "首页"],
    ["assessment", "能力自测"],
    ["tasks", "训练任务"],
    ["career", "JD 与作品"]
  ];
  return `
    <header class="topbar">
      <div class="topbar-inner ${state.navOpen ? "menu-open" : ""}">
        <button class="brand nav-button" data-action="route" data-route="home" aria-label="回到首页">
          <span class="brand-mark">PM</span>
          <span class="brand-text">AI PM 技术评估训练工作台</span>
        </button>
        <button class="mobile-menu-button" data-action="toggle-menu" aria-label="打开导航">☰</button>
        <nav class="nav">
          ${items
            .map(
              ([route, label]) => `
                <button class="nav-button ${state.route === route ? "active" : ""}" data-action="route" data-route="${route}">
                  ${label}
                </button>
              `
            )
            .join("")}
        </nav>
      </div>
    </header>
  `;
}

function shell(content) {
  return `
    <div class="app-shell">
      ${navHtml()}
      <main class="page">${content}</main>
    </div>
  `;
}

function renderHome() {
  return shell(`
    <section class="hero">
      <div class="hero-main">
        <p class="kicker">网页 / H5 MVP · 无登录 · 静态训练工作台</p>
        <h1>帮新人 AI PM 把技术焦虑变成面试作品</h1>
        <p class="lead">用 10 分钟能力自测、10 个训练任务和 Rubric 点评结构，补齐技术理解、模型评估与作品表达能力。</p>
        <div class="button-row">
          <button class="btn primary" data-action="route" data-route="assessment">开始能力自测</button>
          <button class="btn secondary" data-action="route" data-route="tasks">查看训练任务</button>
        </div>
      </div>
      <aside class="panel">
        <h2>本周建议行动</h2>
        <div class="stat"><span>第一步</span><strong>完成 10 分钟能力自测</strong></div>
        <div class="stat"><span>推荐任务</span><strong>T01 RAG 评估集设计</strong></div>
        <div class="stat"><span>作品入口</span><strong>提交作品片段，查看 Rubric 结构</strong></div>
        <div class="button-row section">
          <button class="btn primary" data-action="route" data-route="assessment">去自测</button>
          <button class="btn secondary" data-action="route" data-route="tasks" data-task="T01">看任务</button>
        </div>
      </aside>
    </section>

    <section class="section">
      <div class="grid three">
        <article class="card">
          <h3>提交已有作品</h3>
          <p class="muted">已经有 AI PM 作品片段，可以直接进入 Rubric 点评流程。</p>
          <button class="btn secondary" data-action="route" data-route="career" data-tab="work">提交作品</button>
        </article>
        <article class="card">
          <h3>JD 技术要求翻译</h3>
          <p class="muted">粘贴 JD，看它对应哪些 AI PM 能力、追问和作品缺口。</p>
          <button class="btn secondary" data-action="route" data-route="career" data-tab="jd">去翻译</button>
        </article>
        <article class="card">
          <h3>本周可以忽略榜</h3>
          <p class="muted">少追热点，把一个变化转成 30 分钟趋势实验。</p>
          <button class="btn secondary" data-action="scroll" data-target="ignore-list">查看本周判断</button>
        </article>
      </div>
    </section>

    <section class="section" id="ignore-list">
      <div class="section-header">
        <div>
          <h2>本周可以忽略榜</h2>
          <p>反 FOMO 的核心不是不看变化，而是把变化筛成行动。</p>
        </div>
      </div>
      <div class="grid three">
        ${ignoreItems
          .map(
            (item) => `
              <article class="card compact">
                <span class="tag warn">可以忽略</span>
                <h3>${item.title}</h3>
                <p><strong>理由：</strong>${item.reason}</p>
                <p class="muted"><strong>如果要行动：</strong>${item.action}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <article class="notice section">
        <h3>30 分钟趋势实验</h3>
        <p>选一个本周看到的 AI 产品更新，用 5 句话写清楚它解决什么用户问题、AI 介入点是什么、可能失败在哪里、应该看什么指标、能否转成作品片段。</p>
      </article>
    </section>
  `);
}

function renderAssessment() {
  const answered = Object.keys(state.assessment.answers).length;
  return shell(`
    <section class="section-header">
      <div>
        <p class="kicker">Step 1 / 核心路径</p>
        <h1>AI PM 技术评估能力自测</h1>
        <p class="lead">约 10 分钟。按你能在面试中稳定讲清楚的程度选择，不要选看起来最完整的答案。</p>
      </div>
      <div class="panel">
        <strong>${answered}/${questions.length}</strong>
        <p class="muted">已完成题目</p>
        <div class="progress"><span style="width:${(answered / questions.length) * 100}%"></span></div>
      </div>
    </section>

    <section class="panel">
      <h2>基础信息</h2>
      <div class="form-grid">
        ${renderChoiceGroup("identity", "当前身份", identities, state.assessment.identity)}
        ${renderChoiceGroup("direction", "目标方向", directions, state.assessment.direction)}
        ${renderChoiceGroup("goal", "求职目标", goals, state.assessment.goal)}
      </div>
    </section>

    <section class="section">
      <h2>核心能力自评</h2>
      <div class="grid">
        ${questions.map(renderQuestion).join("")}
      </div>
    </section>

    <section class="section button-row">
      <button class="btn secondary" data-action="route" data-route="home">返回首页</button>
      <button class="btn primary" data-action="submit-assessment">提交自测</button>
    </section>
  `);
}

function renderChoiceGroup(field, title, values, current) {
  return `
    <div class="field">
      <div class="fieldset-title">${title}</div>
      <div class="choice-group">
        ${values
          .map(
            (value) => `
              <label class="choice">
                <input type="radio" name="${field}" value="${value}" ${current === value ? "checked" : ""} data-action="assessment-field" data-field="${field}" />
                <span>${value}</span>
              </label>
            `
          )
          .join("")}
      </div>
      ${state.errors[field] ? `<div class="error-text">${state.errors[field]}</div>` : ""}
    </div>
  `;
}

function renderQuestion(question, index) {
  const selected = state.assessment.answers[question.id];
  return `
    <article class="question-card ${state.errors[question.id] ? "error" : ""}">
      <div class="tag-row">
        <span class="tag brand">${question.id}</span>
        ${question.dims.map((id) => `<span class="tag">${dimensionById(id).short}</span>`).join("")}
      </div>
      <h3>${index + 1}. ${question.title}</h3>
      <div class="question-options">
        ${question.options
          .map(
            (option, score) => `
              <label class="option">
                <input type="radio" name="${question.id}" value="${score}" ${Number(selected) === score ? "checked" : ""} data-action="answer" data-question="${question.id}" />
                <span>${String.fromCharCode(65 + score)}. ${option}</span>
              </label>
            `
          )
          .join("")}
      </div>
      ${state.errors[question.id] ? `<div class="error-text">${state.errors[question.id]}</div>` : ""}
    </article>
  `;
}

function renderResult() {
  if (!state.result) {
    return shell(`
      <div class="empty">
        <h2>还没有自测结果</h2>
        <p>请先完成能力自测，再查看结果。</p>
        <button class="btn primary" data-action="route" data-route="assessment">去自测</button>
      </div>
    `);
  }
  const result = state.result;
  return shell(`
    <section>
      <p class="kicker">Step 2 / 自测结果</p>
      <h1>你的 AI PM 技术评估能力画像</h1>
      <p class="lead">当前准备状态：${result.level.name}，总分 ${result.total}/30。结果只用于筛查训练方向，不是能力认证。</p>
    </section>

    <section class="grid two">
      <article class="result-card panel">
        <span class="tag warn">最大短板</span>
        <h2>${result.weakest.name}</h2>
        <p>${result.weakest.risk}</p>
        <p><strong>本周建议：</strong>完成「${result.recommendedTasks[0].title}」。</p>
        <button class="btn primary" data-action="route" data-route="tasks" data-task="${result.recommendedTasks[0].id}">开始推荐任务</button>
      </article>
      <article class="result-card panel">
        <span class="tag brand">当前等级</span>
        <h2>${result.level.name}</h2>
        <p>${result.level.summary}</p>
        <p><strong>建议：</strong>${result.level.advice}</p>
      </article>
    </section>

    <section class="section">
      <h2>核心能力结果</h2>
      <div class="grid two">
        ${result.scores
          .map(
            (score) => `
              <article class="card compact">
                <div class="stat"><span>${score.name}</span><strong>${score.score}</strong></div>
                <div class="progress"><span style="width:${score.score}%"></span></div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>推荐训练任务</h2>
          <p>主推荐 1 个，备选 2 个，都能产出可放进作品集的片段。</p>
        </div>
      </div>
      <div class="grid three">
        ${result.recommendedTasks
          .map(
            (task, index) => `
              <article class="card">
                <span class="tag ${index === 0 ? "brand" : ""}">${index === 0 ? "主推荐" : "备选"}</span>
                <h3>${task.title}</h3>
                <p class="muted">能力：${task.ability}<br />产出：${task.portfolio}</p>
                <button class="btn secondary" data-action="route" data-route="tasks" data-task="${task.id}">查看任务</button>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section grid two">
      <article class="panel">
        <h2>作品集补位建议</h2>
        <p>你需要补一份能体现“评估指标 + 失败 case + 反馈闭环”的作品。推荐从当前任务开始，先写一个可点评片段，不要先追求完整作品集。</p>
        <div class="button-row">
          <button class="btn secondary" data-action="route" data-route="tasks">查看全部训练任务</button>
          <button class="btn primary" data-action="route" data-route="career" data-tab="work">提交已有作品</button>
        </div>
      </article>
      <article class="panel">
        <h2>可复制结果文案</h2>
        <div class="copy-box">${escapeHtml(result.shareText)}</div>
        <div class="button-row section">
          <button class="btn secondary" data-action="copy-share">复制文案</button>
        </div>
        ${state.errors.copyOk ? `<p class="success-text">${state.errors.copyOk}</p>` : ""}
        ${state.errors.copy ? `<p class="error-text">${state.errors.copy}</p>` : ""}
      </article>
    </section>
  `);
}

function renderTasks() {
  const selected = taskById(state.selectedTaskId);
  return shell(`
    <section>
      <p class="kicker">Step 3 / 训练任务</p>
      <h1>AI PM 评估训练任务</h1>
      <p class="lead">每个任务都应该产出一个可放进作品集的片段。第一版不做进度系统，优先保证任务说明、交付物和评分标准清楚。</p>
      <div class="tag-row">
        <span class="tag">RAG</span><span class="tag">Agent</span><span class="tag">模型选择</span><span class="tag">失败兜底</span><span class="tag">作品表达</span>
      </div>
    </section>

    <section class="section tasks-layout">
      <aside class="panel">
        <h2>任务列表</h2>
        <div class="task-list">
          ${tasks
            .map(
              (task) => `
                <button class="task-button ${selected.id === task.id ? "active" : ""}" data-action="select-task" data-task="${task.id}">
                  <strong>${task.id} ${task.title}</strong>
                  <span class="muted">${task.tag} · ${task.time}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </aside>
      <article class="task-detail">
        <div class="tag-row">
          <span class="tag brand">${selected.id}</span>
          <span class="tag">${selected.tag}</span>
          <span class="tag">${selected.level}</span>
          <span class="tag">${selected.time}</span>
        </div>
        <h2>${selected.title}</h2>
        <p class="lead">${selected.goal}</p>
        ${renderDetailBlock("背景场景", selected.scenario)}
        ${renderDetailBlock("技术知识点", `<ul>${selected.knowledge.map((item) => `<li>${item}</li>`).join("")}</ul>`)}
        ${renderDetailBlock("任务要求 / 交付物格式", selected.deliverable)}
        ${renderDetailBlock("评分标准", selected.standard)}
        ${renderDetailBlock("面试表达提示", selected.interview)}
        <div class="button-row section">
          <button class="btn primary" data-action="route" data-route="career" data-tab="work" data-task="${selected.id}">开始写作品</button>
          <button class="btn secondary" data-action="route" data-route="career" data-tab="work">提交已有作品</button>
          <button class="btn ghost" data-action="route" data-route="home">返回首页</button>
        </div>
      </article>
    </section>
  `);
}

function renderDetailBlock(title, body) {
  return `<div class="detail-block"><h3>${title}</h3><div>${body}</div></div>`;
}

function renderCareer() {
  return shell(`
    <section>
      <p class="kicker">Step 4 / JD 与作品</p>
      <h1>JD 翻译与作品提交</h1>
      <p class="lead">JD 翻译用关键词规则和模板输出；作品提交后按 MVP 内容规格展示 5 维 Rubric 待人工点评结构。</p>
    </section>
    <section class="panel">
      <div class="tabs">
        <button class="tab-button ${state.careerTab === "jd" ? "active" : ""}" data-action="tab" data-tab="jd">JD 技术要求翻译</button>
        <button class="tab-button ${state.careerTab === "work" ? "active" : ""}" data-action="tab" data-tab="work">作品提交</button>
      </div>
      ${state.careerTab === "jd" ? renderJdTab() : renderWorkTab()}
    </section>
  `);
}

function renderJdTab() {
  return `
    <div class="grid two">
      <div class="form-grid">
        <div class="field">
          <label for="jd-text">粘贴 JD</label>
          <textarea id="jd-text" data-action="jd-field" data-field="text" placeholder="负责 AI 知识库问答产品的需求分析和效果优化，熟悉 RAG、向量检索、模型评估方法...">${escapeHtml(state.jd.text)}</textarea>
          ${state.jd.error ? `<div class="error-text">${state.jd.error}</div>` : ""}
        </div>
        <div class="grid two">
          <div class="field">
            <label for="jd-identity">目标身份</label>
            <select id="jd-identity" data-action="jd-field" data-field="identity">
              ${identities.map((item) => `<option ${state.jd.identity === item ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="jd-direction">目标方向</label>
            <select id="jd-direction" data-action="jd-field" data-field="direction">
              ${directions.map((item) => `<option ${state.jd.direction === item ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="generate-jd">生成翻译结果</button>
          <button class="btn secondary" data-action="fill-sample-jd">填入示例 JD</button>
        </div>
        <p class="muted">风险提示：第一版不自动抓取招聘网站，不保存 JD。不要粘贴公司未公开项目、面试题或内部资料。</p>
      </div>
      <div>
        ${state.jd.result ? renderJdResult() : `<div class="empty">粘贴 JD 后会输出岗位能力画像、关键词解释、追问预测、作品缺口和 7 天补位建议。</div>`}
      </div>
    </div>
  `;
}

function renderJdResult() {
  const result = state.jd.result;
  return `
    <article class="notice">
      <h2>岗位能力画像</h2>
      <p>${result.profile}</p>
      <h3>技术关键词解释</h3>
      <div class="rubric-table">
        ${result.keywords
          .map(
            (item) => `
              <div class="rubric-row">
                <strong>${item.key}</strong>
                <span>${item.meaning}</span>
              </div>
            `
          )
          .join("")}
      </div>
      <h3 class="section">可能追问方向</h3>
      <ul>
        <li>你如何判断一次错误回答是检索问题、生成问题还是业务规则问题？</li>
        <li>你会如何构造一个小型评估集？</li>
        <li>如果准确率提高但回答速度变慢，你会怎么取舍？</li>
        <li>用户反馈“不可信”时，你会改产品流程还是改模型策略？</li>
      </ul>
      <h3>作品集缺口</h3>
      <p>${result.gap}</p>
      <h3>7 天补位任务建议</h3>
      <p>主任务：${result.primaryTask.id} ${result.primaryTask.title}。轻量动作：找一个公开帮助中心或产品文档，手工写 10 个用户问题，并标注每个问题需要引用的资料来源。</p>
      <div class="button-row">
        <button class="btn primary" data-action="route" data-route="tasks" data-task="${result.primaryTask.id}">选择推荐任务</button>
        <button class="btn secondary" data-action="tab" data-tab="work">去提交作品</button>
      </div>
    </article>
  `;
}

function renderWorkTab() {
  const wordCount = state.work.body.trim().length;
  return `
    <div class="grid two">
      <form class="form-grid" onsubmit="return false;">
        <div class="field">
          <label for="work-task">关联训练任务</label>
          <select id="work-task" data-action="work-field" data-field="taskId">
            ${tasks.map((task) => `<option value="${task.id}" ${state.work.taskId === task.id ? "selected" : ""}>${task.id} ${task.title}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="work-title">作品标题</label>
          <input id="work-title" value="${escapeHtml(state.work.title)}" data-action="work-field" data-field="title" placeholder="企业知识库问答 RAG 评估方案" />
          ${state.errors.workTitle ? `<div class="error-text">${state.errors.workTitle}</div>` : ""}
        </div>
        <div class="field">
          <label for="work-direction">目标岗位或方向</label>
          <input id="work-direction" value="${escapeHtml(state.work.direction)}" data-action="work-field" data-field="direction" placeholder="RAG / AI 应用 / Agent" />
          ${state.errors.workDirection ? `<div class="error-text">${state.errors.workDirection}</div>` : ""}
        </div>
        <div class="field">
          <label for="work-background">作品背景</label>
          <textarea id="work-background" data-action="work-field" data-field="background" placeholder="说明用户、场景、业务问题，建议 100-300 字。">${escapeHtml(state.work.background)}</textarea>
          ${state.errors.workBackground ? `<div class="error-text">${state.errors.workBackground}</div>` : ""}
        </div>
        <div class="field">
          <label for="work-body">作品正文或片段</label>
          <textarea id="work-body" data-action="work-field" data-field="body" placeholder="建议不少于 300 字。请至少覆盖 AI 介入点、技术边界、评估指标、失败兜底和反馈闭环。">${escapeHtml(state.work.body)}</textarea>
          <div class="${wordCount >= 300 ? "success-text" : "muted"}">当前 ${wordCount} 字，最小提交标准为 300 字。</div>
          ${state.errors.workBody ? `<div class="error-text">${state.errors.workBody}</div>` : ""}
        </div>
        <div class="field">
          <div class="fieldset-title">希望重点检查</div>
          <div class="choice-group">
            ${focusOptions
              .map(
                (item) => `
                  <label class="choice">
                    <input type="checkbox" value="${item}" ${state.work.focus.includes(item) ? "checked" : ""} data-action="focus-toggle" />
                    <span>${item}</span>
                  </label>
                `
              )
              .join("")}
          </div>
        </div>
        <button class="btn primary" data-action="submit-work">提交作品，查看评分结构</button>
      </form>
      <aside>
        <div class="notice warning">
          <h2>第一版评分说明</h2>
          <p>作品评分采用“提交成功 + 5 维 Rubric 结构展示 + 半人工点评”流程。当前页面不会假装已经完成全自动精准评分。</p>
        </div>
        <article class="panel section">
          <h2>最小提交模板</h2>
          <ul>
            <li>用户和场景：谁在什么场景遇到什么问题。</li>
            <li>AI 介入点：为什么需要 AI，哪些环节不能自动化。</li>
            <li>评估方法：至少 2-3 个可验证指标和失败 case。</li>
            <li>兜底与反馈：失败时如何处理，样本如何回流。</li>
            <li>面试表达：这段作品证明了你的什么能力。</li>
          </ul>
        </article>
      </aside>
    </div>
  `;
}

function renderFeedback() {
  if (!state.submission) {
    return shell(`
      <div class="empty">
        <h2>还没有作品提交</h2>
        <p>请先提交作品片段，再查看评分反馈结构。</p>
        <button class="btn primary" data-action="route" data-route="career" data-tab="work">去提交作品</button>
      </div>
    `);
  }
  const task = taskById(state.submission.taskId);
  return shell(`
    <section>
      <p class="kicker">Step 5 / 作品评分反馈</p>
      <h1>作品提交成功 / 评分反馈结构</h1>
      <p class="lead">第一版采用半人工 Rubric 点评。当前页面按 MVP 内容规格展示 5 维待点评结构、自查建议和面试追问示例。</p>
    </section>

    <section class="grid two">
      <article class="panel">
        <span class="tag brand">${state.submission.status}</span>
        <h2>${escapeHtml(state.submission.title)}</h2>
        <p><strong>关联任务：</strong>${task.id} ${task.title}</p>
        <p><strong>目标方向：</strong>${escapeHtml(state.submission.direction)}</p>
        <p><strong>提交时间：</strong>${state.submission.submittedAt}</p>
      </article>
      <article class="notice warning">
        <h2>当前状态</h2>
        <p>作品已提交。这不是自动评分结果。你可以先按下方 Rubric 自查作品是否覆盖 5 个关键维度；真实点评需要由主理人基于 Rubric 半人工完成。</p>
      </article>
    </section>

    <section class="section">
      <h2>待点评状态：评分结构预览</h2>
      <div class="grid three">
        <article class="card compact"><strong>整体判断</strong><p class="muted">待人工点评</p></article>
        <article class="card compact"><strong>最大短板</strong><p class="muted">待人工点评</p></article>
        <article class="card compact"><strong>下一步建议</strong><p class="muted">先按 Rubric 自查关键要素</p></article>
      </div>
    </section>

    <section class="section">
      <h2>Rubric 分项</h2>
      <div class="rubric-table">
        ${rubric
          .map(
            (item) => `
              <div class="rubric-row">
	                <div>
	                  <strong>${item.title}</strong>
	                  <p class="muted">${item.coverage}</p>
	                  <p class="muted">待点评 / 1-5 分</p>
                </div>
                <div>
                  <p><strong>高分表现：</strong>${item.high}</p>
                  <p><strong>低分表现：</strong>${item.low}</p>
                  <p><strong>修改方向：</strong>${item.advice}</p>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section grid two">
      <article class="panel">
        <h2>三条优先修改建议示例</h2>
        <ol>
          <li>检查是否说清楚目标用户、场景和问题，而不是只描述功能。</li>
          <li>检查是否解释 AI 介入为什么比规则系统更合适，以及哪些环节必须人工确认。</li>
          <li>检查是否包含可验证的评估指标、失败 case、兜底方案和反馈闭环。</li>
        </ol>
      </article>
      <article class="panel">
        <h2>五个面试追问示例</h2>
        <ol>
          <li>你如何判断是召回问题、生成问题还是业务规则问题？</li>
          <li>你的黄金样本或测试集怎么构造？</li>
          <li>上线后用户反馈如何进入评估闭环？</li>
          <li>如果质量、成本和延迟冲突，你会先保什么？</li>
          <li>这个方案失败时，用户会看到什么，谁来接管？</li>
        </ol>
      </article>
    </section>

    <section class="section button-row">
      <button class="btn secondary" data-action="route" data-route="tasks" data-task="${task.id}">回到任务</button>
      <button class="btn primary" data-action="route" data-route="career" data-tab="work" data-task="${task.id}">修改后重新提交</button>
      <button class="btn secondary" data-action="route" data-route="career" data-tab="jd">查看 JD 翻译</button>
    </section>
  `);
}

function render() {
  const pages = {
    home: renderHome,
    assessment: renderAssessment,
    result: renderResult,
    tasks: renderTasks,
    career: renderCareer,
    feedback: renderFeedback
  };
  document.getElementById("app").innerHTML = (pages[state.route] || renderHome)();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "toggle-menu") {
    state.navOpen = !state.navOpen;
    render();
  }
  if (action === "route") {
    setRoute(target.dataset.route, { taskId: target.dataset.task, tab: target.dataset.tab });
  }
  if (action === "scroll") {
    document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: "smooth" });
  }
  if (action === "submit-assessment") {
    submitAssessment();
  }
  if (action === "copy-share") {
    copyShareText();
  }
  if (action === "select-task") {
    state.selectedTaskId = target.dataset.task;
    state.work.taskId = target.dataset.task;
    render();
  }
  if (action === "tab") {
    state.careerTab = target.dataset.tab;
    render();
  }
  if (action === "generate-jd") {
    generateJdResult();
  }
  if (action === "fill-sample-jd") {
    state.jd.text = "负责 AI 知识库问答产品的需求分析和效果优化，熟悉 RAG、向量检索、模型评估方法，能够与算法和工程团队协作，推动问答准确率、召回率和用户满意度提升。";
    state.jd.direction = "RAG";
    state.jd.identity = "校招生";
    state.jd.error = "";
    render();
  }
  if (action === "submit-work") {
    submitWork();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  const action = target.dataset.action;
  if (action === "assessment-field") {
    state.assessment[target.dataset.field] = target.value;
    delete state.errors[target.dataset.field];
    render();
  }
  if (action === "answer") {
    state.assessment.answers[target.dataset.question] = Number(target.value);
    delete state.errors[target.dataset.question];
    render();
  }
  if (action === "jd-field") {
    state.jd[target.dataset.field] = target.value;
  }
  if (action === "work-field") {
    state.work[target.dataset.field] = target.value;
    if (target.dataset.field === "taskId") {
      state.selectedTaskId = target.value;
    }
  }
  if (action === "focus-toggle") {
    if (target.checked) {
      state.work.focus = [...new Set([...state.work.focus, target.value])];
    } else {
      state.work.focus = state.work.focus.filter((item) => item !== target.value);
    }
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  const action = target.dataset.action;
  if (action === "jd-field") {
    state.jd[target.dataset.field] = target.value;
  }
  if (action === "work-field") {
    state.work[target.dataset.field] = target.value;
  }
});

window.addEventListener("hashchange", () => {
  parseHash();
  render();
});

parseHash();
render();
