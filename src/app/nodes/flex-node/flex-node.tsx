import { Component, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Edge, Handle, NodeProps, Position, ReactFlowInstance, useReactFlow, useStore, XYPosition } from 'reactflow';
import { getChatGPTKeywords, getChatGPTResponse, getChatGPTSummary } from '../../../api/openai-api';
import './flex-node.scss';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
import { FlexNodeData, TypeFlexNode } from './flex-node.model';
import { ResponseState } from '../../components/input.model';
import { InputHoverState, ZoomState } from '../node.model';
import { InstanceState } from '../../triggers/semantic-dive/semantic-dive';
import { TopicNodeData } from '../topic-node/topic-node.model';
import FlexInput from '../../components/flex-input/flex-input';

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
      <div className='node flex-node' >
      <TooltipProvider>
        <Handle type="target" position={Position.Top} id="b" className="node-handle-direct "/>
        <DragHandle className='drag-handle' />
        <FlexInput
          sourceId={props.id}
          responseState={responseInputState}
          input={input}
          placeholder={props.data.placeholder}
          setInput={setInput}
          setResponseState={setResponseInputState}
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