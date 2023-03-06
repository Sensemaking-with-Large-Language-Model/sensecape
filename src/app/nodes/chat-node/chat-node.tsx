import { Component, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Edge, Handle, NodeProps, Position, ReactFlowInstance, useReactFlow, useStore, XYPosition } from 'reactflow';
import { getGPT3Keywords, getGPT3Response, getGPT3Stream, getGPT3Summary } from '../../../api/openai-api';
import './chat-node.scss';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { isHighlightable } from './highlighter';
import HighlightTooltip from './highlight-tooplip/highlight-toolip';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
import { createRoot } from 'react-dom/client';
import { ChatNodeData, TypeChatNode } from './chat-node.model';
import GPTInput from '../../components/gpt-input/gpt-input';
import { ResponseState } from '../../components/input.model';
import { createChatNode } from './chat-node.helper';
import { InputHoverState, ZoomState } from '../node.model';
import { InstanceState } from '../../triggers/semantic-dive/semantic-dive';
import { TopicNodeData } from '../topic-node/topic-node.model';

type ChatState = {
  input: string,
  response: string, // Singular response. more follow ups/responses belong in another chatnode
  responseIsLoading: boolean,
  highlightIds: string[],
  currentHighlightId: string,
  reactFlowInstance: ReactFlowInstance,
};

const zoomSelector = (s: any) => s.transform[2];

const ChatNode = (props: NodeProps) => {
  const [input, setInput] = useState(props.data.state.input ?? '');

  // TODO: Combine 3 responses into one object
  const [response, setResponse] = useState(props.data.state.response ?? '');
  const [summary, setSummary] = useState(props.data.state.summary ?? '');
  const [keywords, setKeywords] = useState(props.data.state.keywords ?? '');

  const [responseInputState, setResponseInputState] = useState<ResponseState>(props.data.state.responseInputState ?? ResponseState.INPUT);
  const [highlightIds, setHighlightIds] = useState<string[]>(props.data.state.highlightIds ?? []);

  const zoom: number = useStore(zoomSelector);

  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    reactFlowInstance.setNodes((nodes) => nodes.map(node => {
      if (node.id === props.id) {
        node.data.state = {
          input,
          response,
          summary,
          keywords,
          responseInputState,
          highlightIds
        };
      }
      return node;
    }));
  }, [reactFlowInstance, input, response, summary, keywords, responseInputState, highlightIds]);

  useEffect(() => {
    console.log(props.data.state.input, props.data.state.responseInputState)
    // If a response is already given, don't take in any input.
    if (props.data.state.input && props.data.state.responseInputState === ResponseState.LOADING) {
      generateResponse(input);
    } else if (props.data.state.responseInputState === ResponseState.INPUT) {
      const currElement = document.querySelectorAll(`[data-id="${props.id}"]`)[0];
      const inputElement = currElement.getElementsByClassName('text-input')[0] as HTMLInputElement;
      setTimeout(() => {
        inputElement.focus();
      }, 100);
    }
  }, []);

  const addChatFollowUpNode = useCallback(
    (input: string, response: string) => {
      const data: ChatNodeData = {
        parentId: props.id,
        chatReference: `${props.data.chatReference}\n\n${input}\n\n${response}\n\n`,
        // We want chat node to have no response yet, since the user will ask for a response
        placeholder: 'Ask a follow up question',
        state: {},
      };
      createChatNode(reactFlowInstance, props.id, data);
    },
    [reactFlowInstance]
  )

  const generateResponse = async (prompt: string) => {
    if (!prompt) return;

    setResponseInputState(ResponseState.LOADING);

    const response = await getGPT3Response(
      props.data.chatReference, prompt
    ) || 'Error: no response received';

    setResponse(response);
    setResponseInputState(ResponseState.COMPLETE);
    generateSummaries(response);
    addChatFollowUpNode(prompt, response);
  }

  /**
   * Semantic Zoom
   * Generates the summary and keywords of response
   */
  const generateSummaries = (text: string) => {
    if (!text) return;

    getGPT3Summary(text).then(data => {
      setSummary(data || 'Error: generate summary failed');
    });

    getGPT3Keywords(text).then(data => {
      setKeywords(data || 'Error: generate keywords failed');
    });
  }

  // When a highlight is dragged out of text
  const onDragStart = (event: any, nodeType: string, topicName: string) => {
    event.dataTransfer.setData('dragNodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(props.id);
    if (!currNode) {
      return;
    }
    const data = JSON.stringify({
      parentId: props.id,
      chatReference: `${currNode.data.chatReference}\n\n${input}\n\n${response}`,
      instanceState: InstanceState.NONE,
      state: {
        topic: topicName
      }
    } as TopicNodeData);
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

  // Depending on Zoom level, show response by length
  const isZoomState = (zoomState: ZoomState) => {
    // if summary and keywords both haven't loaded, show default
    if (!(summary && keywords) || zoom > ZoomState.ALL) {
      return zoomState === ZoomState.ALL ? 'chat-text-show' : '';
    } else if (zoom > ZoomState.SUMMARY) {
      return zoomState === ZoomState.SUMMARY ? 'chat-text-show' : '';
    } else {
      return zoomState === ZoomState.KEYWORDS ? 'chat-text-show' : '';
    }
  }

  // Idea: summaryzoom >= ALL

  return (
    // Allow highlighting only for fully expanded text
    // <div className='chat-node highlightable'>
    <div className={`node chat-node ${zoom >= ZoomState.ALL ? 'highlightable' : 'drag-handle'}`}>
      <Handle type="target" position={Position.Top} id="b" className="node-handle-direct "/>
      <DragHandle className='drag-handle' />
      <GPTInput
        sourceId={props.id}
        responseState={responseInputState}
        setResponseState={setResponseInputState}
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
    </div>
  )

}

export default ChatNode;
