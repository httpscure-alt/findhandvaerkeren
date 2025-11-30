import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeminiSearchResponse } from '../types';

// Initialize the Gemini API client only if API key is available
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

let ai: GoogleGenAI | null = null;

// Only initialize if API key is available
const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  if (!ai) {
    try {
      ai = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.warn('Failed to initialize Gemini AI:', error);
      return null;
    }
  }
  return ai;
};

export const analyzeSearchQuery = async (query: string): Promise<GeminiSearchResponse | null> => {
  const apiKey = getApiKey();
  const aiClient = getAI();
  
  if (!apiKey || !aiClient) {
    // Return null gracefully - app will work without AI
    return null;
  }

  try {
    const response: GenerateContentResponse = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the user's search query for a Danish B2B/Service directory (Findhåndværkeren) and extract the intent, including category and location if present.
      The query might be in English or Danish.
      User Query: "${query}"
      
      Available Categories: Technology, Finance, Marketing, Logistics, Consulting, Legal.
      Common Locations Context: Denmark (e.g., København, Aarhus, Odense, Aalborg, Roskilde, Esbjerg).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: {
              type: Type.STRING,
              description: "The best matching category from the available list. If none match perfectly, pick the closest or 'All'.",
            },
            suggestedLocation: {
              type: Type.STRING,
              description: "The specific Danish city or region mentioned in the query (e.g., 'København', 'Aarhus'). Use the Danish spelling if possible. If no location is mentioned, return empty string.",
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-5 relevant keywords extracted from the query. Return keywords in the same language as the query.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation of why this category/location was chosen (in the same language as the query).",
            },
          },
          propertyOrdering: ["suggestedCategory", "suggestedLocation", "keywords", "reasoning"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as GeminiSearchResponse;

  } catch (error) {
    console.error("Error analyzing query with Gemini:", error);
    return null;
  }
};

export const getSearchSuggestions = async (query: string, lang: 'en' | 'da'): Promise<string[]> => {
  const apiKey = getApiKey();
  const aiClient = getAI();
  
  if (!apiKey || !aiClient || query.length < 2) {
    return []; // Return empty array gracefully
  }

  try {
    const prompt = `Generate 4-5 short, relevant B2B or service-related search suggestions for a user typing "${query}" into a directory for Danish companies (Findhåndværkeren).
    Language: ${lang === 'da' ? 'Danish' : 'English'}.
    Context: User is looking for companies, tradesmen, or services like "plumbers", "consulting", "finance" in cities like "København", "Aarhus".
    Return purely a JSON array of strings.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};