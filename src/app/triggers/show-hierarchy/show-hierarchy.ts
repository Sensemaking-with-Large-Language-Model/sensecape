import { Dispatch, SetStateAction } from "react";
import { Edge, ReactFlowInstance, XYPosition } from "reactflow";
import { TypeHierarchyNode } from "../../nodes/hierarchy-node/hierarchy-node.model";
import { uuid } from "../../utils";
import { InstanceMap } from "../semantic-dive/semantic-dive";
import { getInstanceName } from "../semantic-dive/semantic-dive.helper";

/**
 * Saves current instance
 * Prepares hierarchy structure in hierarchy instance
 * Shows the hierarchy structure of nodes
 */
export const showHierarchyView = (
  predictedTopicName: string,
  currentTopicId: string,
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  reactFlowInstance: ReactFlowInstance
) => {
  const currentInstance = instanceMap[currentTopicId];

  currentInstance.jsonObject = reactFlowInstance.toObject();
  if (getInstanceName(currentInstance) === 'SenseCape') {
    currentInstance.topicNode.data.state.topic = predictedTopicName || 'SenseCape';
  }
  setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

  const instances = Object.values(instanceMap);

  const defaultPosition: XYPosition = { x: window.innerWidth/2, y: window.innerHeight/2 };

  const hierarchyNodes: TypeHierarchyNode[] = instances
    .map(instance => ({
      id: `hierarchy-${instance.topicNode.id}`,
      type: 'hierarchy',
      position: defaultPosition,
      data: {
        topicId: instance.topicNode.id,
        topicName: getInstanceName(instance),
        expanded: true,
      },
    }));

  const hierarchyRoot: TypeHierarchyNode = {
    id: 'hierarchy-root',
    type: 'hierarchy',
    position: defaultPosition,
    data: {
      topicId: 'hierarhy-root',
      topicName: 'Hierarchy Root',
      expanded: true,
    },
    hidden: true,
  };

  const hierarchyEdges: Edge[] = instances
    .map(instance => {
      if (!instance.parentId) {
        return {
          id: `hierarchy-edge-root-${instance.topicNode.id}`,
          source: hierarchyRoot.id,
          target: `hierarchy-${instance.topicNode.id}`,
          hidden: true,
        } as Edge;
      } else {
        return {
          id: `hierarchy-edge-${instance.topicNode.id}`,
          source: `hierarchy-${instance.parentId}`,
          target: `hierarchy-${instance.topicNode.id}`,
        } as Edge
      }
    });

  reactFlowInstance.setNodes([...hierarchyNodes, hierarchyRoot]);
  reactFlowInstance.setEdges(hierarchyEdges);

  setTimeout(() => {
    reactFlowInstance.fitView({
      duration: 800,
      padding: 0.5,
    });
  }, 100);
}

export const hideHierarchyView = (
  currentTopicId: string,
  instanceMap: InstanceMap,
  reactFlowInstance: ReactFlowInstance,
) => {
  const currentInstance = instanceMap[currentTopicId];

  reactFlowInstance.setNodes(currentInstance.jsonObject.nodes);
  reactFlowInstance.setEdges(currentInstance.jsonObject.edges);
  reactFlowInstance.setViewport(currentInstance.jsonObject.viewport);
}