import { Configuration, OpenAIApi } from "openai";
import { ResponseState } from "../app/components/input.model";
import { ReactFlowInstance, MarkerType, Node } from "reactflow";
import { uuid } from "../app/utils";
import { timer } from 'd3-timer';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

const devMode: boolean = true;
const verbose: boolean = true;

// Object that specifies max token length by response type
export const tokens = {
  full: 256,
  summary: 64,
  keywords: 16,
  term: 5,
};

export const getGPT3Response = async (history: string, prompt: string) => {
  if (devMode) {
    return Promise.resolve("OpenAI can't take all my money");
  }

  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: tokens.full,
      temperature: 0.7,
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

export const getGPT3Stream = async (history: string, prompt: string) => {
  if (devMode) {
    return Promise.resolve("OpenAI can't take all my money");
  }
  const gptPrompt: string = `${history}\n\n${prompt}\n\n`;

  return await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: gptPrompt,
      max_tokens: tokens.full,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: true,
      logprobs: null,
      stop: "",
    })
    .then((data) => {
      console.log(data);
      return data;
      // return data.data.choices[0].text?.trim();
    });
};

// Semantic Zoom: Summarize text if zoomed out medium amount
export const getGPT3Summary = async (text: string) => {
  if (devMode) {
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
export const getGPT3Keywords = async (text: string) => {
  if (devMode) {
    return Promise.resolve("OpenAI rich enough");
  }
  // If text is as short as what we're asking, just return the text
  if (text.length <= tokens.keywords) {
    return Promise.resolve(text);
  }

  const gptPrompt: string = `Extract 3-5 key phrases from this text in CSV format\n\n${text}\n\n`;

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

export const getGPT3Term = async (history: string, prompt: string) => {
  if (devMode) {
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

export const getTopics = async (prompt: string, concept: string) => {
  if (devMode) {
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

export const getGPT3Questions = async (concept: string) => {
  if (devMode) {
    return Promise.resolve([
      "placeholder questions",
      {
        why: ["placeholder question"],
        what: ["placeholder question"],
        when: ["placeholder question"],
        where: ["placeholder question"],
        how: ["placeholder question"],
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
  id: string,
  pos: string,
  concept: string,
  conceptnode: boolean = true,
  setResponseState?: Function
) => {
  const parentNode = reactFlowInstance.getNode(id);

  if (!parentNode) {
    return;
  }

  if (verbose) {
    console.log("=====");
    console.log("concept", concept);
    console.log("=====");
  }

  if (setResponseState) {
    setResponseState(ResponseState.LOADING);
  }
  let prompt = "";
  let sourceHandleId = "";
  let targetHandleId = "";
  let newNodePosition: { x: number; y: number };
  let nodeType = "";
  let edgeLabel = "";

  if (!parentNode) {
    return;
  }

  if (pos === "top") {
    prompt = "Give me 5 higher level topics of " + concept;
    sourceHandleId = "a";
    targetHandleId = "b";
    // edgeLabel = "upper-level topic";
    if (conceptnode) {
      newNodePosition = {
        x: parentNode.position.x - 50,
        y: parentNode.position.y - 200,
      };
    } else {
      // if suptopic, create it above
      newNodePosition = {
        x: parentNode.position.x,
        y: parentNode.position.y - 200,
      };
    }
    nodeType = "suptopic";
  } else if (pos === "bottom") {
    prompt = "Give me 3 lower level topics of " + concept;
    sourceHandleId = "b";
    targetHandleId = "a";
    // edgeLabel = "lower-level topic";
    if (conceptnode) {
      newNodePosition = {
        x: parentNode.position.x - 50,
        y: parentNode.position.y + 200,
      };
    } else {
      newNodePosition = {
        // if subtopic, create it below
        x: parentNode.position.x,
        y: parentNode.position.y + 200,
      };
    }
    nodeType = "subtopic";
  } else if (pos === "left") {
    prompt =
      "Give me 5 related topics of " +
      concept +
      " at this level of abstraction";
    sourceHandleId = "c";
    targetHandleId = "d";
    newNodePosition = {
      x: parentNode.position.x - 150,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  } else if (pos === "right") {
    prompt =
      "Give me 5 related topics of " +
      concept +
      " at this level of abstraction";
    sourceHandleId = "d";
    targetHandleId = "c";
    newNodePosition = {
      x: parentNode.position.x + 250,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  }

  let topics: string[] | any;
  if (devMode) {
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
    topics = await getTopics(prompt, concept);
  }

  // const parentNodeLabel = parentNode.data['label'];
  if (verbose) {
    console.log("topics", topics);
  }

  let childNodeArray = [];
  let childEdgeArray = [];

  for (const topic of topics) {
    // create a unique id for the child node
    const childNodeId = uuid();

    // create the child node
    const childNode: Node = {
      id: childNodeId,
      parentNode: parentNode.id,
      // we try to place the child node close to the calculated position from the layout algorithm
      // 150 pixels below the parent node, this spacing can be adjusted in the useLayout hook
      position: newNodePosition!,
      type: "subtopic",
      width: 150,
      height: 50,
      // type: nodeType,
      // data: { label: randomLabel() },
      data: { label: topic,
        rootId: parentNode.data.rootId? parentNode.data.rootId: parentNode.id,
      },
    };

    console.log("childNode", childNode);
    console.log("======");

    const childEdge = {
      id: `${parentNode.id}=>${childNodeId}`,
      source: parentNode.id,
      target: childNodeId,
      // label: edgeLabel,
      // sourceHandle: sourceHandleId,
      // targetHandle: targetHandleId,
      type: "default",
      // type: "step",
      // markerEnd: {
      //   type: MarkerType.ArrowClosed,
      // },
      data: {
        rootId: parentNode.data.rootId? parentNode.data.rootId: parentNode.id,
      }
    };

    childNodeArray.push(childNode);
    childEdgeArray.push(childEdge);
  }

  console.log("childNodeArray", childNodeArray);
  console.log("childEdgeArray", childEdgeArray);

  const currNodes = reactFlowInstance.getNodes();
  const currEdges = reactFlowInstance.getEdges();

  // await reactFlowInstance.addNodes(childNode);
  // await reactFlowInstance.addEdges(childEdge);

  await reactFlowInstance.setNodes([...currNodes, ...childNodeArray]);
  await reactFlowInstance.setEdges([...currEdges, ...childEdgeArray]);

  if (setResponseState) {
    setResponseState(ResponseState.COMPLETE);
  }

  // return [childNode, childEdge];
  return;
  // return childNode;

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
