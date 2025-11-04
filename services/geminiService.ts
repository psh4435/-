
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateConceptImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{ imageUrl: string; base64: string; mimeType: string; }> => {
    try {
        const fullPrompt = `${prompt}\n\n중요: 생성되는 이미지에는 어떠한 텍스트, 로고, 워터마크도 포함하지 마세요.`

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: fullPrompt },
                ],
            }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64Bytes = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return {
                    imageUrl: `data:${imageMimeType};base64,${base64Bytes}`,
                    base64: base64Bytes,
                    mimeType: imageMimeType,
                };
            }
        }
        
        throw new Error("응답에서 이미지가 생성되지 않았습니다. 모델이 요청을 거부했을 수 있습니다.");

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        if (error instanceof Error && error.message.includes('deadline')) {
            throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        }
        throw new Error("이미지 생성에 실패했습니다. 콘텐츠가 차단되었거나 API 오류가 발생했을 수 있습니다.");
    }
};

export const generateAdCopy = async (imagePrompt: string, productInfo: string): Promise<{ headlines: string[], bodies: string[] }> => {
    try {
        const prompt = `당신은 소비자의 구매 심리를 자극하는 전문 광고 카피라이터입니다.
다음 제품 정보와 광고 이미지 컨셉을 바탕으로, 타겟 고객의 시선을 사로잡고 구매 욕구를 불러일으키는 광고 카피를 생성해주세요.

**제품 정보:**
${productInfo}

**광고 이미지 컨셉:**
"${imagePrompt}"

**요청사항:**
1.  **헤드카피 (Headline):** 20자 이내의 짧고 강력한 문구 3개. 고객의 호기심을 자극하거나 핵심적인 가치를 전달해야 합니다.
2.  **본문카피 (Body):** 제품의 특징과 장점을 매력적으로 설명하는 50자 이내의 문구 3개. 고객이 얻을 수 있는 구체적인 혜택을 강조해주세요.

결과는 반드시 아래 JSON 형식으로 반환해주세요.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headlines: {
                            type: Type.ARRAY,
                            description: "20자 이내의 헤드카피 3개",
                            items: {
                                type: Type.STRING,
                            }
                        },
                        bodies: {
                             type: Type.ARRAY,
                             description: "50자 이내의 본문카피 3개",
                             items: {
                                type: Type.STRING,
                            }
                        }
                    },
                    required: ["headlines", "bodies"]
                },
            },
        });
        
        let jsonStr = response.text.trim();
        // The model can sometimes wrap the JSON in markdown code blocks.
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.slice(7, -3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.slice(3, -3).trim();
        }

        const result = JSON.parse(jsonStr);

        if (result.headlines && Array.isArray(result.headlines) && result.bodies && Array.isArray(result.bodies)) {
            return {
                headlines: result.headlines.slice(0, 3),
                bodies: result.bodies.slice(0, 3),
            };
        } else {
            throw new Error("광고 카피를 생성하지 못했습니다. 응답 형식이 올바르지 않습니다.");
        }
    } catch (error) {
        console.error("Error generating ad copy with Gemini:", error);
        throw new Error("광고 카피 생성에 실패했습니다. API 오류가 발생했거나 콘텐츠가 차단되었을 수 있습니다.");
    }
};
