import { Component, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Edge, Handle, NodeProps, Position, ReactFlowInstance, useReactFlow, useStore, XYPosition } from 'reactflow';
import { getGPT3Keywords, getGPT3Response, getGPT3Stream, getGPT3Summary } from '../../../api/openai-api';
import './flex-node.scss';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
import { FlexNodeData, TypeFlexNode } from './flex-node.model';
import GPTInput from '../../components/gpt-input/gpt-input';
import { ResponseState } from '../../components/input.model';
import { InputHoverState, ZoomState } from '../node.model';
import { InstanceState } from '../../triggers/semantic-dive';
import { TopicNodeData } from '../topic-node/topic-node.model';

type FlexState = {
  input: string,
  response: string, // Singular response. more follow ups/responses belong in another chatnode
  responseIsLoading: boolean,
  reactFlowInstance: ReactFlowInstance,
};

const zoomSelector = (s: any) => s.transform[2];

const FlexNode = (props: NodeProps) => {
  const [input, setInput] = useState(props.data.state.input ?? '');
  const [responseInputState, setResponseInputState] = useState<ResponseState>(props.data.state.responseInputState ?? ResponseState.INPUT);

  const zoom: number = useStore(zoomSelector);

  return (
    // Allow highlighting only for fully expanded text
    // <div className='chat-node highlightable'>
      <div className='flex-node' >
      <TooltipProvider>
        <Handle type="target" position={Position.Top} id="b" className="node-handle-direct "/>
        <DragHandle className='drag-handle' />
        <GPTInput
          sourceId={props.id}
          responseState={responseInputState}
          input={input}
          setInput={setInput}
          setInputState={(s: InputHoverState) => {}}
        />
        <Handle type="source" position={Position.Bottom} id="a" className="node-handle-direct" />
        <Tooltip
          place="bottom"
        ></Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default FlexNode;