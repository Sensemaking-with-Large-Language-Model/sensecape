import { Component, useCallback, useEffect, useState } from "react";
import { Edge, Handle, NodeProps, Position, useReactFlow, useStore, XYPosition } from "reactflow";
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { ResponseState } from "../../components/gpt-input/gpt-input.model";
import { createChatNode } from "../chat-node/chat-node.helper";
import { ChatNodeData, TypeChatNode } from "../chat-node/chat-node.model";
import { ZoomState } from "../node.model";
import './topic-node.scss';
import TopicTooltip from "./topic-tooltip/topic-tooltip";

const zoomSelector = (s: any) => s.transform[2];

const TopicNode = (props: NodeProps) => {
  const [topic, setTopic] = useState(props.data.topicName);
  const [responseInputState, setResponseInputState] = useState<ResponseState>(ResponseState.INPUT);
  const [tooltipAvailable, setTooltipAvailable] = useState(true);
  const zoom: number = useStore(zoomSelector);

  const reactFlowInstance = useReactFlow();

  const addInstantChatNode = useCallback(
    (input: string) => {
      const data: ChatNodeData = {
        parentChatId: props.id,
        chatReference: `${props.data.chatReference}\n\nFocusing on ${topic}:\n\n`,
        // We want chat node to already show a response
        placeholder: '',
        instantInput: input,
      };
      createChatNode(reactFlowInstance, props.id, data);
    },
    [reactFlowInstance]
  );

  /**
   * 
   * Idea: Create a chat node that connects from this topic, then
   * in that chat node make it so that the input is already generating
   * 
   * 
   * @param prompt 
   * @returns 
   */
  const generateResponse = async (prompt: string) => {
    if (!prompt) {
      return;
    }
    addInstantChatNode(prompt);
    setTooltipAvailable(false);
  }

  // Depending on Zoom level, show response by length
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return 'all';
    } else if (zoom > ZoomState.SUMMARY) {
      return 'summary';
    } else {
      return 'keywords';
    }
  }

  return (
    <div className={`topic-node ${zoom >= ZoomState.ALL ? '' : 'drag-handle'}`}>
      <div className={`topic-node-box ${props.selected ? 'topic-selected' : ''}`}>
        <DragHandle className='drag-handle' />
        <div className={`${currentZoomState()}`}>{topic}</div>
      </div>
      {tooltipAvailable ?
        <TopicTooltip
          topic={topic}
          generateResponse={generateResponse}
          responseState={responseInputState}
        /> : <></>
      }
      <Handle type="source" position={Position.Bottom} className="node-handle-direct"/>
    </div>
  )
}

export default TopicNode;