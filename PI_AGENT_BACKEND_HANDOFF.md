# Pi Agent 后端接入交接文档

这份文档用于在本项目下重新开启一个 Codex 窗口时快速恢复上下文。新的窗口可以直接读取本文，然后继续实现「静态网页 + Pi Agent 后端」。

## 当前项目

项目路径：

```text
/Users/dairao/Documents/AI PM 反FOMO工作台
```

当前形态：

```text
纯静态 H5 MVP
无登录
无后端
无数据库
状态保存在浏览器当前会话
```

核心文件：

```text
index.html
app.js
styles.css
package.json
README.md
```

当前运行方式：

```bash
npm start
```

当前 `package.json` 里只是用 Python 静态服务器启动：

```bash
python3 -m http.server 5173
```

## 相关 Pi Agent 源码位置

Pi 项目路径：

```text
/Users/dairao/Documents/AI Agent学习/pi-main
```

核心学习目录：

```text
/Users/dairao/Documents/AI Agent学习/pi-main/packages/agent
```

已经学习过的关键判断：

```text
Agent = 大模型 + 工具 + 循环 + 上下文管理
```

源码心智模型：

```text
agent-loop.ts
  Agent 的发动机
  负责调用模型、发现 toolCall、执行工具、写回 toolResult、继续下一轮

agent.ts
  Agent 的驾驶舱
  负责 state、prompt、continue、steer、followUp、abort、subscribe

types.ts
  Agent 的词典
  定义 AgentMessage、AgentTool、AgentEvent、AgentState 等概念

harness/agent-harness.ts
  工程化版本
  在基础 Agent 上加入 session、skills、hooks、resources、上下文压缩等能力

harness/skills.ts
  Skill 加载与调用

harness/system-prompt.ts
  把可用 skills 格式化进系统提示词

harness/session/
  会话持久化、对话树、分支、压缩摘要
```

## 用户当前期望

用户希望继续在「AI PM 反FOMO工作台」项目里，把当前静态网页升级为：

```text
静态网页
  -> 调用本地 Node 后端 API
    -> 后端运行 AgentHarness
      -> 使用 DeepSeek V4 Preview
        -> 加载 Skill
          -> 输出 JD 分析结果
```

第一阶段只做一个功能：

```text
JD 技术要求翻译 Agent 版
```

暂不优先做：

```text
作品自动评分
用户登录
线上部署
数据库
复杂流式输出
```

先做一次性返回，跑通后再升级流式返回。

## 用户确认过的配置

用户已确认：

```text
1. 第一刀做 JD 分析
2. 模型使用 deepseek-v4-flash
3. 输出风格使用“产品教练型”
4. 允许修改项目文件并搭后端
```

用户计划使用 DeepSeek V4 Preview。

注意：

```text
不要要求用户把 API Key 明文发到聊天里。
应让用户本地写入 .env。
```

建议环境变量：

```text
DEEPSEEK_API_KEY=用户自己的 key
DEEPSEEK_MODEL=deepseek-v4-flash
```

DeepSeek API 按 OpenAI-compatible 方式接入。此前查到的信息：

```text
OpenAI-compatible base URL: https://api.deepseek.com
模型建议：deepseek-v4-flash
```

实现时应再次以官方文档或项目实际 SDK 兼容性为准。

## 当前网页中最适合接 Agent 的入口

### 入口 1：JD 技术要求翻译

当前函数：

```text
app.js -> generateJdResult()
```

当前位置大约在：

```text
app.js:592
```

当前逻辑：

```text
读取 state.jd.text
用 jdKeywords 做关键词匹配
按固定模板生成 result
调用 render()
```

应升级为：

```text
点击“生成翻译结果”
  -> 前端校验 JD 长度
  -> state.jd.loading = true
  -> fetch("/api/jd-analyze")
  -> 后端 AgentHarness 分析
  -> 前端渲染返回结果
```

建议保留当前规则版逻辑作为 fallback：

```text
generateJdResultFallback()
```

失败时：

```text
后端不可用 / API Key 缺失 / 模型调用失败
  -> 使用 fallback
  -> 页面仍可用
  -> 给用户轻提示：当前使用本地规则版结果
```

### 入口 2：作品提交点评

当前函数：

```text
app.js -> submitWork()
```

当前位置大约在：

```text
app.js:616
```

当前逻辑：

```text
校验标题、方向、背景、正文长度
保存 state.submission
跳转 feedback
展示半人工 Rubric 结构
```

这是第二阶段功能，暂不建议第一阶段实现自动评分。

原因：

```text
评价质量要求更高
涉及用户信任
需要更严格的 Rubric 输出约束
```

## 建议新增目录结构

在当前项目新增：

```text
server/
  server.ts
  create-harness.ts
  deepseek-model.ts
  tools/
    index.ts
  skills/
    jd-analyzer/
      SKILL.md
  sessions/
    .gitkeep
```

可能还需要新增：

```text
.env.example
.gitignore
```

`.gitignore` 至少应包含：

```text
node_modules/
.env
server/sessions/
```

## API 设计

第一阶段只做：

```text
POST /api/jd-analyze
```

请求体：

```json
{
  "sessionId": "browser-session-id",
  "jdText": "负责 AI 知识库问答产品的需求分析和效果优化...",
  "identity": "校招生",
  "direction": "RAG"
}
```

响应体建议：

```json
{
  "profile": "这段 JD 对新人 AI PM 的真实要求是...",
  "keywords": [
    {
      "key": "RAG",
      "meaning": "不是只知道名词，而是能拆出资料源、召回、生成、引用和评估。",
      "task": "T01"
    }
  ],
  "gap": "你当前最需要补的作品证据是...",
  "primaryTaskId": "T01",
  "interviewQuestions": [
    "如何判断一次错误回答是检索问题还是生成问题？"
  ],
  "sevenDayPlan": "第 1-2 天..."
}
```

前端可以把 `primaryTaskId` 映射回现有 `tasks` 数组：

```js
const primaryTask = taskById(result.primaryTaskId);
```

## 后端职责

后端需要做：

```text
1. 托管静态文件 index.html / app.js / styles.css
2. 提供 /api/jd-analyze
3. 读取 .env 中的 DEEPSEEK_API_KEY
4. 创建 DeepSeek model 配置
5. 创建或打开 session
6. 创建 AgentHarness
7. 加载 jd-analyzer Skill
8. 调用 AgentHarness prompt
9. 尽量约束模型输出 JSON
10. 校验 JSON，失败时返回错误，让前端 fallback
```

第一阶段不需要复杂工具。

可以先不提供真实工具，或只提供非常轻量的工具。

## Skill 设计

Skill 名称：

```text
jd-analyzer
```

路径：

```text
server/skills/jd-analyzer/SKILL.md
```

风格：

```text
产品教练型
反 FOMO
不制造焦虑
不夸大确定性
输出具体、可行动、面向 AI PM 面试和作品集
```

Skill 应要求模型输出结构化 JSON，字段与 API 响应一致。

建议 Skill 内容包括：

```text
你是 AI PM 技术评估训练教练。
输入是一段 JD、用户身份、目标方向。
请把 JD 翻译成新人 AI PM 能理解和行动的训练建议。
输出必须覆盖：
1. 岗位能力画像 profile
2. 技术关键词解释 keywords
3. 面试追问 interviewQuestions
4. 作品集缺口 gap
5. 推荐训练任务 primaryTaskId
6. 7 天补位计划 sevenDayPlan
```

可用训练任务 ID：

```text
T01 RAG 评估集
T02 客服 Agent 失败兜底
T03 模型选择 memo
T04 AI 搜索真实性与相关性指标
T05 AI 工作流拆解
T06 AI 写作反馈闭环
T07 Agent 工具调用评估
T08 多模态人工审核
T09 AI PM 面试项目复盘
T10 AI 产品失败 case 复盘
```

## 前端改造点

### state 增加字段

当前：

```js
jd: {
  text: "",
  identity: "校招生",
  direction: "RAG",
  result: null,
  error: ""
}
```

建议改为：

```js
jd: {
  text: "",
  identity: "校招生",
  direction: "RAG",
  result: null,
  error: "",
  loading: false,
  source: ""
}
```

`source` 可以是：

```text
agent
fallback
```

### generateJdResult 改造

目标：

```text
generateJdResult()
  -> 校验文本
  -> loading true
  -> fetch /api/jd-analyze
  -> 成功写入 state.jd.result
  -> 失败调用 generateJdResultFallback()
  -> loading false
  -> render()
```

### renderJdTab 改造

按钮文案建议：

```text
生成翻译结果
```

loading 时：

```text
分析中...
```

可禁用按钮，避免重复提交。

### renderJdResult 改造

当前 `renderJdResult()` 使用：

```js
result.profile
result.keywords
result.gap
result.primaryTask
```

后端建议返回 `primaryTaskId`，前端转换：

```js
const primaryTask = result.primaryTask || taskById(result.primaryTaskId);
```

为了兼容 fallback 和 agent 两种结果，渲染函数应兼容：

```text
result.primaryTask
result.primaryTaskId
result.interviewQuestions
result.sevenDayPlan
```

## 推荐实施顺序

### 第一步：准备 Node 后端

修改 `package.json`：

```text
dev/start -> 启动 Node 后端
```

可以保留静态版本脚本：

```text
static -> python3 -m http.server 5173
```

### 第二步：加 .env.example 和 .gitignore

`.env.example`：

```text
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
PORT=5173
```

### 第三步：实现 /api/jd-analyze

先可用假数据跑通前后端，再接 AgentHarness。

### 第四步：接 DeepSeek

使用 Pi AI 的 OpenAI-compatible 方案。

需要注意：

```text
不要把 API Key 写进前端
不要把 .env 提交到 git
```

### 第五步：接 AgentHarness 和 Skill

把 JD 输入包装成 prompt：

```text
请使用 jd-analyzer skill 分析以下 JD。

用户身份：...
目标方向：...
JD：...
```

### 第六步：前端 fetch 接口

改造 `generateJdResult()`。

### 第七步：验证

需要验证：

```text
1. 没有 .env 时，前端 fallback 可用
2. 有 API Key 时，/api/jd-analyze 返回 agent 结果
3. JD 过短时仍然本地校验
4. 返回 primaryTaskId 后能跳转到对应任务
5. 刷新页面不报错
```

## 新窗口推荐开场 Prompt

可以在新 Codex 窗口直接发：

```text
请先阅读当前项目里的 PI_AGENT_BACKEND_HANDOFF.md、README.md、app.js 和 package.json。

我的目标是：把当前纯静态的「AI PM 反FOMO工作台」升级为「静态网页 + 本地 Node 后端 + Pi AgentHarness」架构。第一阶段只做 JD 技术要求翻译 Agent 版。

已确认配置：
1. 第一刀做 JD 分析
2. 模型用 deepseek-v4-flash
3. 输出风格是产品教练型
4. 可以修改项目文件并搭后端

要求：
1. 不要把 API Key 写进前端或提交到仓库
2. 用 .env 读取 DEEPSEEK_API_KEY
3. 优先保留当前规则版 JD 翻译作为 fallback
4. 先做一次性返回 POST /api/jd-analyze，不做流式
5. 新增 jd-analyzer Skill
6. 修改 app.js 的 generateJdResult 接后端
7. 最后本地运行验证

我是编程小白，请边做边用通俗语言解释关键改动。
```

## 当前最重要的产品判断

第一阶段不要做太大。

正确范围是：

```text
只把 JD 技术要求翻译从规则模板升级成 Agent 版。
```

暂缓：

```text
作品自动评分
流式输出
登录系统
数据库
线上部署
支付
多用户权限
```

原因：

```text
先验证 Agent 后端链路是否能稳定跑通。
再验证 AI 结果是否比当前规则模板有明显价值。
最后再扩展到作品点评和流式体验。
```

