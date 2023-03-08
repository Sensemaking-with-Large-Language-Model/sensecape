import React, { MouseEventHandler } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { uuid } from '../../utils';
import { HierarchyNodeData } from './hierarchy-node.model';

import './hierarchy-node.scss'

type GetLabelParams = {
  expanded: boolean;
  expandable: boolean;
};

export default function HierarchyNode({ data, id, xPos, yPos }: NodeProps) {
  const { setNodes, addEdges } = useReactFlow();

  const addChildNode: MouseEventHandler = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const newNodeId = `hierarchy-${uuid()}`;

    // we are updating our nodes here
    // first we are expanding the clicked node, so that the added node will become visible
    // secondly, the new node is added to the array of nodes
    setNodes((nodes) =>
      nodes
        .map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, expanded: true } as HierarchyNodeData,
            };
          }
          return node;
        })
        .concat([
          {
            id: newNodeId,
            type: 'hierarchy',
            position: {
              x: xPos,
              y: yPos + 100
            },
            data: {
              topicId: '',
              topicName: 'subtopic'
            } as HierarchyNodeData,
          }])
    );

    // the edge between the clicked node and the child node is created
    addEdges({ id: `hierarchy-e-${uuid()}`, source: id, target: newNodeId });
  };

  return (
    <div className='hierarchy-node'>
      <div className='topic-name'>{data.topicName}</div>
      <Handle position={Position.Top} type="target" />
      <Handle position={Position.Bottom} type="source" />
      <div className='add-subtopic-button' onClick={addChildNode}>
        +Subtopic
      </div>
    </div>
  );
}
