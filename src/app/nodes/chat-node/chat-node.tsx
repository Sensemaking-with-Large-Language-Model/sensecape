import { Component, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Edge, Handle, NodeProps, Position, ReactFlowInstance, useReactFlow, XYPosition } from 'reactflow';
import { askGPT3Input } from '../../../api/openai-api';
import './chat-node.scss';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { isHighlightable } from './highlighter';
import HighlightTooltip from './highlight-tooplip/highlight-toolip';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
import { createRoot } from 'react-dom/client';
import { TypeChatNode } from './chat-node.model';
import GPTInput from '../../components/gpt-input/gpt-input';
import { ResponseState } from '../../components/gpt-input/gpt-input.model';

type ChatState = {
  input: string,
  response: string, // Singular response. more follow ups/responses belong in another chatnode
  responseIsLoading: boolean,
  highlightIds: string[],
  currentHighlightId: string,
  reactFlowInstance: ReactFlowInstance,
};

// interface HighlightHoverPosition {
  
// }

class Highlight extends HTMLElement {
  constructor() {
    const curr = super();
    // this.attachShadow({ mode: 'open' });
    // console.log(curr)
    // const ReactApp = () => {
    //   return (
    //     <span onMouseEnter={() => this.handleMouseEnter()}>
    //       <TooltipWrapper content="This is a tooltip">
    //         text
    //       </TooltipWrapper>
    //     </span>
    //   );
    // };
    // createRoot(this.shadowRoot ?? new ShadowRoot).render(<ReactApp />);
  }

  handleMouseEnter() {
    console.log('hovering in react!');
  }
}

customElements.define("highlight-text", Highlight);

const ChatNode = (props: NodeProps) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [responseInputState, setResponseInputState] = useState<ResponseState>(ResponseState.INPUT);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);

  const reactFlowInstance = useReactFlow();

  const addChatFollowUpNode = useCallback(
    (input: string, response: string) => {
      const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(props.id);
      if (!currNode) {
        return;
      }
      setTimeout(() => {
        const nodeElement = document.querySelectorAll(`[data-id="${props.id}"]`)[0]
        const height = nodeElement.clientHeight;
        const width = nodeElement.clientWidth;
        // x: subtract half of new node width, add half of current width
        const position: XYPosition = {
          x: (width / 2) - (575 / 2),
          y: (height ?? 0) + 20,
          // x: currNode.position.x,
          // y: currNode.position.y + (height ?? 0) + 20,
        };
        const newNode: TypeChatNode = {
          id: `chat-${reactFlowInstance.getNodes().length}`,
          type: 'chat',
          dragHandle: '.drag-handle',
          position,
          parentNode: currNode.id,
          data: {
            parentChatId: currNode.id,
            chatReference: `${currNode.data.chatReference}\n\n${input}\n\n${response}\n\n`,
            // We want chat node to have no response yet, since the user will ask for a response
            placeholder: 'Ask a follow up question',
          },
        };
        const edge: Edge =  {
          id: `e-${reactFlowInstance.getEdges().length}`,
          source: currNode.id,
          target: newNode.id,
        }
        reactFlowInstance.addNodes(newNode);
        reactFlowInstance.addEdges(edge);
        console.log(reactFlowInstance.getNodes());
      }, 0);
    },
    [reactFlowInstance]
  )

  const generateResponse = async (prompt: string) => {
    if (!prompt) {
      return;
    }

    setResponseInputState(ResponseState.LOADING);

    const response = await askGPT3Input(
      props.data.chatReference, prompt
    ) || 'Error: no response received';

    setResponse(response);
    setResponseInputState(ResponseState.COMPLETE);
    addChatFollowUpNode(prompt, response);
  }

  useEffect(() => {
    // If a response is already given, don't take in any input.
    if (props.data.instantInput) {
      console.log('ready to create follow up!');
      setInput(props.data.instantInput);
      generateResponse(props.data.instantInput);
    }
  }, []);

  // When a highlight is dragged out of text
  const onDragStart = (event: any, nodeType: string, topicName: string) => {
    event.dataTransfer.setData('dragNodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(props.id);
    if (!currNode) {
      return;
    }
    const data = JSON.stringify({
      chatNodeId: props.id,
      chatReference: `${currNode.data.chatReference}\n\n${input}\n\n${response}`,
      topicName,
    });
    console.log(data);
    event.dataTransfer.setData('dragNodeData', data);
  };

  const highlightSelection = () => {
    const selection = document.getSelection();
    if ((selection?.rangeCount ?? 0) <= 0) {
      return;
    }
    const range: Range = selection?.getRangeAt(0) ?? new Range;
    const selectedText = range.toString();
    if (isHighlightable(range)) {
      const highlight = document.createElement('highlight-text', {is: selectedText});
      highlight.draggable = true;
      highlight.innerHTML = selectedText;
      range.surroundContents(highlight);
      highlight.classList.add('highlight-elm');
      highlight.id = `highlight-${highlightIds.length}`;
      setHighlightIds(highlightIds.concat([highlight.id]));

      // Event Listeners
      // highlight.addEventListener('mouseenter', (event) => {
      //   setCurrentHighlightId(highlight.id);
      // })
      // highlight.addEventListener('mouseleave', (event) => {
      //   setCurrentHighlightId('');
      // })
      highlight.addEventListener('click', (event) => {
        range.extractContents();
        range.insertNode(document.createTextNode(selectedText));
        range.commonAncestorContainer.normalize();
      })
      highlight.addEventListener('dragstart', (event) => {
        onDragStart(event, 'topic', selectedText);
      })
      window.getSelection()?.removeAllRanges();
    }
  }

  return (
    <div className='chat-node'>
      <TooltipProvider>
        <Handle type="target" position={Position.Top} id="b" />
        <DragHandle className='drag-handle' />
        <GPTInput
          responseState={responseInputState}
          generateResponse={generateResponse}
          placeholder={props.data.placeholder}
          input={input}
          setInput={setInput}
        />
        <div
          id='highlight-box'
          className='highlight-box'
          onMouseUp={highlightSelection}
        >
          {/* <div className='chat-response'>
            this is a temporary response block because GPT-3 is not working for me right now. Idk why but I hope it works soon so I can ask questions. I have a lot of questions that need to be answered.
          </div> */}
          {response ? (
            <div className='chat-response'>{response}</div>
            ) : <></>}
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
        <Tooltip
          // anchorId={this.state.currentHighlightId}
          place="bottom"
        ></Tooltip>
        {/* <div className="highlight-tooltip">tooltip?</div> */}
        {/* <HighlightTooltip /> */}
      </TooltipProvider>
    </div>
  )

}

export default ChatNode;
