import React, { Dispatch, SetStateAction } from "react";
import { Node, Edge, getRectOfNodes, ReactFlowInstance, ReactFlowJsonObject } from "reactflow";
import { TypeTopicNode } from "../nodes/topic-node/topic-node.model";
import { zoomLimits } from "../utils";

export interface NodeEdgeSet {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

export interface Instance {
  name: string;
  originalName?: string; // If name of Instance has already been created
  parent: string;
  children: string[];
  topicNode: TypeTopicNode | null;
  level: number;
};

export enum InstanceState {
  none = 'NONE',          // Never was an instance state
  current = 'CURRENT',    // Is currently the instance state
  was = 'WAS',            // Has been the instance state
}

export const getInstanceFromTopicName = (reactFlowInstance: ReactFlowInstance, topicName: string): NodeEdgeSet => {
  return {
    nodeIds: new Set(reactFlowInstance.getNodes().filter(node => node.data.instanceTopicName === topicName).map(node => node.id)),
    edgeIds: new Set(reactFlowInstance.getEdges().filter(edge => edge.data.instanceTopicName === topicName).map(edge => edge.id)),
  }
}

export const storeShownNodesAndEdges = (reactFlowInstance: ReactFlowInstance, topicName: string) => {
  // Save topic name into the node and hide it
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    if (!node.hidden) {
      node.data.instanceTopicName = topicName;
      node.hidden = true;
    }
    return node;
  }));
  reactFlowInstance.setEdges(edges => edges.map(edge => {
    if (!edge.hidden) {
      edge.data.instanceTopicName = topicName;
      edge.hidden = true;
    }
    return edge;
  }));
}

export const recoverNodesAndEdges = (reactFlowInstance: ReactFlowInstance, instance: NodeEdgeSet) => {
  // Recover parent instance
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    if (instance.nodeIds.has(node.id)) {
      node.hidden = false;
    }
    return node;
  }));
  reactFlowInstance.setEdges(edges => edges.map(edge => {
    if (instance.nodeIds.has(edge.id)) {
      edge.hidden = false;
    }
    return edge;
  }));
}

/**
 * Dives into a topic node to open a new canvas for deeper exploration
 * @param nodeMouseOver 
 * @param similarInstances 
 * @param instanceMap 
 * @param currentTopic 
 * @param semanticRoute 
 * @param reactFlowInstance 
 */
export const semanticDiveIn = (
  nodeMouseOver: TypeTopicNode,
  similarInstances: Map<string, string[]>,
  [instanceMap, setInstanceMap]: [Map<string, Instance>, Dispatch<SetStateAction<Map<string, Instance>>>],
  [currentTopic, setCurrentTopic]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  // Save topic name
  let topicName = nodeMouseOver.data.topicName;

  // If topic node has never doven in before, create a new Instance
  if (nodeMouseOver.data.instanceState === InstanceState.none) {
    // If topic name already exists, update topic name and save
    if (similarInstances.has(topicName)) {
      // Edge case: this new string could also already be a topic name, but unlikely.
      topicName += ` (ver. ${similarInstances.get(topicName)?.length ?? 0 + 1})`;
      similarInstances.get(topicName)?.push(topicName);
    } else {
      similarInstances.set(topicName, [topicName]);
    }

    // Create New Instance
    const newInstance: Instance = {
      name: topicName,
      parent: currentTopic,
      children: [],
      topicNode: nodeMouseOver,
      level: instanceMap.get(currentTopic)?.level ?? 0 + 1,
    }

    // Set original name
    if (topicName !== nodeMouseOver.data.topicName) {
      newInstance.originalName = nodeMouseOver.data.topicName;
    }
    setInstanceMap(instanceMap.set(topicName, newInstance));
  }

  // Save current instance state to the parent instance
  const currentInstance = instanceMap.get(currentTopic)!;
  currentInstance.children.push(topicName);

  // TODO: Save the topic name when any node or edge gets created, instead of once dive is triggered
  storeShownNodesAndEdges(reactFlowInstance, currentTopic);

  // Topic node we carry in will be assigned the currentTopic (to become tied to parent)
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    if (node.id == nodeMouseOver.id) {
      node.hidden = false;
      node.data.instanceTopicName = currentTopic;
    }
    return node;
  }));

  // Set topic as current instance
  nodeMouseOver.data.instanceState = InstanceState.current;
  setCurrentTopic(topicName);
  setSemanticRoute(semanticRoute.concat(topicName));

  // Transition into new canvas
  reactFlowInstance.zoomTo(0.8);
  reactFlowInstance.fitView({
    duration: 400,
    padding: 7,
    maxZoom: zoomLimits.max,
    minZoom: zoomLimits.min,
    nodes: [nodeMouseOver]
  });
}

/**
 * Dives out of current canvas to higher level
 * @param instanceMap 
 * @param currentTopic 
 * @param semanticRoute
 * @param reactFlowInstance 
 */
export const semanticDiveOut = (
  instanceMap: Map<string, Instance>,
  [currentTopic, setCurrentTopic]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  const currentInstance = instanceMap.get(currentTopic)!;
  const parentInstance = instanceMap.get(currentInstance.parent);

  if (parentInstance) {

    // store current reactFlowInstance
    storeShownNodesAndEdges(reactFlowInstance, currentInstance.name);

    // Topic node we carry in will be assigned the currentTopic (to become tied to parent)
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (node.id == currentInstance.topicNode?.id) {
        node.hidden = false;
        node.data.instanceTopicName = parentInstance.name;
      }
      return node;
    }));

    // Set topic as parent topic
    currentInstance.topicNode!.data.instanceState = InstanceState.was;
    setCurrentTopic(parentInstance.name);
    setSemanticRoute(semanticRoute.slice(0, -1));

    // Recover parent instance
    const instanceSet: NodeEdgeSet = getInstanceFromTopicName(reactFlowInstance, parentInstance.name);
    console.log(instanceSet);
    recoverNodesAndEdges(reactFlowInstance, instanceSet);

    // Transition
    reactFlowInstance.zoomTo(2);
    reactFlowInstance.fitView({
      duration: 400,
      padding: 0,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min
    });
  }
}