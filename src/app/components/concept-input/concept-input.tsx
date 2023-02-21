import { useState } from "react";
import "./concept-input.scss";
import { useStore, useReactFlow } from "reactflow";
import loadingDots from "../../assets/loading.gif";
import { uuid } from "../../utils";
import { getTopics } from "../../../api/openai-api";
import { ZoomState } from "../../nodes/node.model";
import extendConcept from "../../hooks/useExtendConcept";
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
    console.log(props.id);
    reactFlowInstance!.fitView({ duration: 900, padding: 0.3 });
  };

  if (props.responseState === ResponseState.INPUT) {
    return (
      <form
        // className="concept-form"
        className={`${currentZoomState()}`}
        onSubmit={(event) => {
          event.preventDefault();
          // props.setResponseInputState(ResponseState.LOADING);
          extendConcept(
            reactFlowInstance,
            props.id,
            "bottom",
            props.input.trim(),
            true,
            // props.setResponseInputState
          );
        }}
      >
        <input
          id="text"
          className="concept-input"
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
          onClick={() => {
            // props.setResponseInputState(ResponseState.LOADING);
            extendConcept(
              reactFlowInstance,
              props.id,
              "bottom",
              props.input.trim(),
              true,
              // props.setResponseInputState
            );
          }}
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.58227 10.2376L10.2673 7.54512M5.54977 4.74012L11.9173 2.61762C14.7748 1.66512 16.3273 3.22512 15.3823 6.08262L13.2598 12.4501C11.8348 16.7326 9.49477 16.7326 8.06977 12.4501L7.43977 10.5601L5.54977 9.93012C1.26727 8.50512 1.26727 6.17262 5.54977 4.74012Z"
              stroke="#aaa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    );
  } else if (props.responseState === ResponseState.LOADING) {
    return (
      <div className="concept-input">
        {props.input}
        <img width="18px" height="18px" src={loadingDots} alt="loading..." />
      </div>
    );
  } else {
    return <div className="concept-input">{props.input}</div>;
  }
};

export default ConceptInput;
