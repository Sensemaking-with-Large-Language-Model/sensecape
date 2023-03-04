import { useCallback, useEffect, useState } from "react";
import { getRectOfNodes, useReactFlow, XYPosition } from "reactflow";
import "./flex-input.scss";
import loadingDots from "../../assets/loading.gif";
import { ResponseState } from "../input.model";
import { CreativeNode, CreativeNodeData, InputHoverState } from "../../nodes/node.model";
import { uuid, zoomLimits } from "../../utils";
import { ChatNodeData } from "../../nodes/chat-node/chat-node.model";
import { ConceptNodeData } from "../../nodes/concept-node/concept-node.model";
import { MemoNodeData } from "../../nodes/memo-node/memo-node.model";
import { ReactComponent as BrainstormIcon } from '../../assets/node-icons/brainstorm.svg';
import { ReactComponent as SearchIcon } from '../../assets/node-icons/search.svg';
import { ReactComponent as HierarchyIcon } from '../../assets/node-icons/hierarchy.svg';
import { ReactComponent as MemoIcon } from '../../assets/node-icons/memo.svg';

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
      } as ConceptNodeData;
    } else if (clickedNodeType === 'memo') {
      data = {
        state: {},
      } as MemoNodeData;
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
        data: data as any,
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
      
      // grab flex node id
      const flexNodeElem = elem?.parentElement?.parentElement;
      const elem_ = flexNodeElem?.querySelectorAll(`[data-nodeid]`)[0] as HTMLElement;
      const flexNodeId = elem_?.getAttribute('data-nodeid') as string;

      // grab input element
      const inputElem = elem?.parentElement?.parentElement?.getElementsByClassName('text-input')[0] as HTMLInputElement;

      // grab (x, y) of flex node
      const flexNode = reactFlowInstance.getNode(flexNodeId);
      const flexNodePosition = flexNode?.position;
      
      // grab input 
      const inputText = inputElem.value;
      
      // change the color of the double clicked button for a split second? 


      // create node based on nodeType
      createNode(flexNodeId, inputText, flexNodePosition as XYPosition);
    }
  }

  // when mouse leaves button (i.e., after cursor hovers over), return placeholder text to correspond to active (clicked) button
  const handleMouseOut = (id: string) => {
    const elem = document.getElementById(id);
    // const buttonElements = elem?.parentElement?.parentElement?.getElementsByClassName('flex-node-button');
    // let activeElem;

    // for (let i = 0; i < buttonElements?.length!; i++) {
    //   if (buttonElements![i].classList.contains('active')) {
    //     activeElem = buttonElements![i];
    //   }
    // }
    const inputElem = elem?.parentElement?.parentElement?.getElementsByClassName('text-input')[0];
    inputElem?.setAttribute('placeholder', placeholderText(clickedNodeType) as string);
    setHoveredNodeType('');
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
          { Icon(clickedNodeType) }
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
            Brainstorm&nbsp;<BrainstormIcon />
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
            Search&nbsp;<SearchIcon />
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
            Hierarchy&nbsp;<HierarchyIcon />
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
            Memo&nbsp;<MemoIcon />
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

// used to update icon in input element within flex node depending on which element is selected
const Icon = (selectedNodeType: string) => {
  switch (selectedNodeType) {
    case 'brainstorm':
      return (<BrainstormIcon />)
    case 'chat':
      return (<SearchIcon />)
    case 'concept':
      return (<HierarchyIcon />)
    case 'memo':
      return (<MemoIcon />)
  }
}

export default FlexInput;
