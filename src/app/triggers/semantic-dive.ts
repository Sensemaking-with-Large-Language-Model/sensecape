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
  jsonObject: ReactFlowJsonObject | {nodes: Node[], edges: Edge[]};
  level: number;
};

export enum InstanceState {
  NONE = 'none',          // Never was an instance state
  CURRENT = 'current',    // Is currently the instance state
  WAS = 'was',            // Has been the instance state
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
  let topicName = nodeMouseOver.data.state.topic ?? '';

  let childInstance: Instance;
  // If topic node has never doven in before, create a new Instance
  if (nodeMouseOver.data.instanceState === InstanceState.NONE) {
    // // If topic name already exists, update topic name and save
    // if (similarInstances.has(topicName)) {
    //   // Edge case: this new string could also already be a topic name, but unlikely.
    //   topicName += ` (ver. ${similarInstances.get(topicName)?.length ?? 0 + 1})`;
    //   similarInstances.get(topicName)?.push(topicName);
    // } else {
    //   similarInstances.set(topicName, [topicName]);
    // }

    // Create New Instance
    childInstance = {
      name: topicName,
      parent: currentTopic,
      children: [],
      topicNode: nodeMouseOver,
      jsonObject: {
        nodes: [],
        edges: [],
      },
      level: instanceMap.get(currentTopic)?.level ?? 0 + 1,
    }
  
    // Set original name
    if (topicName !== nodeMouseOver.data.state.topic) {
      childInstance.originalName = nodeMouseOver.data.state.topic;
    }
    setInstanceMap(instanceMap.set(topicName, childInstance));
  } else {
    // Restore instance
    childInstance = instanceMap.get(topicName)!;
  }

  // Save current instance state to the parent instance
  const currentInstance = instanceMap.get(currentTopic)!;
  currentInstance.jsonObject = reactFlowInstance.toObject();

  // Set topic as current instance
  nodeMouseOver.data.instanceState = InstanceState.CURRENT;
  setCurrentTopic(topicName);
  setSemanticRoute(semanticRoute.concat(topicName));

  // Restore child nodes & include topic node
  reactFlowInstance.setNodes([...childInstance.jsonObject.nodes, nodeMouseOver]);
  reactFlowInstance.setEdges(childInstance.jsonObject.edges);

  // Transition into new canvas
  reactFlowInstance.zoomTo(0.7);
  reactFlowInstance.fitView({
    duration: 400,
    padding: 7,
    maxZoom: zoomLimits.max,
    minZoom: zoomLimits.min,
    nodes: [nodeMouseOver]
  });
  // console.log(reactFlowInstance.getNodes());
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
    currentInstance.jsonObject = reactFlowInstance.toObject();

    // Set topic as parent topic
    currentInstance.topicNode!.data.instanceState = InstanceState.WAS;
    setCurrentTopic(parentInstance.name);
    setSemanticRoute(semanticRoute.slice(0, -1));

    // recover parent reactFlowInstance
    reactFlowInstance.setNodes(parentInstance.jsonObject.nodes);
    reactFlowInstance.setEdges(parentInstance.jsonObject.edges);

    // Transition
    reactFlowInstance.zoomTo(2);
    reactFlowInstance.fitView({
      duration: 400,
      padding: 0,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min
    });
    // console.log(reactFlowInstance.getNodes());
  }
}