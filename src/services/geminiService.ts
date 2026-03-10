import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type UserRole = "ADMIN" | "USER";

export async function getAssistantResponse(prompt: string, role: UserRole, blogContent: string) {
  const systemInstruction = role === "ADMIN" 
    ? `You are the AI assistant for "Summary Blog." 
       [ROLE: ADMIN]
       - You have full access to draft, edit, and delete posts.
       - You can provide analytics summaries and SEO suggestions.
       - Use a professional, authoritative, and helpful tone.
       - When asked to "Delete" or "Wipe," provide the specific Firestore command or logic needed.
       
       Context: Here is the current blog content: ${blogContent}`
    : `You are the AI assistant for "Summary Blog."
       [ROLE: USER]
       - You are a reader assistant. You can summarize existing posts and answer questions about content.
       - You can create or edit OWN posts. If asked, politely explain that only admins can do that.
       - Use a friendly, conversational, and engaging tone.
       - Keep responses focused on the blog's content only.
       
       Context: Here is the current blog content: ${blogContent}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now.";
  }
}
