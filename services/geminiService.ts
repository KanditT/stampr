import { GoogleGenAI } from "@google/genai";
import { StampStyle } from "../types";

export const generateStampLore = async (
  locationName: string,
  style: StampStyle,
): Promise<string> => {
  // Check if API key is valid before making the request
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    console.warn("Gemini API Key is missing or invalid. Using fallback lore.");
    return `เสียงสะท้อนจากห้อง ${locationName} ในรูปแบบ ${style} ที่ยังคงก้องกังวานในใจ`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the narrator for the "Heart of Music Museum". 
      A visitor just collected a musical fragment from the room: "${locationName}".
      The fragment is in the style: "${style}".
      Generate a short, poetic 2-sentence insight in Thai about the feeling or the history of this musical element. 
      Keep it inspirational and related to the specific room theme.`,
      config: {
        maxOutputTokens: 150,
        temperature: 0.8,
      },
    });

    return (
      response.text ||
      `เสียงสะท้อนจากห้อง ${locationName} ในรูปแบบ ${style} ที่ยังคงก้องกังวานในใจ`
    );
  } catch (error) {
    console.error("Gemini Lore Error:", error);
    return `ชิ้นส่วนแห่งบทเพลงจากห้อง ${locationName} ที่ถูกบันทึกไว้ด้วยความประทับใจ`;
  }
};
