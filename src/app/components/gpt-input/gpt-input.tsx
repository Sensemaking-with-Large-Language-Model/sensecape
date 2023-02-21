import { useState } from "react";
import { useReactFlow } from "reactflow";
import './gpt-input.scss';
import loadingDots from "../../assets/loading.gif";
import { ResponseState } from "./gpt-input.model";
import { InputHoverState } from "../../nodes/node.model";


const GPTInput = (props: any) => {
  const reactFlowInstance = useReactFlow();

  const handleInputChange = (event: any) => {
    props.setInput(event.target.value);
  }

  const handleOnFocus = (event: any) => {
    props.setInputState(InputHoverState.CLICKED);
    reactFlowInstance!.fitView({ duration: 900, padding: 0.3 });
  };
  
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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.58227 10.2376L10.2673 7.54512M5.54977 4.74012L11.9173 2.61762C14.7748 1.66512 16.3273 3.22512 15.3823 6.08262L13.2598 12.4501C11.8348 16.7326 9.49477 16.7326 8.06977 12.4501L7.43977 10.5601L5.54977 9.93012C1.26727 8.50512 1.26727 6.17262 5.54977 4.74012Z" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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