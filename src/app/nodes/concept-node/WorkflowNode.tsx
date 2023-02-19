import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, ReactFlowInstance, useReactFlow, NodeProps } from 'reactflow';
import cx from 'classnames';

import styles from './NodeTypes.module.css';
import useNodeClickHandler from '../../hooks/useNodeClick';
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import ConceptInput from '../../components/concept-input/concept-input';
import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';

import { ResponseState } from '../../components/gpt-input/gpt-input.model';
import { ChatNodeData, TypeChatNode } from '../chat-node/chat-node.model';
import GPTInput from '../../components/gpt-input/gpt-input';
import { getTopics } from '../../../api/openai-api';

// import { generateSubtopics } from "./concept-node.helper";

import { uuid } from '../../utils';

type ConceptNodeState = {
  input: string,
  subtopicIsLoading: boolean, 
  suptopicIsLoading: boolean, 
  lateralRightLoading: boolean,
  lateralLeftLoading: boolean,
  highLevelTopics: string[], // bottom
  lowLevelTopics: string[], // up
  lateralRightTopics: string[], // right
  lateralLeftTopics: string[], // left
  reactFlowInstance: ReactFlowInstance,
  placeholder: 'Add a concept',
};

const WorkflowNode = (props: NodeProps) => {
  // see the hook implementation for details of the click handler
  // calling onClick adds a child node to this node
  const [input, setInput] = useState('');
  const [responseInputState, setResponseInputState] = useState<ResponseState>(ResponseState.INPUT);
  const [lowLevelTopics, setLowLevelTopics] = useState<string[]>([]);
  const [highLevelTopics, setHighLevelTopics] = useState<string[]>([]);
  const [lateralRightTopics, setlateralRightTopics] = useState<string[]>([]);
  const [lateralLeftTopics, setlateralLeftTopics] = useState<string[]>([]);
  const reactFlowInstance = useReactFlow();
    
  const generateTopics = useCallback(
    (input: string, response: string) => {
      const data: ChatNodeData = {
        parentChatId: props.id,
        chatReference: `${props.data.chatReference}\n\n${input}\n\n${response}\n\n`,
        // We want chat node to have no response yet, since the user will ask for a response
        placeholder: 'Ask a follow up question',
      };
      // createTopics(reactFlowInstance, props.id, data);
    },
    [reactFlowInstance]
  )

  return (
    <div className='chat-node'>
        <Handle type="target" position={Position.Top} id="b" className="node-handle-direct"/>
        <DragHandle className='drag-handle' />
        <ConceptInput
          // generateSubtopics={generateSubtopics}
          responseState={responseInputState}
          placeholder={props.data.placeholder}
          setResponseInputState={setResponseInputState}
          id={props.id}
          input={input}
          setInput={setInput}
        />
        <Handle type="source" position={Position.Bottom} id="a" className="node-handle-direct"/>
    </div>
  );
};

export default memo(WorkflowNode);
