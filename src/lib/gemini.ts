export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function generateGeminiContent(
  messages: { role: string; text: string }[],
  systemPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  const response = await fetch("/api/rehearse-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages,
      systemPrompt,
      temperature
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Server rehearsal chat call failed:", response.status, errorData);
    throw new Error(`Server rehearsal chat call failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}
