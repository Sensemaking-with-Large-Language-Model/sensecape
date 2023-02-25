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
  parentId: string;
  children: string[];
  topicNode: TypeTopicNode;
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
  [instanceMap, setInstanceMap]: [Map<string, Instance>, Dispatch<SetStateAction<Map<string, Instance>>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {

    // Save topic name
    let topicName = nodeMouseOver.data.state.topic ?? '';
  
    let childInstance: Instance;
    // If topic node has never doven in before, create a new Instance
    if (nodeMouseOver.data.instanceState === InstanceState.NONE) {
  
      // Create New Instance
      childInstance = {
        name: topicName,
        parentId: currentTopicId,
        children: [],
        topicNode: nodeMouseOver,
        jsonObject: {
          nodes: [],
          edges: [],
        },
        level: instanceMap.get(currentTopicId)?.level ?? 0 + 1,
      }
  
      setInstanceMap(instanceMap.set(nodeMouseOver.id, childInstance));
    } else {
      // Restore instance
      childInstance = instanceMap.get(nodeMouseOver.id)!;
    }
  
    // Save current instance state to the parent instance
    const currentInstance = instanceMap.get(currentTopicId)!;
    currentInstance.jsonObject = reactFlowInstance.toObject();
    instanceMap.set(currentTopicId, currentInstance);
  
    // Set topic as current instance
    nodeMouseOver.data.instanceState = InstanceState.CURRENT;
    setCurrentTopicId(childInstance.topicNode?.id ?? 'home'); // If id DNE, it should be home
    setSemanticRoute(semanticRoute.concat(topicName));
  
    // Restore child nodes & include topic node
    // console.log([...childInstance.jsonObject.nodes, nodeMouseOver]);
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
  }, 0);
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
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    const currentInstance = instanceMap.get(currentTopicId)!;
    const parentInstance = instanceMap.get(currentInstance.parentId);
  
    if (parentInstance) {
      // store current reactFlowInstance
      currentInstance.jsonObject = reactFlowInstance.toObject();
      instanceMap.set(currentTopicId, currentInstance);
  
      // Set topic as parent topic
      currentInstance.topicNode.data.instanceState = InstanceState.WAS;
      setCurrentTopicId(parentInstance.topicNode.id);
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
    }
  }, 0);
}

/**
 * Jumps to a particular topic
 */
export const semanticJumpTo = (
  instanceMap: Map<string, Instance>,
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {

};
