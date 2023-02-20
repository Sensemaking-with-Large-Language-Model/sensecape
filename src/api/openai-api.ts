import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

// Object that specifies max token length by response type
export const tokens = {
  full: 256,
  summary: 64,
  keywords: 16,
  term: 5
}

export const getGPT3Response = async (history: string, prompt: string) => {
  const gptPrompt: string = `${history}\n\n${prompt}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': tokens.full,
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

export const getGPT3Stream = async (history: string, prompt: string) => {
  const gptPrompt: string = `${history}\n\n${prompt}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': tokens.full,
    'temperature': 0.7,
    'top_p': 1,
    'n': 1,
    'stream': true,
    'logprobs': null,
    'stop': ''
  }).then((data) => {
    console.log(data);
    return data;
    // return data.data.choices[0].text?.trim();
  });
}

// Semantic Zoom: Summarize text if zoomed out medium amount
export const getGPT3Summary = async (text: string) => {
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.keywords) return text;

  const gptPrompt: string = `Summarize this text in a 1-2 phrases:\n\n${text}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': tokens.summary,
    'temperature': 0.4,     // Lower temp: less deterministic
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {
    return data.data.choices[0].text?.trim();
  });
}

// Semantic Zoom: Summarize text if zoomed out large amount
export const getGPT3Keywords = async (text: string) => {
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.keywords) return text;

  const gptPrompt: string = `Extract 3-5 key phrases from this text in CSV format\n\n${text}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': tokens.keywords,
    'temperature': 0.2,     // Lower temp: less deterministic
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {
    return data.data.choices[0].text?.trim().replaceAll('"', '');
  });
}

export const getGPT3Term = async (history: string, prompt: string) => {
  const gptPrompt: string = `${history}\n\n${prompt}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': tokens.term,
    'temperature': 0.2,
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {
    return data.data.choices[0].text?.trim();
  });
}


export const getTopics = async (prompt: string, concept: string) => {
  const gptPrompt: string = `${prompt} ${prompt}`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': 128,
    'temperature': 0.7,
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {

    const text = data.data.choices[0].text;

    if (typeof text === 'string') {

        let re = /\d.*\n*/g; // regex pattern

        let subtopics : any;
        subtopics = text.match(re);// put all subtopics into array
        
        if (Array.isArray(subtopics)) {        
            // remove unnecessary characters
            subtopics.forEach((elem, idx) => subtopics[idx] = elem.replace(/\d. /, ''));
            subtopics.forEach((elem, idx) => subtopics[idx] = elem.replace(/ ?\n/, ''));
            return subtopics;
        }
    }
  });
}