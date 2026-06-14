const DEFAULT_BASE_URL = "https://api.deepseek.com";

export function createDeepSeekModel(env) {
  return {
    apiKey: env.DEEPSEEK_API_KEY,
    model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    baseUrl: env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL
  };
}

export async function callDeepSeekJson({ modelConfig, messages, signal }) {
  if (!modelConfig.apiKey) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modelConfig.apiKey}`
    },
    body: JSON.stringify({
      model: modelConfig.model,
      messages,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.3,
      stream: false
    }),
    signal
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `DeepSeek request failed with ${response.status}`;
    throw new Error(message);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek response did not include message content");
  }
  return content;
}
