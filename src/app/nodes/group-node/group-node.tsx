import { memo, useCallback, useState } from 'react';
import { getRectOfNodes, Handle, NodeProps, NodeToolbar, Position, useReactFlow, useStore, useStoreApi } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';

import useDetachNodes from '../../hooks/useDetachNodes';
import { InputHoverState } from '../node.model';
import ExpandToolbar from '../../components/expand-toolbar/expand-toolbar';
import { ResponseState } from '../../components/input.model';
import { ChatNodeData } from '../chat-node/chat-node.model';
import { createChatNode } from '../chat-node/chat-node.helper';
import { TypeTopicNode } from '../topic-node/topic-node.model';

import './group-node.scss';

const padding = 25;

function GroupNode(props: any) {
  const reactFlowInstance = useReactFlow();
  const store = useStoreApi();
  const detachNodes = useDetachNodes();

  const [responseInputState, setResponseInputState] = useState<ResponseState>(ResponseState.INPUT);
  const [tooltipAvailable, setTooltipAvailable] = useState(true);
  const [toolbarViewState, setToolbarViewState] = useState(InputHoverState.OUT);

  // All Child Nodes should be topic nodes
  const { minWidth, minHeight, childNodes, hasChildNodes, topics } = useStore((store) => {
    const childNodes = Array.from(store.nodeInternals.values()).filter((n) => n.parentNode === props.id);
    const rect = getRectOfNodes(childNodes);

    return {
      minWidth: rect.width + padding * 2,
      minHeight: rect.height + padding * 2,
      childNodes: childNodes,
      hasChildNodes: childNodes.length > 0,
      topics: childNodes.map((child): child is TypeTopicNode => child.data.topicName).join(', '),
    };
  }, isEqual);

  // const onDelete = () => {
  //   deleteElements({ nodes: [{ props.id }] });
  // };

  const onDetach = () => {
    const childNodeIds = Array.from(store.getState().nodeInternals.values())
      .filter((n) => n.parentNode === props.id)
      .map((n) => n.id);

    detachNodes(childNodeIds, props.id);
  };

  const addInstantChatNode = useCallback(
    (input: string) => {
      const data: ChatNodeData = {
        parentChatId: props.id,
        chatReference: `${props.data.chatReference}\n\nFocusing on ${topics}:\n\n`,
        // We want chat node to already show a response
        placeholder: '',
        instantInput: input,
      };
      createChatNode(reactFlowInstance, props.id, data);
    },
    [reactFlowInstance]
  );
 
  /**
   * Creates another chat node as a response below the group node
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
    <div
      className='group-node'
      onMouseEnter={() => toolbarViewState === InputHoverState.OUT && setToolbarViewState(InputHoverState.HOVER)}
      onMouseLeave={() => toolbarViewState === InputHoverState.HOVER && setToolbarViewState(InputHoverState.OUT)}
    >
      <NodeResizer
        lineClassName='group-resize-line'
        handleClassName='group-resize-handle'
        isVisible={toolbarViewState === InputHoverState.HOVER}
        minWidth={minWidth}
        minHeight={minHeight}
      />
      <NodeToolbar className="node-toolbar nodrag">
        {/* <button onClick={onDelete}>Delete</button> */}
        {hasChildNodes && <button onClick={onDetach}>Ungroup</button>}
      </NodeToolbar>
      {tooltipAvailable ?
      <>
        <NodeToolbar isVisible={toolbarViewState !== InputHoverState.OUT} position={Position.Bottom}>
          <ExpandToolbar
            sourceId={props.id}
            responseState={responseInputState}
            generateResponse={generateResponse}
            setInputState={setToolbarViewState}
            topic={topics}
          />
        </NodeToolbar></>
        : <></>
      }
      <Handle type="source" position={Position.Bottom} className="node-handle-direct source-handle"/>
    </div>
  );
}

function isEqual(prev: any, next: any) {
  return (
    prev.minWidth === next.minWidth && prev.minHeight === next.minHeight && prev.hasChildNodes === next.hasChildNodes
  );
}

export default memo(GroupNode);
