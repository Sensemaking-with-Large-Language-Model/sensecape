import React, { Dispatch, SetStateAction } from "react";
import { Node, Edge, getRectOfNodes, ReactFlowInstance, ReactFlowJsonObject } from "reactflow";
import { TopicNodeData, TypeTopicNode } from "../nodes/topic-node/topic-node.model";
import { uuid, zoomLimits } from "../utils";

// How long dive transition will take in seconds
export const totalTransitionTime = 1000;

export interface NodeEdgeSet {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

export interface Instance {
  name: string;
  parentId: string;
  childrenId: string[];
  topicNode: TypeTopicNode;
  jsonObject: ReactFlowJsonObject | {nodes: Node[], edges: Edge[]};
  level: number;
};

export type InstanceMap = {
  [x: string]: Instance | undefined;
}

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
  nodeMouseOver: Node,
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  if (
    nodeMouseOver &&
    nodeMouseOver.type === 'topic' &&
    currentTopicId !== nodeMouseOver.id
  ) {
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
          childrenId: [],
          topicNode: nodeMouseOver,
          jsonObject: {
            nodes: [],
            edges: [],
          },
          level: instanceMap[currentTopicId]?.level ?? 0 + 1,
        }
    
        setInstanceMap(map => Object.assign(map, {[nodeMouseOver.id]: childInstance}));
      } else {
        // Restore instance
        childInstance = instanceMap[nodeMouseOver.id]!;
      }
      
      // reactFlowInstance.fitView({
      //   duration: 0,
      //   padding: 0,
      //   maxZoom: zoomLimits.max,
      //   minZoom: zoomLimits.min,
      //   nodes: [nodeMouseOver]
      // });
      reactFlowInstance.zoomTo(500, { duration: totalTransitionTime });
  
      setTimeout(() => {
        // Save current instance state to the parent instance
        const currentInstance = instanceMap[currentTopicId]!;
        currentInstance.jsonObject = reactFlowInstance.toObject();
        setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));
  
        // Set topic as current instance
        nodeMouseOver.data.instanceState = InstanceState.CURRENT;
        setCurrentTopicId(childInstance.topicNode?.id ?? 'home'); // If id DNE, it should be home
        setSemanticRoute(semanticRoute.concat(topicName));
  
        // Restore child nodes & include topic node
        // console.log([...childInstance.jsonObject.nodes, nodeMouseOver]);
        reactFlowInstance.setNodes([...childInstance.jsonObject.nodes, nodeMouseOver]);
        reactFlowInstance.setEdges(childInstance.jsonObject.edges);
  
        reactFlowInstance.zoomTo(0.7);
        reactFlowInstance.fitView({
          duration: totalTransitionTime/2,
          padding: 7,
          maxZoom: zoomLimits.max,
          minZoom: zoomLimits.min,
          nodes: [nodeMouseOver]
        });
      }, totalTransitionTime/2);
    }, 0);
    // @ts-ignore
    document.activeElement?.blur()
  }
}

/**
 * Dives out of current canvas to higher level
 * @param instanceMap 
 * @param currentTopic 
 * @param semanticRoute
 * @param reactFlowInstance 
 */
export const semanticDiveOut = (
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    const currentInstance = instanceMap[currentTopicId]!;
    let parentInstance = instanceMap[currentInstance.parentId];
  
    if (!parentInstance) {

      // Create the parent instance
      parentInstance = {
        name: currentInstance.name + '-parent',
        parentId: '',
        childrenId: [],
        topicNode: {
          id: `topic-${uuid()}`,
          type: 'topic',
          dragHandle: '.drag-handle',
          data: {
            parentId: '',
            chatReference: '',
            instanceState: InstanceState.NONE, // To temporarily disable dive out of home
            state: {
              topic: currentInstance.name + '-parent',
            }
          } as TopicNodeData,
          position: { x: 0, y: 0 }
        },
        jsonObject: {
          nodes: [currentInstance.topicNode] as Node[],
          edges: [] as Edge[],
        },
        level: currentInstance.level-1,
      } as Instance;

      currentInstance.parentId = parentInstance.topicNode.id;

      setInstanceMap(map => Object.assign(map, {
        [currentInstance.topicNode.id]: currentInstance,
        [currentInstance.parentId]: parentInstance,
      }))

      setSemanticRoute([parentInstance.name].concat(semanticRoute));

    } else {
      // setSemanticRoute(semanticRoute.slice(0, -1));
      setSemanticRoute([parentInstance.name]);
    }

    // store current reactFlowInstance
    currentInstance.jsonObject = reactFlowInstance.toObject();
    setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

    // Set topic as parent topic
    currentInstance.topicNode.data.instanceState = InstanceState.WAS;
    setCurrentTopicId(parentInstance.topicNode.id);

    // recover parent reactFlowInstance
    reactFlowInstance.setNodes(parentInstance.jsonObject.nodes);
    reactFlowInstance.setEdges(parentInstance.jsonObject.edges);

    // Transition
    // reactFlowInstance.zoomTo(3.8);
    // reactFlowInstance.zoomTo(0.7, { duration: 400 });

    reactFlowInstance.fitView({
      duration: totalTransitionTime/2,
      padding: 0,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min,
      nodes: reactFlowInstance.getNodes(),
    });
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
