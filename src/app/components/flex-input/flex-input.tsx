import { useCallback, useEffect, useState } from "react";
import { getRectOfNodes, useReactFlow, XYPosition } from "reactflow";
import "./flex-input.scss";
import loadingDots from "../../assets/loading.gif";
import { ResponseState } from "../input.model";
import { CreativeNode, CreativeNodeData, InputHoverState } from "../../nodes/node.model";
import { uuid, zoomLimits } from "../../utils";
import { ChatNodeData } from "../../nodes/chat-node/chat-node.model";

const FlexInput = (props: any) => {
  const reactFlowInstance = useReactFlow();
  const [clickedNodeType, setClickedNodeType] = useState("chat");
  const [hoveredNodeType, setHoveredNodeType] = useState('');

  const handleInputChange = (event: any) => {
    props.setInput(event.target.value);
  };

  // move viewport to node when input on focus
  const handleOnFocus = useCallback(
    (event: any) => {
      props.setInputState(InputHoverState.CLICKED);
      const sourceNode = reactFlowInstance.getNode(props.sourceId);
      if (sourceNode) {
        reactFlowInstance.fitView({
          duration: 900,
          padding: 1,
          maxZoom: zoomLimits.max,
          minZoom: zoomLimits.min,
          nodes: [sourceNode],
        });
      }
    },
    [reactFlowInstance]
  );

  // if currently selected node, add 'active' css
  const selectedType = (nodeType: string) => {
    return nodeType === clickedNodeType ? "active" : "";
  };

  // return corresponding placeholder text for node type
  const placeholderText = (nodeType: string) => {
    switch(nodeType) {
      case 'brainstorm':
        return 'Add keyword(s): e.g., San Diego, NYC';
      case 'chat':
        return 'Ask a question: e.g., What is ...?';
      case 'concept':
        return 'Add concept';
      case 'memo':
        return 'Type notes here';
    }
  }

  // update input placeholder text when mouse hovers over button
  const handleMouseOver = (id: string, nodeType: string) => {
    const elem = document.getElementById(id);
    const inputElem = elem?.parentElement?.parentElement?.getElementsByClassName('text-input')[0];
    inputElem?.setAttribute('placeholder', placeholderText(nodeType) as string);
    setHoveredNodeType(nodeType);
  };

  // when 'enter' is pressed, create node according to selected node type
  const handleSubmit = (event: any) => {
    const inputText = event.currentTarget.getElementsByClassName('text-input')[0].value;
    const flexNodeElem = event.currentTarget.parentElement;
    const elem_ = flexNodeElem?.querySelectorAll(`[data-nodeid]`)[0] as HTMLElement;
    const flexNodeId = elem_?.getAttribute('data-nodeid') as string;
    const flexNode = reactFlowInstance.getNode(flexNodeId);
    const flexNodePosition = flexNode?.position;

    createNode(flexNodeId, inputText, flexNodePosition as XYPosition);
  }

  // create node
  const createNode = async (flexNodeId: string, inputText: string, nodePosition: XYPosition) => {

    let data: CreativeNodeData;

    if (clickedNodeType === 'brainstorm') {
      data = {
        parentId: '',
        chatReference: '',
        placeholder: inputText,
        state: {
          input: inputText,
          responseInputState: ResponseState.LOADING,
        },
      };
    } else if (clickedNodeType === 'chat') {
      data = {
        parentId: '',
        chatReference: '',
        placeholder: inputText,
        state: {
          input: inputText,
          responseInputState: ResponseState.LOADING,
        },
      } as ChatNodeData;
    } else if (clickedNodeType === 'concept') {
      data = {
        label: inputText,
        topicNodes: [],
        state: {
          input: inputText,
          responseInputState: ResponseState.LOADING,
        },
      };
    } else if (clickedNodeType === 'memo') {
      data = {
        label: inputText,
        // Memo node holds no data for now
      }
    } else {
      return;
    }

      const position: XYPosition = nodePosition as XYPosition;
      // Type of node denoted in id
      const type = clickedNodeType;
      const nodeId = `${clickedNodeType}-${uuid()}`;
      const newNode: CreativeNode = {
        id: nodeId,
        dragHandle: ".drag-handle",
        type,
        position,
        data,
      };

      // remove existing flex node
      await reactFlowInstance.setNodes((nodes) => nodes.filter((node) => node.id !== flexNodeId));

      // add new node
      reactFlowInstance.setNodes((nodes) => nodes.concat(newNode));
  }

  // handle button click
  const handleClick = async (event: any, nodeType: string = 'chat') => {

    if (event.detail === 1) { // if single click, just update placeholder text and icon
      const buttonElem = event.target as HTMLInputElement;
      const elem = document.getElementById(buttonElem.id);
      const buttonElements = elem?.parentElement?.parentElement?.getElementsByClassName('flex-node-button');
      for (let i = 0; i < buttonElements?.length!; i++) {
        buttonElements![i].classList.remove('active');
      }
      elem?.classList.add('active');
      setClickedNodeType(nodeType);
    } else if (event.detail === 2) { // if double click, trigger action and create corresponding node
      
      // use currentTarget because event.target was returning null (cf. https://stackoverflow.com/questions/71253604/reactjs-getattribute-return-null)
      // https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget 
      const buttonElem = event.currentTarget as HTMLInputElement;
      const elem = document.getElementById(buttonElem.id);
      const flexNodeElem = elem?.parentElement?.parentElement;
      const elem_ = flexNodeElem?.querySelectorAll(`[data-nodeid]`)[0] as HTMLElement;
      const flexNodeId = elem_?.getAttribute('data-nodeid') as string;
      console.log('flexNodeId', flexNodeId);
      
      const inputElem = elem?.parentElement?.parentElement?.getElementsByClassName('text-input')[0] as HTMLInputElement;

      // grab (x, y) of flex node
      const flexNode = reactFlowInstance.getNode(flexNodeId);
      const flexNodePosition = flexNode?.position;
      
      // grab input 
      const inputText = inputElem.value;
      console.log(inputText);
      
      // change the color of the double clicked button for a split second? 


      // create node based on nodeType
      createNode(flexNodeId, inputText, flexNodePosition as XYPosition);
    }
  }

  // when mouse leaves button (i.e., after cursor hovers over), return placeholder text to correspond to active (clicked) button
  const handleMouseOut = (id: string) => {
    const elem = document.getElementById(id);
    const buttonElements = elem?.parentElement?.parentElement?.getElementsByClassName('flex-node-button');
    let activeElem;
    for (let i = 0; i < buttonElements?.length!; i++) {
      if (buttonElements![i].classList.contains('active')) {
        activeElem = buttonElements![i];
      }
    }
    const inputElem = elem?.parentElement?.parentElement?.getElementsByClassName('text-input')[0];
    inputElem?.setAttribute('placeholder', placeholderText(clickedNodeType) as string);
    setHoveredNodeType('');
  }

  // used to update icon in input element within flex node depending on which element is selected
  const Icon = () => {
    if (hoveredNodeType === '') {
      switch (clickedNodeType) {
        case 'brainstorm':
          return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 4H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 20H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 12H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
          case 'chat':
            return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 5H20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H17" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 22L20 20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          case 'concept':
            return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          case 'memo':
            return (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1.5V3.75M12 1.5V3.75M5.25 8.25H11.25M5.25 11.25H9M11.25 16.5H6.75C3 16.5 2.25 14.955 2.25 11.865V7.2375C2.25 3.7125 3.5025 2.7675 6 2.625H12C14.4975 2.76 15.75 3.7125 15.75 7.2375V12" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 12L11.25 16.5V14.25C11.25 12.75 12 12 13.5 12H15.75Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
        }
    } else {
      switch (hoveredNodeType) {
        case 'brainstorm':
          return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 4H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 20H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 12H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
          case 'chat':
            return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 5H20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H17" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 22L20 20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          case 'concept':
            return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          case 'memo':
            return (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1.5V3.75M12 1.5V3.75M5.25 8.25H11.25M5.25 11.25H9M11.25 16.5H6.75C3 16.5 2.25 14.955 2.25 11.865V7.2375C2.25 3.7125 3.5025 2.7675 6 2.625H12C14.4975 2.76 15.75 3.7125 15.75 7.2375V12" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 12L11.25 16.5V14.25C11.25 12.75 12 12 13.5 12H15.75Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
        }
    }
  }

  if (props.responseState === ResponseState.INPUT) {
    return (
      <>
        <form
          className="chat-input"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(event);
            // props.generateResponse(props.input.trim());
          }}
        >
          <input
            id="input"
            className="text-input"
            name="text"
            type="text"
            placeholder={props.placeholder}
            autoComplete="off"
            value={props.input}
            onChange={handleInputChange}
            onFocus={handleOnFocus}
          />
          <button
            type="button"
          >
          { Icon() }
          </button>
        </form>
        <div className="node-type-selection">
          <button
            // onClick={() => props.generateResponse(props.input.trim())}
            // className={`flex-node-button ${clickedNodeType === 'brainstorm'? 'active': ''}`}
            id={`flex-brainstorm-${uuid()}`}
            node-type="brainstorm"
            className={`flex-node-button ${selectedType("brainstorm")}`}
            type="button"
            onMouseOver={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOver(elem.id, 'brainstorm');
            }}
            onClick={(event) => {
              // const elem = event.target as HTMLInputElement;
              handleClick(event, 'brainstorm');
            }}
            onMouseOut={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOut(elem.id);
            }}
          >
            Brainstorm&nbsp;
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 4H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 20H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 12H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            // onClick={() => props.generateResponse(props.input.trim())}
            id={`flex-chat-${uuid()}`}
            node-type="chat"
            className={`flex-node-button ${selectedType("chat")}`}
            type="button"
            onMouseOver={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOver(elem.id, 'chat');
            }}
            onClick={(event) => {
              const elem = event.target as HTMLInputElement;
              handleClick(event, 'chat');
            }}
            onMouseOut={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOut(elem.id);
            }}
          >
            Search&nbsp;
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 5H20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H17" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 22L20 20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            // onClick={() => props.generateResponse(props.input.trim())}
            id={`flex-concept-${uuid()}`}
            node-type="concept"
            className={`flex-node-button ${selectedType("hierarchy")}`}
            type="button"
            onMouseOver={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOver(elem.id, 'concept');
            }}
            onClick={(event) => {
              const elem = event.target as HTMLInputElement;
              handleClick(event, 'concept');
            }}
            onMouseOut={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOut(elem.id);
            }}
          >
            Hierarchy&nbsp;
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            id={`flex-memo-${uuid()}`}
            node-type="memo"
            className={`flex-node-button ${selectedType("memo")}`}
            type="button"
            onMouseOver={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOver(elem.id, 'memo');
            }}
            onClick={(event) => {
              handleClick(event, 'memo');
            }}
            onMouseOut={(event) => {
              const elem = event.target as HTMLInputElement;
              handleMouseOut(elem.id);
            }}
          >
            Memo&nbsp;
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1.5V3.75M12 1.5V3.75M5.25 8.25H11.25M5.25 11.25H9M11.25 16.5H6.75C3 16.5 2.25 14.955 2.25 11.865V7.2375C2.25 3.7125 3.5025 2.7675 6 2.625H12C14.4975 2.76 15.75 3.7125 15.75 7.2375V12" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 12L11.25 16.5V14.25C11.25 12.75 12 12 13.5 12H15.75Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </>
    );
  } else if (props.responseState === ResponseState.LOADING) {
    return (
      <div className="chat-input">
        {props.input}
        <img width="18px" height="18px" src={loadingDots} alt="loading..." />
      </div>
    );
  } else {
    return <div className="chat-input">{props.input}</div>;
  }
};

export default FlexInput;
