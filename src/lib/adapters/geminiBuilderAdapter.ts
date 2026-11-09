import { GoogleGenAI } from '@google/genai';
import { GeneratedFile, ShipyardApp } from '../../types';
import { generateAppFiles, createInitialPlan } from '../agentEngine';

export interface AIBuildResult {
  files: GeneratedFile[];
  previewHtml: string;
  source: 'gemini-3.8-flash' | 'deterministic-engine';
  architectureSummary: string;
}

export async function generateAppWithRealAI(
  name: string,
  idea: string,
  platforms: string[] = ['WEB', 'FARCASTER', 'BASE']
): Promise<AIBuildResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.length > 10 && !apiKey.includes('MY_GEMINI_API_KEY')) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are the lead smart contract and miniapp builder for Shipyard on Base L2.
Generate a complete, production-grade Next.js 15 miniapp and Solidity 0.8.24 contract for:
App Name: "${name}"
Concept: "${idea}"
Target Platforms: ${platforms.join(', ')}

Return a JSON object with this exact shape:
{
  "architectureSummary": "1-2 sentence description of the smart contract & client architecture",
  "files": [
    { "path": "package.json", "language": "json", "content": "..." },
    { "path": "app/page.tsx", "language": "typescript", "content": "..." },
    { "path": "contracts/FeeSplitter.sol", "language": "solidity", "content": "..." },
    { "path": "README.md", "language": "markdown", "content": "..." }
  ],
  "previewHtml": "<div style=\\"...\\">Complete interactive standalone HTML widget with inline JavaScript allowing users to interact immediately</div>"
}
Respond with RAW JSON ONLY. No markdown triple backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.files && Array.isArray(parsed.files) && parsed.previewHtml) {
        return {
          files: parsed.files,
          previewHtml: parsed.previewHtml,
          source: 'gemini-3.8-flash',
          architectureSummary: parsed.architectureSummary || `Synthesized via Gemini 3.8 Flash for ${name}`,
        };
      }
    } catch (err: any) {
      console.warn('Gemini AI builder fallback to deterministic engine:', err.message);
    }
  }

  // Fallback to robust deterministic engine
  const plan = createInitialPlan(name, idea, {
    platforms: platforms as any,
  });
  const { files, previewHtml } = generateAppFiles({ name, idea, plan });

  return {
    files,
    previewHtml,
    source: 'deterministic-engine',
    architectureSummary: `Base L2 fee splitter with verified 60/40 creator royalties and multi-platform miniapp client`,
  };
}
