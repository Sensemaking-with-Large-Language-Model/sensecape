import { useCallback } from 'react';
import { Node, NodeToolbar, useReactFlow, useStore } from 'reactflow';
import { createGroupNode } from '../../nodes/group-node/group-node.helper';

import './selected-topics-toolbar.scss';

// const selectedNodesSelector = (state: any) =>
//   Array.from(state.nodeInternals.values())
//     .filter((node: any) => node.selected)
//     .map((node: any) => node.id);

const selectedTopicNodesSelector = (state: any) =>
  Array.from(state.nodeInternals.values())
    .filter((node: any) => node.selected && node.id.includes('topic'))
    .map((node: any) => node.id);

export default function SelectedTopicsToolbar(props: any) {
  // const selectedNodeIds: string[] = useStore(selectedNodesSelector);
  const selectedTopicNodeIds: string[] = useStore(selectedTopicNodesSelector);
  const isVisible = selectedTopicNodeIds.length >= 1;
  // const isVisible = selectedNodeIds.length >= 1;

  const reactFlowInstance = useReactFlow();

  const getTopicNodes = useCallback((topicIds: string[]) => {
    return topicIds
      .map(topicId => reactFlowInstance.getNode(topicId))
      .filter((node): node is Node => !!node);
  }, [reactFlowInstance]);

  return (
    <NodeToolbar
      className='node-toolbar'
      nodeId={selectedTopicNodeIds}
      isVisible={isVisible}
    >
      <button
        type='button'
        onClick={() => props.generateConceptNode(selectedTopicNodeIds)}
      >
        Generate Concept from Topics
      </button>
      <button
        type='button'
        onClick={() => createGroupNode(reactFlowInstance, getTopicNodes(selectedTopicNodeIds))}
      >
        Form Group
      </button>
    </NodeToolbar>
  );
}