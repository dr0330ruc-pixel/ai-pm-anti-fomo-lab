import { readFile } from "node:fs/promises";
import path from "node:path";
import { callDeepSeekJson, createDeepSeekModel } from "./deepseek-model.mjs";

const VALID_TASK_IDS = new Set(["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10"]);

function pickTaskId(value, fallback = "T01") {
  return VALID_TASK_IDS.has(value) ? value : fallback;
}

function asShortString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => asShortString(item)).filter(Boolean).slice(0, 6)
    : [];
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Agent response was not JSON");
  return match[0];
}

function normalizeJdAnalysis(raw) {
  const parsed = JSON.parse(extractJsonObject(raw));
  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords
        .map((item) => ({
          key: asShortString(item?.key),
          meaning: asShortString(item?.meaning),
          task: pickTaskId(item?.task, parsed.primaryTaskId)
        }))
        .filter((item) => item.key && item.meaning)
        .slice(0, 5)
    : [];

  if (!asShortString(parsed.profile) || keywords.length === 0 || !asShortString(parsed.gap)) {
    throw new Error("Agent response missed required JD analysis fields");
  }

  const primaryTaskId = pickTaskId(parsed.primaryTaskId, keywords[0]?.task || "T01");
  return {
    profile: asShortString(parsed.profile),
    keywords,
    gap: asShortString(parsed.gap),
    primaryTaskId,
    interviewQuestions: asStringArray(parsed.interviewQuestions).slice(0, 4),
    sevenDayPlan: asShortString(parsed.sevenDayPlan)
  };
}

export async function createJdAnalyzerHarness({ rootDir, env }) {
  const skillPath = path.join(rootDir, "server", "skills", "jd-analyzer", "SKILL.md");
  const skill = await readFile(skillPath, "utf8");
  const modelConfig = createDeepSeekModel(env);

  return {
    async analyze({ jdText, identity, direction, signal }) {
      const messages = [
        {
          role: "system",
          content: `${skill}\n\n你现在运行在本地 JD 分析 Agent 中。请严格遵守 Skill 的 JSON 输出要求。`
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              identity,
              direction,
              jdText
            },
            null,
            2
          )
        }
      ];
      const content = await callDeepSeekJson({ modelConfig, messages, signal });
      return normalizeJdAnalysis(content);
    }
  };
}
