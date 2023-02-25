import { useState } from "react";
import "./brainstorm-input.scss";
import { useStore, useReactFlow, getRectOfNodes } from "reactflow";
import loadingDots from "../../assets/loading.gif";
import { ResponseState } from "../input.model";
import { uuid, zoomLimits } from "../../utils";
import { getTopics } from "../../../api/openai-api";
import { ZoomState } from "../../nodes/node.model";
import extendConcept from "../../hooks/useExtendConcept";

const zoomSelector = (s: any) => s.transform[2];

const BrainstormInput = (props: any) => {
  const reactFlowInstance = useReactFlow();
  const zoom: number = useStore(zoomSelector);

  // Depending on Zoom level, vary concept font size
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return "all";
    } else if (zoom > ZoomState.SUMMARY) {
      return "summary";
    } else {
      return "keywords";
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
        padding: 1,
        maxZoom: zoomLimits.max,
        minZoom: zoomLimits.min,
        nodes: [sourceNode]
      });
    }
  };

  if (props.responseState === ResponseState.INPUT) {
    return (
      <form
        className="concept-form"
        // className={`${currentZoomState()}`}
        onSubmit={(event) => {
          event.preventDefault();
          props.generateQuestions(props.input.trim());
        }}
      >
        <input
          id="text"
          className="brainstorm-input"
          // className={`${currentZoomState()}`}
          name="text"
          type="text"
          placeholder="Add keyword(s): e.g., San Diego, NYC"
          autoComplete="off"
          value={props.input}
          onChange={handleInputChange}
          onFocus={handleOnFocus}
        />
        <button
          onClick={() => {
            props.generateQuestions(props.input);
          }}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 4H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 20H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 12H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    );
  } else if (props.responseState === ResponseState.LOADING) {
    return (
      <div className="brainstorm-input">
        {/* <div className="brainstorm-keywords">Keyword(s): {props.input}</div> */}
        <div className={`brainstorm-keywords ${currentZoomState()}`}>Keyword(s): {props.input}</div>
        <div className="brainstorm-loading">
          <img width="18px" height="18px" src={loadingDots} alt="loading..." />
        </div>
      </div>
    );
  } else {
    return (
      <>
        {/* <div className="brainstorm-keywords">Keyword(s): {props.input}</div> */}
        <div className={`brainstorm-keywords ${currentZoomState()}`}>Keyword(s): {props.input}</div>
      </>
    );
  }
};

export default BrainstormInput;
