import { useState } from "react";
import "./concept-input.scss";
import { useStore, useReactFlow, getRectOfNodes } from "reactflow";
import loadingDots from "../../assets/loading.gif";
import { uuid, zoomLimits } from "../../utils";
import { getTopics } from "../../../api/openai-api";
import { ZoomState } from "../../nodes/node.model";
import { extendConcept } from "../../../api/openai-api";
import { ResponseState } from "../input.model";

const zoomSelector = (s: any) => s.transform[2];

const ConceptInput = (props: any) => {
  const reactFlowInstance = useReactFlow();
  const zoom: number = useStore(zoomSelector);

  // Depending on Zoom level, vary concept font size
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return "concept-form all";
    } else if (zoom > ZoomState.SUMMARY) {
      return "concept-form summary";
    } else {
      return "concept-form keywords";
    }
  };

  const handleInputChange = (event: any) => {
    props.setInput(event.target.value);
  };

  const handleOnFocus = (event: any) => {
    const sourceNode = reactFlowInstance.getNode(props.id);
    if (sourceNode) {
      reactFlowInstance.fitView({
        duration: 900,
        padding: 3.5,
        maxZoom: zoomLimits.max,
        minZoom: zoomLimits.min,
        nodes: [sourceNode]
      });
    }
  };

  if (props.responseState === ResponseState.INPUT) {
    return (
      <form
        // className="concept-form"
        className={`${currentZoomState()}`}
        onSubmit={(event) => {
          event.preventDefault();
          // props.setResponseInputState(ResponseState.LOADING);
          props.handleSubmit();
          // extendConcept(
          //   reactFlowInstance,
          //   props.id,
          //   "bottom",
          //   props.input.trim(),
          //   true,
          //   props.setResponseInputState
          // );
        }}
      >
        <input
          id="text"
          className="brainstorm-input text-input"
          // className={`${currentZoomState()}`}
          name="text"
          type="text"
          placeholder="Add concept"
          autoComplete="off"
          value={props.input}
          onChange={handleInputChange}
          onFocus={handleOnFocus}
        />
        <button
          onClick={(event) => {
            // props.setResponseInputState(ResponseState.LOADING);
            event.preventDefault();
            props.handleSubmit();
            // extendConcept(
            //   reactFlowInstance,
            //   props.id,
            //   "bottom",
            //   props.input.trim(),
            //   true,
            //   props.setResponseInputState
            // );
          }}
          type="button"
        >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        </button>
      </form>
    );
  } else if (props.responseState === ResponseState.LOADING) {
    return (
      <div className="concept-input">
        {props.input}
        &nbsp;&nbsp;<img width="18px" height="18px" src={loadingDots} alt="loading..." />
      </div>
    );
  } else {
    return <div className="concept-input">{props.input}</div>;
    // return (
    //   <form
    //     // className="concept-form"
    //     className={`${currentZoomState()}`}
    //     onSubmit={(event) => {
    //       event.preventDefault();
    //       // props.setResponseInputState(ResponseState.LOADING);
    //       props.handleSubmit();
    //     }}
    //   >
    //     <input
    //       id="text"
    //       className="brainstorm-input"
    //       // className={`${currentZoomState()}`}
    //       name="text"
    //       type="text"
    //       placeholder="Add concept"
    //       autoComplete="off"
    //       value={props.input}
    //       onChange={handleInputChange}
    //       onFocus={handleOnFocus}
    //     />
    //     <button
    //       onClick={() => {
    //         // props.setResponseInputState(ResponseState.LOADING);
    //         props.handleSubmit();
    //       }}
    //       type="button"
    //     >
    //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    //     </svg>
    //     </button>
    //   </form>
    // );
  }
};

export default ConceptInput;
