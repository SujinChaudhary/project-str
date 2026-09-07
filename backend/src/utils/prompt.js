import {GoogleGenAI} from '@google/genai';
import config from '../config/config.js';

const ai = new GoogleGenAI({apiKey: config.geminiApiKey});
const promptAi = async(input) =>{
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: input,
  });

  return response.text;
}

export default promptAi;