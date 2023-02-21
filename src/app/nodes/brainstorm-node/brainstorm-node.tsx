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
  const [response, setResponse] = useState('');
  const [responseInputState, setResponseInputState] = useState<ResponseState>(
    ResponseState.INPUT
  );
  const zoom: number = useStore(zoomSelector);

  const reactFlowInstance = useReactFlow();

  const generateQuestions = async (keyword: string) => {
    if (!keyword) return;
    console.log('generateQuestions called');
    setResponseInputState(ResponseState.LOADING);

    const response = await getGPT3Questions(keyword) || 'Error: no response received';

    setResponse(response);
    setResponseInputState(ResponseState.COMPLETE);
    console.log('generateQuestions', response);
  }

  return (
    <div className="brainstorm-node">
      <DragHandle className="drag-handle" />
      <BrainstormInput
        placeholder={props.data.placeholder}
        generateQuestions={generateQuestions}
        responseState={responseInputState}
        input={input}
        setInput={setInput}
      />
        {response ? (
          <>
          <div className='brainstorm-response'>{ response }</div>
            {/* <div className={`chat-response all ${isZoomState(ZoomState.ALL)}`}>{response}</div>
            <div className={`chat-response summary ${isZoomState(ZoomState.SUMMARY)}`}>{summary}</div>
            <div className={`chat-response keywords ${isZoomState(ZoomState.KEYWORDS)}`}>{keywords}</div> */}
          </>
        ) : <></>}
    </div>
  );
};

export default BrainstormNode;
