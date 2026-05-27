const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes raw text extracted from a DRHP PDF.
 */
async function analyzeRawDRHP(content, companyName = "") {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are an institutional-grade financial analyst. 
    Analyze the following text extracted from the Draft Red Herring Prospectus (DRHP) of ${companyName || 'this company'}.
    
    Provide a structured analysis in JSON format with the following keys:
    - executiveSummary: A professional 2-3 sentence summary of the business.
    - strategicMoats: An array of 3-4 competitive advantages.
    - financialHealth: A summary of their balance sheet and revenue trend.
    - redFlags: An array of 3-4 critical risks or legal concerns.
    - valuationVerdict: A professional assessment of their pricing (e.g., 'Fairly valued', 'Slightly premium').
    - listingPrediction: A bold one-sentence prediction on market reception (e.g., 'Expected listing gain of 15-20%').

    DRHP TEXT CONTENT:
    ${content.substring(0, 40000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (error.message && error.message.includes("API key")) {
      throw new Error("Invalid or missing API Key for the AI Engine.");
    }
    throw new Error(`AI Engine Error: ${error.message || "Failed to process DRHP content."}`);
  }
}

module.exports = { analyzeRawDRHP };
