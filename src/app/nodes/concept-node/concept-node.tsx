import { useEffect, useState, useCallback } from "react";
import {
  NodeProps,
  Handle,
  Position,
  ReactFlowInstance,
  useReactFlow,
} from "reactflow";
import { getGPT3Term, getTopics } from "../../../api/openai-api";
import { ResponseState } from "../../components/gpt-input/gpt-input.model";
import { TypeTopicNode } from "../topic-node/topic-node.model";

import { ReactComponent as DragHandle } from "../../assets/drag-handle.svg";
import ConceptInput from "../../components/concept-input/concept-input";

import { extendConcepts } from "./concept-node.helper";
import { uuid } from "../../utils";

import "./concept-node.scss";

// reference:
// add node on edge drop
// 1. https://reactflow.dev/docs/examples/nodes/add-node-on-edge-drop/
// auto layout (zoom in to specific node)
// 1. https://reactflow.dev/docs/examples/misc/use-react-flow-hook/

type ConceptNodeState = {
  input: string;
  subtopicIsLoading: boolean;
  suptopicIsLoading: boolean;
  lateralRightLoading: boolean;
  lateralLeftLoading: boolean;
  highLevelTopics: string[]; // bottom
  lowLevelTopics: string[]; // up
  lateralRightTopics: string[]; // right
  lateralLeftTopics: string[]; // left
  reactFlowInstance: ReactFlowInstance;
  placeholder: "Add a concept";
};

const ConceptNode = (props: NodeProps) => {
  const [responseState, setResponseState] = useState(ResponseState.INPUT);
  const [concept, setConcept] = useState("");
  const [input, setInput] = useState("");
  const [responseInputState, setResponseInputState] = useState<ResponseState>(
    ResponseState.INPUT
  );
  // const [lowLevelTopics, setLowLevelTopics] = useState<string[]>([]);
  // const [highLevelTopics, setHighLevelTopics] = useState<string[]>([]);
  // const [lateralRightTopics, setlateralRightTopics] = useState<string[]>([]);
  // const [lateralLeftTopics, setlateralLeftTopics] = useState<string[]>([]);

  const reactFlowInstance = useReactFlow();

  const generateConceptFromTopics = async (context: string, prompt: string) => {
    if (!prompt) return;

    setResponseState(ResponseState.LOADING);

    const response =
      (await getGPT3Term(context, prompt)) || "Error: no response received";

    setConcept(response);
    setResponseState(ResponseState.COMPLETE);
  };

  // When concept node renders, gpt3 is called
  useEffect(() => {
    if (!concept && props.data.topicNodes.length > 0) {
      // TODO: Too much duplicate strings. Make this a linear timeline
      const conceptContext = "";
      // const conceptContext = props.data.topicNodes.join('\n\n')
      const prompt = `${props.data.topicNodes
        .map((node: TypeTopicNode) => node.data.topicName)
        .join(", ")}\n\n
        What is the overarching concept? (1-3 words)`;
      generateConceptFromTopics(conceptContext, prompt);
    }
  }, []);

  // const generateTopic = (pos: string, concept: string) => {
  //   let prompt = "";

  //   if (pos === 'top') {
  //     prompt = "Give me 5 higher level topics of " + concept;
  //   } else if (pos === 'bottom') {
  //     prompt = "Give me 5 lower level topics of " + concept;
  //   } else if (pos === 'right' || pos === 'left') {
  //     prompt = "Give me 5 related topics of " + concept + " at this level of abstraction";
  //   }
  //   const topics = getTopics(prompt, concept);

  //   return topics;
  // }

  const extendConcept = async (id: string, pos: string, concept: string) => {
        // we need the parent node object for positioning the new child node

        let prompt = "";
        let sourceHandleId = "";
        let targetHandleId = "";
        let newNodePosition: { x: number, y: number};
        let nodeType = "";
        const parentNode = reactFlowInstance.getNode(id);

        if (!parentNode) {
          return;
        }

        if (pos === 'top') {
          prompt = "Give me 5 higher level topics of " + concept;
          sourceHandleId ='a';
          targetHandleId = 'b';
          newNodePosition = { x: parentNode.position.x, y: parentNode.position.y - 150 };
          nodeType = 'suptopic';
        } else if (pos === 'bottom') {
          prompt = "Give me 5 lower level topics of " + concept;
          sourceHandleId='b';
          targetHandleId = 'a';
          newNodePosition = { x: parentNode.position.x, y: parentNode.position.y + 150 };
          nodeType = 'subtopic';
        } else if (pos === 'left') {
          prompt = "Give me 5 related topics of " + concept + " at this level of abstraction";
          sourceHandleId='c';
          targetHandleId = 'd';
          newNodePosition = { x: parentNode.position.x - 150, y: parentNode.position.y };
          nodeType = 'related-topic';
        } else if (pos === 'right') {
          prompt = "Give me 5 related topics of " + concept + " at this level of abstraction";
          sourceHandleId='d';
          targetHandleId = 'c';
          newNodePosition = { x: parentNode.position.x + 250, y: parentNode.position.y };
          nodeType = 'related-topic';
        }
        
        console.log('prompt', prompt);
        const topics:string[] | any = await getTopics(prompt, concept);

        // create a unique id for the child node
        const childNodeId = uuid();

        // const parentNodeLabel = parentNode.data['label'];

        console.log('topics:', topics);

        // create the child node
        console.log('nodeType', nodeType);
        const childNode = {
          id: childNodeId,
          // we try to place the child node close to the calculated position from the layout algorithm
          // 150 pixels below the parent node, this spacing can be adjusted in the useLayout hook
          position: newNodePosition!,
          type: nodeType,
          // data: { label: randomLabel() },
          data: { label: topics[Math.floor(Math.random() * 10 % 5)] },
        };

        const childEdge = {
          id: `${parentNode.id}=>${childNodeId}`,
          source: parentNode.id,
          target: childNodeId,
          sourceHandle: sourceHandleId,
          targetHandle: targetHandleId,
          type: 'placeholder',
        };

        reactFlowInstance.addNodes(childNode);
        reactFlowInstance.addEdges(childEdge);
  }

  if (responseState === ResponseState.INPUT) {
    return (
      // <div className="concept-node"
      //   onBlur={() => setResponseState(ResponseState.COMPLETE)}
      // >
      //   <form
      //     onSubmit={(event) => {
      //       setResponseState(ResponseState.COMPLETE);
      //       event.preventDefault();
      //     }}
      //   >
      //     <input
      //       name="text"
      //       type="text"
      //       placeholder="Enter concept"
      //       autoFocus
      //       autoComplete='off'
      //       value={concept}
      //       onChange={(event) => setConcept(event.target.value)}
      //     />
      //   </form>
      // </div>

      <div className="concept-node">
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle handle-top visible" : "concept-node-handle handle-top hidden"}
          position={Position.Top}
          onClick={()=>extendConcept(props.id, 'top', input)}
          id="a"
        />
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          position={Position.Bottom}
          onClick={()=>extendConcept(props.id, 'bottom', input)}
          id="b"
        />
        {/* <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          position={Position.Left}
          onClick={()=>extendConcept(props.id, 'left', input)}
          id="c"
        />
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          position={Position.Right}
          onClick={()=>extendConcept(props.id, 'right', input)}
          id="d"
        /> */}
        <DragHandle className="drag-handle" />
        <ConceptInput
          extendConcepts={extendConcepts}
          responseState={responseInputState}
          placeholder={props.data.placeholder}
          setResponseInputState={setResponseInputState}
          id={props.id}
          input={input}
          setInput={setInput}
        />
      </div>
    );
  } else if (responseState === ResponseState.LOADING) {
    return <div className="concept-node">Generating concept...</div>;
  } else {
    return (
      <div
        className="concept-node"
        onClick={() => setResponseState(ResponseState.INPUT)}
      >
        {concept || "Enter concept"}
      </div>
    );
  }
};

export default ConceptNode;
