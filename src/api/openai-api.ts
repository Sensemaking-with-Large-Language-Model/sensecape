import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

const devMode: boolean = true;

// Object that specifies max token length by response type
export const tokens = {
  full: 256,
  summary: 64,
  keywords: 16,
  term: 5
}

export const getGPT3Response = async (history: string, prompt: string) => {
  if (devMode) {
    return Promise.resolve("OpenAI can't take all my money");
  }

  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

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
  if (devMode) {
    return Promise.resolve("OpenAI can't take all my money");
  }
  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

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
  if (devMode) {
    return Promise.resolve("Boba for 1 dollar");
  }
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.summary) {
    return Promise.resolve(text);
  };

  const gptPrompt: string = `Summarize this text in a 1-2 phrases:\n\n${text}\n\n`;

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
  if (devMode) {
    return Promise.resolve("OpenAI rich enough");
  }
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.keywords) {
    return Promise.resolve(text);
  };

  const gptPrompt: string = `Extract 3-5 key phrases from this text in CSV format\n\n${text}\n\n`;

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
  if (devMode) {
    return Promise.resolve("#save1dollar");
  }
  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

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
  if (devMode) {
    return Promise.resolve("free text");
  }
  const gptPrompt: string = `${prompt}\n\n`;

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

export const getGPT3Questions = async (concept: string) => {
  if (devMode) {
    return Promise.resolve(["placeholder questions",{'why':['placeholder question'], 'what':['placeholder question'], 'when':['placeholder question'], 'where':['placeholder question'], 'how':['placeholder question']}]);
  }
  const prompt = 'I need to learn about ' + concept + `. Give me a total of 25 questions, 
  with questions starting with "why", 5 questions starting with "when", 
  5 questions starting with "where", 5 questions starting with "how", 
  and 5 questions starting with "what".`;
  const gptPrompt: string = `${prompt}\n\n`;

  return await openai.createCompletion({
    'model': 'text-davinci-003',
    'prompt': gptPrompt,
    'max_tokens': 700,
    'temperature': 0.7,
    'top_p': 1,
    'n': 1,
    'stream': false,
    'logprobs': null,
    'stop': ''
  }).then((data) => {

    const text: any = data.data.choices[0].text;

    let question_set: any;
    if (text !== null) {
      question_set = {
        'why': text.match(/Why .+?$/gm).map((elem:string) => elem.replace('\n','')).map((elem:string) => elem.replace('? ','?')),
        'when': text.match(/When .+?$/gm).map((elem:string) => elem.replace('\n','')).map((elem:string) => elem.replace('? ','?')),
        'where': text.match(/Where .+?$/gm).map((elem:string) => elem.replace('\n','')).map((elem:string) => elem.replace('? ','?')),
        'how': text.match(/How .+?$/gm).map((elem:string) => elem.replace('\n','')).map((elem:string) => elem.replace('? ','?')),
        'what': text.match(/What .+?$/gm).map((elem:string) => elem.replace('\n','')).map((elem:string) => elem.replace('? ','?'))
      }
    }

    return [text, question_set];
    // if (typeof text === 'string') {

    //     let re = /\d.*\n*/g; // regex pattern

    //     let subtopics : any;
    //     subtopics = text.match(re);// put all subtopics into array
        
    //     if (Array.isArray(subtopics)) {        
    //         // remove unnecessary characters
    //         subtopics.forEach((elem, idx) => subtopics[idx] = elem.replace(/\d. /, ''));
    //         subtopics.forEach((elem, idx) => subtopics[idx] = elem.replace(/ ?\n/, ''));
    //         return subtopics;
    //     }
    // }
  });
}

