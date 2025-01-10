import { parse } from 'csv-parse/sync';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import * as dotenv from 'dotenv';

dotenv.config();

function getClient() {
  if (typeof window !== 'undefined') return null;
  
  return new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT || '',
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY || '')
  );
}

export async function processCSV(buffer: ArrayBuffer) {
  const client = getClient();
  if (!client) throw new Error('OpenAI client can only be used server-side');
  
  const content = new TextDecoder().decode(buffer);
  const records = parse(content, { columns: true });

  const questions = Object.keys(records[0]);
  const results = [];

  for (const question of questions) {
    const answers = records.map((record: any) => record[question]);
    const prompt = createPrompt(question, answers);
    const analysis = await callAIAPI(prompt, question);
    results.push({ question, analysis });
  }

  return results;
}

function createPrompt(question: string, answers: string[]) {
  const combinedAnswers = answers.filter(answer => answer.trim()).map(answer => `- ${answer}`).join('\n');
  return `
    Answers to the question: "${question}"

    ${combinedAnswers}
  `;
}

async function callAIAPI(prompt: string, question: string) {
  const systemMessage = `You are a helpful assistant that analyzes survey data. Your task is to analyze responses to the following question:

"${question}"

Provide the following analysis:
1. Summary: Summarize the key points from these answers that are directly relevant to the question. Identify common themes and notable differences.
2. Sentiment: Analyze the overall sentiment of the responses (Positive, Neutral, or Negative).
3. Topics: Identify 3-5 main topics or themes present in the responses.
4. Categories: Categorize the responses into 2-4 distinct groups based on their content.
5. Key Terms: List the top 5 most frequently used meaningful words or phrases in the responses.
6. Trending Sentiment: Identify any trending sentiments across the responses, especially for questions with provided examples. Note if responses align with specific examples and highlight any emerging trends.
7. Example Alignment: For questions with provided examples, categorize responses based on their alignment with these examples. Provide percentages if possible.
8. Confidence Rating: Provide a confidence rating (Low, Medium, or High) based on the consistency and clarity of the responses. Explain your rating in one sentence.

Format your response as follows:

### Summary 
[Your summary here]

### Sentiment: [Positive/Neutral/Negative]

### Topics:
- [Topic 1]
- [Topic 2]
- [Topic 3]

### Categories:
1. **[Category 1]**: [Brief description]
2. **[Category 2]**: [Brief description]

### Key Terms:
1. [Term 1]
2. [Term 2]
3. [Term 3]
4. [Term 4]
5. [Term 5]

### Trending Sentiment: 
[Describe any trending sentiments and emerging trends]

### Example Alignment:
- [Example 1]: [Percentage or description of alignment]
- [Example 2]: [Percentage or description of alignment]
// ... (for all relevant examples)

### Confidence Rating: [Low/Medium/High]
### Explanation
[Your explanation here]`;

  const response = await client.getChatCompletions(
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
    [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
    {
      maxTokens: 2000
    }
  );

  return response.choices[0].message.content;
}
