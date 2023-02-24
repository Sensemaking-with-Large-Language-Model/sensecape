import { useCallback, useState } from "react";
import { getRectOfNodes, useReactFlow } from "reactflow";
import './gpt-input.scss';
import loadingDots from "../../assets/loading.gif";
import { ResponseState } from "../input.model";
import { InputHoverState } from "../../nodes/node.model";
import { zoomLimits } from "../../utils";


const GPTInput = (props: any) => {
  const reactFlowInstance = useReactFlow();

  const handleInputChange = (event: any) => {
    props.setInput(event.target.value);
  }

  const handleOnFocus = useCallback((event: any) => {
    props.setInputState(InputHoverState.CLICKED);
    const sourceNode = reactFlowInstance.getNode(props.sourceId);
    if (sourceNode) {
      reactFlowInstance.fitView({
        duration: 900,
        padding: 2,
        maxZoom: zoomLimits.max,
        minZoom: zoomLimits.min,
        nodes: [sourceNode]
      });
    }
  },
  [reactFlowInstance]);

  const handleOnBlur = (event: any) => {
    props.setInputState(InputHoverState.OUT);
  }

  if (props.responseState === ResponseState.INPUT) {
    return (
      <form
        className='chat-input'
        onSubmit={(event) => {
          props.generateResponse(props.input.trim());
          event.preventDefault();
        }}
      >
        <input
          id="text"
          className="text-input"
          name="text"
          type="text"
          placeholder={props.placeholder}
          autoComplete='off'
          value={props.input}
          onChange={handleInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
        <button
          onClick={() => props.generateResponse(props.input.trim())}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 5H20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 8H17" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 22L20 20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    );
  } else if (props.responseState === ResponseState.LOADING) {
    return (
      <div className='chat-input'>
        {props.input}
        <img width="18px" height="18px" src={loadingDots} alt="loading..." />
      </div>
    );
  } else {
    return (
      <div className='chat-input'>
        {props.input}
      </div>
    );
  }
}

export default GPTInput;