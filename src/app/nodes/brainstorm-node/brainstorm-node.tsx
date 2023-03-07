import { Component, useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import {
  Edge,
  Handle,
  NodeProps,
  Position,
  ReactFlowInstance,
  useReactFlow,
  useStore,
  XYPosition,
} from "reactflow";
import { getGPT3Questions } from "../../../api/openai-api";
import "./brainstorm-node.scss";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import { isHighlightable } from "../chat-node/highlighter";
import HighlightTooltip from "../chat-node/highlight-tooplip/highlight-toolip";
import { Tooltip, TooltipProvider, TooltipWrapper } from "react-tooltip";
import { createRoot } from "react-dom/client";
import {
  BrainstormNodeData,
  TypeBrainstormNode,
} from "./brainstorm-node.model";
import BrainstormInput from "../../components/brainstorm-input/brainstorm-input";
import { ResponseState } from "../../components/input.model";
import { createBrainstormNode } from "./brainstorm-node.helper";
import { ZoomState } from "../node.model";
import { createChatNode } from "../chat-node/chat-node.helper";

import { ChatNodeData, TypeChatNode } from "../chat-node/chat-node.model";
import QuestionNode from "./question-node";
import { QuestionNodeData, TypeQuestionNode } from "./question-node.model";

type BrainstormState = {
  input: string;
  response: string; // Singular response. more follow ups/responses belong in another chatnode
  responseIsLoading: boolean;
  reactFlowInstance: ReactFlowInstance;
};

const zoomSelector = (s: any) => s.transform[2];

const BrainstormNode = (props: NodeProps) => {
  const [input, setInput] = useState(props.data.state.input ?? '');
  const [questions, setQuestions] = useState(props.data.state.questions ?? {});
  const [responseInputState, setResponseInputState] = useState<ResponseState>(
    ResponseState.INPUT
  );
  const zoom: number = useStore(zoomSelector);

  const showContent = zoom >= 0.35;

  const reactFlowInstance = useReactFlow();

  const generateQuestions = async (keyword: string) => {
    if (!keyword) return;
    setResponseInputState(ResponseState.LOADING);

    const response =
      (await getGPT3Questions(keyword)) || "Error: no response received";

    // console.log('response[1]', response[1]);
    setQuestions(response[1]);
    setResponseInputState(ResponseState.COMPLETE);
  };

  useEffect(() => {
    reactFlowInstance.setNodes((nodes) => nodes.map(node => {
      if (node.id === props.id) {
        node.data.state = {
          input,
          questions,
          responseInputState
        };
      }
      console.log('brainstorm node responseInputState', responseInputState);
      return node;
    }));
  }, [reactFlowInstance, input, questions, responseInputState]);

  useEffect(() => {
    // console.log(props.data.state.input, props.data.state.responseInputState)
    // If a response is already given, don't take in any input.
    if (props.data.state.input && props.data.state.responseInputState === ResponseState.LOADING) {
      generateQuestions(input);
    } else if (props.data.state.responseInputState === ResponseState.INPUT) {
      const currElement = document.querySelectorAll(`[data-id="${props.id}"]`)[0];
      const inputElement = currElement.getElementsByClassName('text-input')[0] as HTMLInputElement;
      setTimeout(() => {
        inputElement.focus();
      }, 100);
    }
  }, []);

  const Placeholder = () => (
    <div className="placeholder">
      <div />
      <div />
      <div />
      <br></br>
      <div />
      <div />
      <div />
      <br></br>
      <div />
      <div />
      <div />
      <br></br>
      <div />
      <div />
      <div />
      <br></br>
      <div />
      <div />
      <div />
    </div>
  );

  return (
    <div className={`node brainstorm-node`}>
      <DragHandle className="drag-handle" />
      {/* <Handle type="source" position={Position.Right} /> */}
      <Handle type="source" position={Position.Bottom} className="node-handle-direct" />
      <BrainstormInput
        placeholder={props.data.placeholder}
        generateQuestions={generateQuestions}
        responseState={responseInputState}
        id={props.id}
        input={input}
        setInput={setInput}
      />
      {questions ? (
        <>
          {showContent ? (
            // <div className="brainstorm-response">{response}</div>
            <>
              {Object.entries(questions).map((elem: any, questionTypeIndex: number) => (
                <div className="brainstorm-response-block" key={questionTypeIndex}>
                  {
                    // elem[1].map((question: any, index:number) => <QuestionNode id={`${input}` + "-" + {index} + "-" + elem[0]} selected={false} type={question} data={''} zIndex={100} isConnectable={true} xPos={0} yPos={0} dragging={false} keyword={input} index={index} fiveWsType={elem[0]} question={question} />)
                    elem[1].map((question: any, index:number) => <div key={index}><QuestionNode keyword={input} index={(questionTypeIndex * 5) + index} fiveWsType={elem[0]} question={question} parentId={props.id} /></div>)
                  }
                </div>
              ))
              }
            </>
          ) : (
            <Placeholder />
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default BrainstormNode;
