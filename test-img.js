require("dotenv").config({ path: ".env" });
const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-001',
    prompt: 'A minimalistic beautiful white kaaba drawing',
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
      outputMimeType: 'image/jpeg',
    },
  });
  console.log("SUCCESS length:", response.generatedImages.length);
}
run().catch(console.error);
