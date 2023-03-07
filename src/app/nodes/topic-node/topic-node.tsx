import { Component, useCallback, useEffect, useState } from "react";
import { Edge, Handle, NodeProps, NodeToolbar, Position, useReactFlow, useStore, useUpdateNodeInternals, XYPosition } from "reactflow";
import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
import ExpandToolbar from "../../components/expand-toolbar/expand-toolbar";
import { ResponseState } from "../../components/input.model";
import useDetachNodes from '../../hooks/useDetachNodes';
import { InstanceState } from "../../triggers/semantic-dive/semantic-dive";
import { createChatNode } from "../chat-node/chat-node.helper";
import { ChatNodeData, TypeChatNode } from "../chat-node/chat-node.model";
import { InputHoverState, ZoomState } from "../node.model";
import { TypeTopicNode } from "./topic-node.model";
import './topic-node.scss';
import { getGPT3Questions } from "../../../api/openai-api"

const zoomSelector = (s: any) => s.transform[2];

const TopicNode = (props: NodeProps) => {
  const [topic, setTopic] = useState(props.data.state.topic ?? '');
  const [toolbarAvailable, setToolbarAvailable] = useState(props.data.state.toolbarAvailable ?? true);
  const [toolbarViewState, setToolbarViewState] = useState(props.data.state.toolbarViewState ?? InputHoverState.OUT);
  const [isRecommended, setIsRecommended] = useState(props.data.state.isRecommended ?? false);
  const [addingRecommendation, setAddingRecommendation] = useState(false);
  const zoom: number = useStore(zoomSelector);

  const updateNodeInternals = useUpdateNodeInternals();
  const reactFlowInstance = useReactFlow();

  // parent node is the group node
  const isInGroup = useStore((store) => !!store.nodeInternals.get(props.id)?.parentNode);
  const detachNodes = useDetachNodes();

  const onDelete = () => reactFlowInstance.deleteElements({ nodes: [{ id: props.id }] });
  const onDetach = () => detachNodes([props.id]);

  useEffect(() => {
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (node.id === props.id) {
        node.data.state = {
          topic,
          toolbarAvailable,
          toolbarViewState,
          isRecommended,
        }
      }
      return node;
    }))
  }, [reactFlowInstance, topic, toolbarAvailable, toolbarViewState, isRecommended]);

  const addInstantChatNode = useCallback(
    (input: string) => {
      const data: ChatNodeData = {
        parentId: props.id,
        chatHistory: [
          ...props.data.chatHistory,
          {
            role: 'system',
            content: `Conversation is now focused on this topic: ${topic}`
          }
        ],
        // We want chat node to already show a response
        placeholder: '',
        state: {
          input,
          responseInputState: ResponseState.LOADING,
        }
      };
      createChatNode(reactFlowInstance, props.id, data);
    },
    [reactFlowInstance]
  );

  /**
   * Idea: Create a chat node that connects from this topic, then
   * in that chat node make it so that the input is already generating
   *
   * @param prompt 
   * @returns 
   */
  const generateResponse = async (prompt: string) => {
    if (!prompt) {
      return;
    }
    addInstantChatNode(prompt);
    setToolbarAvailable(false);
  }

  // generate questions like in brainstorm node
  const generateQuestions = async (prompt: string) => {
    if (!prompt) {
      return;
    }
    addInstantChatNode(prompt);
    setToolbarAvailable(false);
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

  const getInstanceStateClassName = (instanceState: InstanceState) => {
    if (instanceState === InstanceState.CURRENT) {
      return 'current-semantic-instance';
    } else if (instanceState === InstanceState.WAS) {
      return 'was-semantic-instance';
    }
  }

  return (
    <div
      id={props.id}
      className={`topic-node ${zoom >= ZoomState.ALL ? '' : 'drag-handle'}
        ${isRecommended ? 'recommended-topic' : ''}
        ${addingRecommendation ? 'adding-recommendation' : ''}`}
      onClick={() => {
        if (isRecommended) {
          setIsRecommended(false);
          setAddingRecommendation(true);
        }
      }}
      // onMouseEnter={() => toolbarViewState === InputHoverState.OUT && setToolbarViewState(InputHoverState.HOVER)}
      onMouseEnter={() => {
        if (toolbarViewState === InputHoverState.OUT && !isRecommended) {
          setToolbarViewState(InputHoverState.HOVER);
        } 
      }}
      onMouseLeave={() => (toolbarViewState === InputHoverState.HOVER  && !isRecommended) && setToolbarViewState(InputHoverState.OUT)}
      // style={{
      //   transform: `scale(${Math.max(1/(zoom*1.3), 1)}) translate(${zoom <= 1/1.3 ? '-100px' : '0'})`
      // }}
    >
      <Handle type="target" position={Position.Left} className="node-handle-direct target-handle"/>
      {
        isInGroup &&
        <NodeToolbar className="nodrag">
          <button onClick={onDetach}>Detach</button>
        </NodeToolbar>
      }
      <div
        className={`node topic-node-box ${getInstanceStateClassName(props.data.instanceState)} `}>
        <DragHandle className='drag-handle' />
        <div>{topic}</div>
      </div>
      {toolbarAvailable ?
        <NodeToolbar isVisible={toolbarViewState !== InputHoverState.OUT} position={Position.Bottom}>
          <ExpandToolbar
            sourceId={props.id}
            responseState={ResponseState.INPUT}
            generateResponse={generateResponse}
            generateQuestions={generateQuestions}
            setInputState={setToolbarViewState}
            topic={topic}
          />
        </NodeToolbar>
        : <></>
      }
      <Handle type="source" position={Position.Bottom} className="node-handle-direct source-handle"/>
    </div>
  )
}

export default TopicNode;