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
import { ReactComponent as DragHandle } from "../../assets/drag-handle.svg";
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
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [questions, setQuestions] = useState({});
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

    setResponse(response[0]);
    setQuestions(response[1]);
    setResponseInputState(ResponseState.COMPLETE);
  };

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
      <Handle type="source" position={Position.Right} />
      <BrainstormInput
        placeholder={props.data.placeholder}
        generateQuestions={generateQuestions}
        responseState={responseInputState}
        id={props.id}
        input={input}
        setInput={setInput}
      />
      {response ? (
        <>
          {showContent ? (
            // <div className="brainstorm-response">{response}</div>
            <>
              {Object.entries(questions).map((elem: any, index: number) => (
                <div className="brainstorm-response-block" key={index}>
                  {
                    // elem[1].map((question: any, index:number) => <QuestionNode id={`${input}` + "-" + {index} + "-" + elem[0]} selected={false} type={question} data={''} zIndex={100} isConnectable={true} xPos={0} yPos={0} dragging={false} keyword={input} index={index} fiveWsType={elem[0]} question={question} />)
                    elem[1].map((question: any, index:number) => <div key={index}><Handle type="source" position={Position.Right} /><QuestionNode keyword={input} index={index} fiveWsType={elem[0]} question={question} parentId={props.id} /></div>)
                  }
                </div>
              ))
              }
            </>
          ) : (
            // <>
            // {
            //   Object.values(questions).map((values:any) =>
            //       <div>
            //         {
            //           values.map((y:any) => <span className="brainstorm-questions">{ y }</span>)
            //         }
            //       </div>
            //     )
            // }
            // </>
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
