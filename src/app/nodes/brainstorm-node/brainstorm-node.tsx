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
import {
  getGPT3Keywords,
  getGPT3Questions,
  getGPT3Response,
  getGPT3Stream,
  getGPT3Summary,
} from "../../../api/openai-api";
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

  // const GeneratedQuestions = () => {
  //   let text = '';
  //   let keys_ = Object.keys(questions);
  //   for (let k of keys_) {
  //     for (let i = 0; i < 5; i++) {
  //       console.log(questions[k][i]);
  //       text += <span id="question-{index}">question[k][i]</span>;
  //     }
  //   }
  //   console.log(text);
  //   return text;
  // };

  return (
    <div className="brainstorm-node">
      <DragHandle className="drag-handle" />
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
            {
              Object.entries(questions).map((elem:any, index:number) =>
                  <div className="brainstorm-response-block">
                    {
                      // values.map((y:any) => <span className="brainstorm-questions">{ y }</span>)
                      elem[1].map((e:any) => <div className="brainstorm-response-question">{ e }</div>)
                    }
                  </div>
                )
            }
            </>
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
