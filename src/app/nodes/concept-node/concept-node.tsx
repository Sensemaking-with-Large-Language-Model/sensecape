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

import { uuid } from "../../utils";

import useNodeClick from "../../hooks/useNodeClick";

import "./concept-node.scss";

import extendConcept from "../../hooks/useExtendConcept";

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
  const [lowLevelTopics, setLowLevelTopics] = useState<string[]>([]);
  const [highLevelTopics, setHighLevelTopics] = useState<string[]>([]);
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

  const calluseNodeClick = useNodeClick(props.id);

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

      <div
        className="concept-node"
        // onBlur={() => setResponseState(ResponseState.COMPLETE)}
      >
        <Handle
          type="source"
          className={
            input !== ""
              ? "concept-node-handle handle-top visible"
              : "concept-node-handle handle-top hidden"
          }
          // className="concept-node-handle handle-top visible"
          position={Position.Top}
          onClick={() => {
            // setResponseState(ResponseState.LOADING);
            extendConcept(reactFlowInstance, props.id, "top", input, true);
          }}
          id="a"
        />
        <Handle
          type="source"
          className={
            input !== ""
              ? "concept-node-handle visible"
              : "concept-node-handle hidden"
          }
          // className="concept-node-handle handle-top visible"
          position={Position.Bottom}
          onClick={() => {
            // setResponseState(ResponseState.LOADING);
            extendConcept(reactFlowInstance, props.id, "bottom", input, true);
          }}
          // onClick={calluseNodeClick}
          id="b"
        />
        {/* target node for traveller edges */}
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
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
    return (
      <div className="concept-node">
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
        />
        Generating concept...
      </div>
    );
  } else {
    return (
      <div
        className="concept-node"
        onClick={() => setResponseState(ResponseState.INPUT)}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
        />
        {concept || "Enter concept"}
      </div>
    );
  }
};

export default ConceptNode;
