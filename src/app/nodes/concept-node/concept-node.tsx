import { useEffect, useState, useCallback } from "react";
import {
  NodeProps,
  Handle,
  Position,
  ReactFlowInstance,
  useReactFlow,
} from "reactflow";
import { getGPT3Term, getTopics } from "../../../api/openai-api";
import { ResponseState } from "../../components/input.model";
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
  const [responseSelfState, setResponseSelfState] = useState(props.data.state.responseSelfState ?? ResponseState.INPUT);
  const [responseInputState, setResponseInputState] = useState(props.data.state.responseInputState ?? ResponseState.INPUT);
  const [concept, setConcept] = useState(props.data.state.concept ?? "");
  const [input, setInput] = useState(props.data.state.input ?? "");
  const [lowLevelTopics, setLowLevelTopics] = useState<string[]>([]);
  const [highLevelTopics, setHighLevelTopics] = useState<string[]>([]);

  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (node.id === props.id) {
        node.data.state = {
          responseSelfState,
          responseInputState,
          concept,
          input
        }
      }
      return node;
    }))
  }, [reactFlowInstance])

  const generateConceptFromTopics = async (context: string, prompt: string) => {
    if (!prompt) return;

    setResponseSelfState(ResponseState.LOADING);

    const response =
      (await getGPT3Term(context, prompt)) || "Error: no response received";

    setConcept(response);
    setResponseSelfState(ResponseState.COMPLETE);
  };

  // When concept node renders, gpt3 is called
  useEffect(() => {
    if (!concept && props.data.topicNodes.length > 0) {
      // TODO: Too much duplicate strings. Make this a linear timeline
      const conceptContext = "";
      // const conceptContext = props.data.topicNodes.join('\n\n')
      const prompt = `${props.data.topicNodes
        .map((node: TypeTopicNode) => node.data.state.topic)
        .join(", ")}\n\n
        What is the overarching concept? (1-3 words)`;
      generateConceptFromTopics(conceptContext, prompt);
    }
  }, []);

  const calluseNodeClick = useNodeClick(props.id);

  if (responseSelfState === ResponseState.INPUT) {
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
        className={`node concept-node`}
        // onBlur={() => setResponseState(ResponseState.COMPLETE)}
      >
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle handle-top visible" : "concept-node-handle handle-top hidden"}
          // className="concept-node-handle handle-top visible"
          position={Position.Top}
          onClick={()=>extendConcept(reactFlowInstance, props.id, 'top', input)}
          id="a"
        />
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          // className="concept-node-handle handle-top visible"
          position={Position.Bottom}
          onClick={()=>extendConcept(reactFlowInstance, props.id, 'bottom', input)}
          // onClick={calluseNodeClick}
          id="b"
        />
        {/* target node for traveller edges */}
        <Handle type="target" position={Position.Left} className="node-handle-direct"/>
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
  } else if (responseSelfState === ResponseState.LOADING) {
    return (<div className="concept-node">
      <Handle type="target" position={Position.Left} className="node-handle-direct"/>
      Generating concept...
      </div>);
  } else {
    return (
      <div
        className="concept-node"
        onClick={() => setResponseSelfState(ResponseState.INPUT)}
      >
        <Handle type="target" position={Position.Left} className="node-handle-direct"/>
        {concept || "Enter concept"}
      </div>
    );
  }
};

export default ConceptNode;
