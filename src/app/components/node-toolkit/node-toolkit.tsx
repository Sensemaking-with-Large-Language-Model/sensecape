import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { createChatNode } from '../../nodes/chat-node/chat-node.helper';
import { ChatNodeData } from '../../nodes/chat-node/chat-node.model';
import { ConceptNodeData } from '../../nodes/concept-node/concept-node.model';
import { CreativeNodeData } from '../../nodes/node.model';
import './node-toolkit.scss';

const NodeToolkit = () => {

  const reactFlowInstance = useReactFlow();

  const addChatNode = useCallback(
    () => {
      const data: ChatNodeData = {
        parentChatId: '',
        chatReference: '',
        placeholder: 'Ask GPT-3',
      }
      createChatNode(reactFlowInstance, '', data);
    },
    [reactFlowInstance]
  )

  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('dragNodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    let data: CreativeNodeData;
    if (nodeType === 'chat') {
      data = {
        parentChatId: '',
        chatReference: '',
        placeholder: 'Ask GPT-3',
      };
    } else if (nodeType === 'concept') {
      data = {
        topicNodes: [],
      };
    } else if (nodeType === 'memo') {
      data = {
        // Memo node holds no data for now
      }
    } else {
      return;
    }
    const dataString: string = JSON.stringify(data);
    event.dataTransfer.setData('dragNodeData', dataString);
  };

  return (
    <div className="node-toolkit">
      <div className='add-node' draggable onDragStart={(e) => onDragStart(e, 'chat')}>
        <svg width="16" height="30" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 8L15 8M8 15L8 1" stroke="#AAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        GPT Node
      </div>
      <div className='add-node' draggable onDragStart={(e) => onDragStart(e, 'concept')}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.15007 12.1499L5.85004 14.8498C8.10001 17.0998 9.89999 17.0998 12.15 14.8498L14.8499 12.1499C17.0999 9.89988 17.0999 8.0999 14.8499 5.84993L12.15 3.14996C9.89999 0.89999 8.10001 0.89999 5.85004 3.14996L3.15007 5.84993C0.900095 8.0999 0.900095 9.89988 3.15007 12.1499Z" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Concept Node
      </div>
      <div className='add-node' draggable onDragStart={(e) => onDragStart(e, 'memo')}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.15007 12.1499L5.85004 14.8498C8.10001 17.0998 9.89999 17.0998 12.15 14.8498L14.8499 12.1499C17.0999 9.89988 17.0999 8.0999 14.8499 5.84993L12.15 3.14996C9.89999 0.89999 8.10001 0.89999 5.85004 3.14996L3.15007 5.84993C0.900095 8.0999 0.900095 9.89988 3.15007 12.1499Z" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Memo Node
      </div>
    </div>
  )
}

export default NodeToolkit; 