import { useCallback, useState } from "react";
import { getRectOfNodes, useReactFlow } from "reactflow";
import './gpt-input.scss';
import loadingDots from "../../../assets/loading.gif";
import { ReactComponent as ExploreIcon } from "../../../assets/node-icons/search.svg";
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
    const parentNode = reactFlowInstance.getNode(sourceNode?.parentNode ?? '');
    const focusNodes = [];
    if (parentNode) {
      focusNodes.push(parentNode);
    }
    if (sourceNode) {
      focusNodes.push(sourceNode);
    }
    reactFlowInstance.fitView({
      duration: 900,
      padding: focusNodes.length > 1 ? 0.2 : 1,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min,
      nodes: focusNodes,
    });
  },
  [reactFlowInstance]);

  const handleOnBlur = (event: any) => {
    props.setInputState(InputHoverState.OUT);
    props.setResponseState(ResponseState.IDLE);
  }

  if (props.responseState === ResponseState.INPUT || props.responseState === ResponseState.IDLE) {
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
          <ExploreIcon />
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