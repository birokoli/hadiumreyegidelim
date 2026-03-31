import { GoogleGenAI } from "@google/genai";

export async function generateAndUploadImage(promptJson: any, headingText: string = "image"): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Construct the actual text prompt from the Nano Banana JSON structure
    // Imagen 3 evaluates a beautifully crafted text string better than raw JSON.
    let textPrompt = "";
    if (typeof promptJson === 'object') {
       const p = promptJson;
       const subject = p.subject?.primary_object || "";
       const environment = p.scene?.environment || "";
       const lighting = p.lighting?.style || "soft lighting";
       const mood = p.aesthetic?.mood || "luxurious";
       const color = p.aesthetic?.color_palette || "natural";
       const camera = p.camera?.lens || "35mm";
       const style = p.aesthetic?.style || "high-end editorial product photography";
       
       textPrompt = `${subject} placed in ${environment}. Lighting: ${lighting}. Mood: ${mood}. Color palette: ${color}. Camera lens: ${camera}. Aesthetic Style: ${style}. Photorealistic, award-winning, 8k ultra high resolution.`;
    } else {
       textPrompt = String(promptJson);
    }

    // Nano-Banana Imagen 4 Request
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: textPrompt,
      config: {
        numberOfImages: 1,
        // Enforce aspect ratio 16:9 for blog cover/headers
        aspectRatio: "16:9", 
        outputMimeType: 'image/jpeg',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.error("Imagen failed to generate image.");
      return null;
    }

    const imageObj = response.generatedImages[0].image;
    // According to SDK docs, the result is in `.image.imageBytes`
    const imageBytes = (imageObj as any).imageBytes || imageObj; 
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageBytes, "base64");
    
    // Upload to Supabase 
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
       console.error("Missing Supabase credentials.");
       return null;
    }
    
    // Clean string for filename
    const cleanPrefix = headingText.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    const uniqueSuffix = `${Math.round(Math.random() * 1e9)}`;
    const filename = `${cleanPrefix}-${uniqueSuffix}.jpg`;
    
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/uploads/${filename}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": "image/jpeg",
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Upload Error:", errorText);
      return null;
    }

    return `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;
  } catch (err) {
    console.error("Error generating/uploading image:", err);
    return null;
  }
}
