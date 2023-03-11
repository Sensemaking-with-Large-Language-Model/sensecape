import React, { MouseEventHandler, useState } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useReactFlow } from 'reactflow';
import HierarchyToolbarBottom from '../../components/hierarchy-toolbar/hierarchy-toolbar-bottom';
import HierarchyToolbarTop from '../../components/hierarchy-toolbar/hierarchy-toolbar-top';
import { uuid } from '../../utils';
import { TypeTopicNode } from '../topic-node/topic-node.model';
import { HierarchyNodeData } from './hierarchy-node.model';

import './hierarchy-node.scss'

type GetLabelParams = {
  expanded: boolean;
  expandable: boolean;
};

export default function HierarchyNode({ data, id, xPos, yPos }: NodeProps) {
  const reactFlowInstance = useReactFlow();
  const [onHover, setOnHover] = useState(false);

  const isParentNode = () => {
    
    
  }

  const addChildNode: MouseEventHandler = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const newNodeId = `hierarchy-${uuid()}`;

    // we are updating our nodes here
    // first we are expanding the clicked node, so that the added node will become visible
    // secondly, the new node is added to the array of nodes
    reactFlowInstance.setNodes((nodes) =>
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
    reactFlowInstance.addEdges({ id: `hierarchy-e-${uuid()}`, source: id, target: newNodeId });
  };

  return (
    <div className='hierarchy-node'
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
    >
      <div className='topic-name'>{data.topicName}</div>
      <NodeToolbar isVisible={onHover} position={Position.Top}>
        <HierarchyToolbarTop />
      </NodeToolbar>
      <NodeToolbar isVisible={onHover} position={Position.Bottom}>
        <HierarchyToolbarBottom />
      </NodeToolbar>
      <Handle position={Position.Top} type="target" />
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}
