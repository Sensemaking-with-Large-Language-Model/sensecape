<<<<<<< HEAD
import { Component, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Edge, Handle, NodeProps, Position, ReactFlowInstance, useReactFlow, useStore, XYPosition } from 'reactflow';
import { getGPT3Keywords, getGPT3Response, getGPT3Stream, getGPT3Summary } from '../../../api/openai-api';
import './brainstorm-node.scss';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { isHighlightable } from '../chat-node/highlighter';
import HighlightTooltip from '../chat-node/highlight-tooplip/highlight-toolip';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
import { createRoot } from 'react-dom/client';
import { BrainstormNodeData, TypeBrainstormNode } from './brainstorm-node.model';
import GPTInput from '../../components/gpt-input/gpt-input';
import { ResponseState } from '../../components/input.model';
import { createBrainstormNode } from './brainstorm-node.helper';
import { InputHoverState, ZoomState } from '../node.model';
=======
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
import { ResponseState } from "../../components/gpt-input/gpt-input.model";
import { createBrainstormNode } from "./brainstorm-node.helper";
import { ZoomState } from "../node.model";
>>>>>>> 8916383672beb55790b58660e777689e3b6aba95

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
<<<<<<< HEAD
    // Allow highlighting only for fully expanded text
    // <div className='chat-node highlightable'>
      <div className={`chat-node ${zoom >= ZoomState.ALL ? 'highlightable' : 'drag-handle'}`}>
      <TooltipProvider>
        <Handle type="target" position={Position.Top} id="b" className="node-handle-direct "/>
        <DragHandle className='drag-handle' />
        <GPTInput
          responseState={responseInputState}
          generateResponse={generateResponse}
          placeholder={props.data.placeholder}
          input={input}
          setInput={setInput}
          setInputState={(s: InputHoverState) => {}}
        />
        <div
          id='highlight-box'
          className='highlight-box'
          onMouseUp={highlightSelection}
        >
          {/* <div className='chat-response'>
            this is a temporary response block because GPT-3 is not working for me right now. Idk why but I hope it works soon so I can ask questions. I have a lot of questions that need to be answered.
          </div> */}
          {/* {response ? (<ResponseByZoom />) : <></>} */}
          {response ? (
            <>
              <div className={`chat-response all ${isZoomState(ZoomState.ALL)}`}>{response}</div>
              <div className={`chat-response summary ${isZoomState(ZoomState.SUMMARY)}`}>{summary}</div>
              <div className={`chat-response keywords ${isZoomState(ZoomState.KEYWORDS)}`}>{keywords}</div>
            </>
          ) : <></>}
        </div>
        <Handle type="source" position={Position.Bottom} id="a" className="node-handle-direct" />
        <Tooltip
          // anchorId={this.state.currentHighlightId}
          place="bottom"
        ></Tooltip>
        {/* <div className="highlight-tooltip">tooltip?</div> */}
        {/* <HighlightTooltip /> */}
      </TooltipProvider>
=======
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
>>>>>>> 8916383672beb55790b58660e777689e3b6aba95
    </div>
  );
};

export default BrainstormNode;
