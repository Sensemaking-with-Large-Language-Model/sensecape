import { useCallback } from 'react';
import { NodeProps, useReactFlow, getOutgoers } from 'reactflow';
import { Configuration, OpenAIApi } from 'openai';

import { uuid, randomLabel } from '../utils';

// this hook implements the logic for clicking a workflow node
// on workflow node click: create a new child node of the clicked node
export function useNodeClick(id: NodeProps['id']) {
  const { setEdges, setNodes, getNodes, getEdges, getNode } = useReactFlow();

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPEN_AI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const askGPT = async (prompt: string) => {

    // console.log('asking GPT...');

    const response = await openai.createCompletion({
      'model': 'text-davinci-003',
      'prompt': prompt,// + 'and return the response with a new line in between each sentence.',
      'max_tokens': 128,
      'temperature': 0.7,
      'top_p': 1,
      'n': 1,
      'stream': false,
      'logprobs': null,
      'stop': ''
    });

    // const text = response.data.choices[0].text.trim();
    const text = response.data.choices[0].text;
    // console.log(text);

    let re = /\d.*\n*/g; // regex pattern

    let subtopics: any
    subtopics = text!.match(re); // put all subtopics into array
    
    // remove unnecessary characters
    subtopics.forEach((elem:string, idx:number) => subtopics[idx] = elem.replace(/\d. /, ''));
    subtopics.forEach((elem:string, idx:number) => subtopics[idx] = elem.replace(/ ?\n/, ''));

    // console.log('subtopics', subtopics);
    
    return subtopics;
  }

  const onClick = async () => {
    // we need the parent node object for positioning the new child node
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // create a unique id for the child node
    const childNodeId = uuid();

    // create a unique id for the placeholder (the placeholder gets added to the new child node)
    const childPlaceholderId = uuid();

    const parentNodeLabel = parentNode.data['label'];

    const prompt = 'Give me six sub-topics for ' + '' + parentNodeLabel;

    // console.log('prompt:', prompt);

    // const subtopics = await askGPT(prompt);
    const subtopics = ['Interaction Design', 'Usability Engineering', 'Cognitive Psychology', 'Human Factors', 'Interface Design', 'Multimodal Interaction']

    // console.log('subtopics:', subtopics);

    // create the child node
    const childNode = {
      id: childNodeId,
      // we try to place the child node close to the calculated position from the layout algorithm
      // 150 pixels below the parent node, this spacing can be adjusted in the useLayout hook
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      type: 'workflow',
      // data: { label: randomLabel() },
      data: { label: subtopics[Math.floor(Math.random() * 10 % 6)] },
    };

    // create a placeholder for the new child node
    // we want to display a placeholder for all workflow nodes that do not have a child already
    // as the newly created node will not have a child, it gets this placeholder
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // we place the placeholder 150 pixels below the child node, spacing can be adjusted in the useLayout hook
      position: { x: childNode.position.x, y: childNode.position.y + 150 },
      type: 'placeholder',
      data: { label: '+' },
    };

    // we need to create a connection from parent to child
    const childEdge = {
      id: `${parentNode.id}=>${childNodeId}`,
      source: parentNode.id,
      target: childNodeId,
      type: 'workflow',
      data: {},
    };

    // we need to create a connection from child to our placeholder
    const childPlaceholderEdge = {
      id: `${childNodeId}=>${childPlaceholderId}`,
      source: childNodeId,
      target: childPlaceholderId,
      type: 'placeholder',
      data: {},
    };

    // if the clicked node has had any placeholders as children, we remove them because it will get a child now
    const existingPlaceholders = getOutgoers(parentNode, getNodes(), getEdges())
      .filter((node) => node.type === 'placeholder')
      .map((node) => node.id);

    // add the new nodes (child and placeholder), filter out the existing placeholder nodes of the clicked node
    setNodes((nodes) =>
      nodes.filter((node) => !existingPlaceholders.includes(node.id)).concat([childNode, childPlaceholderNode])
    );

    // add the new edges (node -> child, child -> placeholder), filter out any placeholder edges
    setEdges((edges) =>
      edges.filter((edge) => !existingPlaceholders.includes(edge.target)).concat([childEdge, childPlaceholderEdge])
    );
  };

  return onClick;
}

export default useNodeClick;
