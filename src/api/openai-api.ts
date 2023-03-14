import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { ResponseState } from "../app/components/input.model";
import { ReactFlowInstance, MarkerType, Node } from "reactflow";
import { devFlags, uuid } from "../app/utils";
import { timer } from 'd3-timer';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

const extractTopicPrompt: ChatCompletionRequestMessage = {
  // I'm trying to push ChatGPT to respond in one term 
  role: 'user',
  content:
    `You are not a conversational agent, so don't converse
    with me. Your response is directly being transformed into a
    topic, so your text will not be able to be parsed, so please
    strip all unnecessary content from your response. This
    rule about length is very very strict. This text should be
    glancable. No quotes, no punctuation.`
};

// Object that specifies max token length by response type
export const tokens = {
  full: 1028,
  summary: 64,
  keywords: 16,
  term: 5,
};

export const getChatGPTResponse = async (history: ChatCompletionRequestMessage[], prompt: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("OpenAI can't take all my money");
  }

  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...history,
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: tokens.full,
    temperature: 0.7,
  })
  .then((data) => {
    return data.data.choices[0].message?.content.trim();
  });
};

// Semantic Zoom: Summarize text if zoomed out medium amount
export const getChatGPTSummary = async (text: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("Boba for 1 dollar");
  }
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.summary) {
    return Promise.resolve(text);
  }

  const gptPrompt: string = `Summarize this text in a 1-2 phrases:\n\n${text}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: tokens.summary,
      temperature: 0.4, // Lower temp: less deterministic
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      return data.data.choices[0].text?.trim();
    });
};

// Semantic Zoom: Summarize text if zoomed out large amount
export const getChatGPTKeywords = async (text: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("OpenAI rich enough");
  }
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.keywords) {
    return Promise.resolve(text);
  }

  const gptPrompt: string = `Extract 1-3 key words from this text in CSV format\n\n${text}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: tokens.keywords,
      temperature: 0.2, // Lower temp: less deterministic
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      return data.data.choices[0].text?.trim().replaceAll('"', "");
    });
};

export const getChatGPTOverarchingTopic = async (context: string[]) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("parent");
  }

  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      extractTopicPrompt,
      {
        role: 'user',
        content: `Give me the overarching key topic in the form of a
          term in 1 to 3 words given this context: ${context}`,
      }
    ],
    max_tokens: tokens.keywords,
    temperature: 0.1,
  })
  .then((data) => {
    return data.data.choices[0].message?.content.replaceAll(/"|\./g, '').trim();
  });
}

export const getChatGPTRelatedTopics = async (context: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve(['recommendation1', 'recommendation2', 'recommendation3']);
  }

  const nTopics = 5;

  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      extractTopicPrompt,
      {
        role: 'user',
        content: `Give me ${nTopics} and only ${nTopics} related topics in the form of
          terms in 1 to 3 words each given this context: ${context}\n\n
          format your response in CSV (comma separated values).`,
      }
    ],
    max_tokens: tokens.keywords,
    n: 5,
    temperature: 1.7,
  })
  .then((data) => {
    return data.data.choices[0].message?.content
      .split(',').map(topic => topic.replaceAll(/"/g, '').trim()) ?? [];
  });
}

export const getGPT3Term = async (history: string, prompt: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("#save1dollar");
  }
  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: tokens.term,
      temperature: 0.2,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      return data.data.choices[0].text?.trim();
    });
};

export const getTopics = async (concept: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("free text");
  }

  let prompt = "Give me 3 lower level topics of " + concept;

  const gptPrompt: string = `${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: 128,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      const text = data.data.choices[0].text;

      if (typeof text === "string") {
        let re = /\d.*\n*/g; // regex pattern

        let subtopics: any;
        subtopics = text.match(re); // put all subtopics into array

        if (Array.isArray(subtopics)) {
          // remove unnecessary characters
          subtopics.forEach(
            (elem, idx) => (subtopics[idx] = elem.replace(/\d. /, ""))
          );
          subtopics.forEach(
            (elem, idx) => (subtopics[idx] = elem.replace(/ ?\n/, ""))
          );
          return subtopics;
        }
      }
    });
};

export const getGPTTopicsNCategory = async (prompt: string, concept: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve("free text");
  }
  const gptPrompt: string = `${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: 128,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      const text = data.data.choices[0].text;
      let subtopics: any;
      let category: string;

      // get categories
      if (typeof text === "string") {
        let re = /\d.*\n*/g; // regex pattern

        subtopics = text.match(re); // put all subtopics into array

        if (Array.isArray(subtopics)) {
          // remove unnecessary characters
          subtopics.forEach(
            (elem, idx) => (subtopics[idx] = elem.replace(/\d. /, ""))
          );
          subtopics.forEach(
            (elem, idx) => (subtopics[idx] = elem.replace(/ ?\n/, ""))
          );
          return subtopics;
        }


      }
    });
};

export const getGPT3Questions = async (concept: string) => {
  if (devFlags.disableOpenAI) {
    return Promise.resolve([
      "placeholder questions",
      {
        why: ["placeholder question", "placeholder question", "placeholder question", "placeholder question", "placeholder question"],
        what: ["placeholder question", "placeholder question", "placeholder question", "placeholder question", "placeholder question"],
        when: ["placeholder question", "placeholder question", "placeholder question", "placeholder question", "placeholder question"],
        where: ["placeholder question", "placeholder question", "placeholder question", "placeholder question", "placeholder question"],
        how: ["placeholder question", "placeholder question", "placeholder question", "placeholder question", "placeholder question"],
      },
    ]);
  }
  const prompt =
    "I need to learn about " +
    concept +
    `. Give me a total of 25 questions, 
  with questions starting with "why", 5 questions starting with "when", 
  5 questions starting with "where", 5 questions starting with "how", 
  and 5 questions starting with "what".`;
  const gptPrompt: string = `${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: 700,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      const text: any = data.data.choices[0].text;

      let question_set: any;
      if (text !== null) {
        question_set = {
          why: text
            .match(/Why .+?$/gm)
            .map((elem: string) => elem.replace("\n", ""))
            .map((elem: string) => elem.replace("? ", "?")),
          when: text
            .match(/When .+?$/gm)
            .map((elem: string) => elem.replace("\n", ""))
            .map((elem: string) => elem.replace("? ", "?")),
          where: text
            .match(/Where .+?$/gm)
            .map((elem: string) => elem.replace("\n", ""))
            .map((elem: string) => elem.replace("? ", "?")),
          how: text
            .match(/How .+?$/gm)
            .map((elem: string) => elem.replace("\n", ""))
            .map((elem: string) => elem.replace("? ", "?")),
          what: text
            .match(/What .+?$/gm)
            .map((elem: string) => elem.replace("\n", ""))
            .map((elem: string) => elem.replace("? ", "?")),
        };
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
};

export const extendConcept = async (
  reactFlowInstance: ReactFlowInstance,
  concept: string,
  conceptnode: boolean = true,
) => {

  if (devFlags.disableVerbose) {
    console.log("=====");
    console.log("concept", concept);
    console.log("=====");
  }

  let topics: string[] | any;
  if (devFlags.disableOpenAI) {
    topics = [
      //   "Human Resources Management",
      //   "Financial Management",
      //   "Project Management",
      //   "Strategic Planning",
      //   "Risk Management",
      //   "Quality Management",
      "San Diego Beaches",
      "San Diego Restaurants",
      "San Diego Museums",
    ];
  } else {
    topics = await getTopics(concept);
  }

  return topics;

  // return [childNode, childEdge];
  return;
  // return childNode;

  let childNodeArray = [];
  let childEdgeArray = [];

  const options = { duration: 300 };

  // to interpolate and animate the new positions, we create objects that contain the current and target position of each node
  const transitions = childNodeArray.map((node) => {
    return {
      id: node.id,
      // this is where the node currently is placed
      from: reactFlowInstance.getNode(node.id)?.position || node.position,
      // this is where we want the node to be placed
      to: node.position,
      node,
    };
  });

    // create a timer to animate the nodes to their new positions
    const t = timer((elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          id: node.id,
          position: {
            // simple linear interpolation
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
          data: { ...node.data },
          type: node.type,
        };
      });

      reactFlowInstance.setNodes(currNodes);

      // this is the final step of the animation
      if (elapsed > options.duration) {
        // we are moving the nodes to their destination
        // this needs to happen to avoid glitches
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            id: node.id,
            position: {
              x: to.x,
              y: to.y,
            },
            data: { ...node.data },
            type: node.type,
          };
        });

        reactFlowInstance.setNodes(finalNodes);

        // stop the animation
        t.stop();

      }
    });


};
