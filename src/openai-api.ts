import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);


export const askGPT3Input = async (history: string, prompt: string) => {
  const gptPrompt: string = `${history}\n\n${prompt}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': 256,
    'temperature': 0.7,
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {
    return data.data.choices[0].text?.trim();
  });
}
