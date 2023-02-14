import { Component, useCallback, useState } from "react";
import { Edge, Handle, NodeProps, Position, useReactFlow, XYPosition } from "reactflow";
import { askGPT3Input } from "../../../api/openai-api";
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { ResponseState } from "../../components/gpt-input/gpt-input.model";
import { TypeChatNode } from "../chat-node/chat-node.model";
import './topic-node.scss';
import TopicTooltip from "./topic-tooltip/topic-tooltip";

const TopicNode = (props: NodeProps) => {
  const [topic, setTopic] = useState(props.data.topicName);
  const [responseInputState, setResponseInputState] = useState<ResponseState>(ResponseState.INPUT);
  const [tooltipAvailable, setTooltipAvailable] = useState(true);

  const reactFlowInstance = useReactFlow();

  const addInstantChatNode = useCallback(
    (input: string) => {
      const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(props.id);
      if (!currNode) {
        return;
      }
      setTimeout(() => {
        const nodeElement = document.querySelectorAll(`[data-id="${props.id}"]`)[0]
        const height = nodeElement.clientHeight;
        const width = nodeElement.clientWidth;
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
            chatReference: `${currNode.data.chatReference}\n\nFocusing on ${topic}:\n\n`,
            // We want chat node to already show a response
            placeholder: '',
            instantInput: input,
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

  return (
    <div className="topic-node">
      <div className="topic-node-box">
        <DragHandle className='drag-handle' />
        {topic}
      </div>
      {tooltipAvailable ?
        <TopicTooltip
          topic={topic}
          generateResponse={generateResponse}
          responseState={responseInputState}
        /> : <></>
      }
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default TopicNode;