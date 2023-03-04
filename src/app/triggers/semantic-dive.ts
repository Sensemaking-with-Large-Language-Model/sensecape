import React, { Dispatch, SetStateAction } from "react";
import { Node, Edge, getRectOfNodes, ReactFlowInstance, ReactFlowJsonObject } from "reactflow";
import { ResponseState } from "../components/input.model";
import { duplicateNode } from "../nodes/node.helper";
import { InputHoverState } from "../nodes/node.model";
import { TopicNodeData, TypeTopicNode } from "../nodes/topic-node/topic-node.model";
import { uuid, zoomLimits } from "../utils";

// How long dive transition will take in seconds
export const totalTransitionTime = 1000;

export interface NodeEdgeList {
  nodes: Node[];
  edges: Edge[];
}

export interface Instance {
  name: string;
  parentId: string;
  childrenId: string[];
  topicNode: TypeTopicNode;
  jsonObject: ReactFlowJsonObject | NodeEdgeList;
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
  [infiniteZoom, setInfiniteZoom]: [boolean, Dispatch<SetStateAction<boolean>>],
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
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
        // Create copy node
        const copyNode = duplicateNode(nodeMouseOver) as TypeTopicNode;
        copyNode.data.state.toolbarViewState = InputHoverState.OUT;
        copyNode.data.state.toolbarAvailable = true;
        copyNode.data.parentId = '';

        // Create New Instance
        childInstance = {
          name: topicName,
          parentId: currentTopicId,
          childrenId: [],
          topicNode: copyNode,
          jsonObject: {
            nodes: [copyNode],
            edges: [],
          },
          level: instanceMap[currentTopicId]?.level ?? 0 + 1,
        }

        nodeMouseOver.data.instanceState = InstanceState.WAS;
        setInstanceMap(map => Object.assign(map, {[copyNode.id]: childInstance}));
      } else {
        // Restore instance
        const foundChildInstance = Object.values(instanceMap)
          .find(instance => instance?.parentId === currentTopicId);
        if (foundChildInstance) {
          childInstance = foundChildInstance;
        } else {
          return;
        }
      }

      prepareDive(reactFlowInstance, setSemanticCarryList);

      setInfiniteZoom(true);
      // Initial zoom transition out before removing current nodes
      reactFlowInstance.fitView({
        duration: 0,
        padding: 0,
        maxZoom: zoomLimits.max,
        minZoom: zoomLimits.min,
        nodes: [nodeMouseOver]
      });
      reactFlowInstance.zoomTo(500, { duration: totalTransitionTime });

      setTimeout(() => {
        // Save current instance state to the parent instance
        const currentInstance = instanceMap[currentTopicId]!;
        currentInstance.jsonObject = reactFlowInstance.toObject();
        setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));
  
        // Set topic as current instance
        childInstance.topicNode.data.instanceState = InstanceState.CURRENT;
        setCurrentTopicId(childInstance.topicNode?.id ?? 'home'); // If id DNE, it should be home
        setSemanticRoute(semanticRoute.concat(topicName));

        // Restore child nodes & include topic node
        console.log(reactFlowInstance.getNodes());
        reactFlowInstance.setNodes(childInstance.jsonObject.nodes);
        reactFlowInstance.setEdges(childInstance.jsonObject.edges);
        console.log(childInstance.jsonObject.nodes);

        reactFlowInstance.zoomTo(0.7);
        reactFlowInstance.fitView({
          duration: totalTransitionTime/2,
          padding: 0,
          maxZoom: zoomLimits.max,
          minZoom: zoomLimits.min,
          nodes: [nodeMouseOver]
        });
        setInfiniteZoom(false);
      }, totalTransitionTime/2);
    }, 0);
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
  [infiniteZoom, setInfiniteZoom]: [boolean, Dispatch<SetStateAction<boolean>>],
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
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
          position: currentInstance.topicNode.position,
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
      setSemanticRoute([parentInstance.name]);
    }

    prepareDive(reactFlowInstance, setSemanticCarryList);

    // store current reactFlowInstance
    currentInstance.jsonObject = reactFlowInstance.toObject();
    setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

    // Set topic as parent topic
    currentInstance.topicNode.data.instanceState = InstanceState.WAS;
    setCurrentTopicId(parentInstance.topicNode.id);

    // Transition
    setInfiniteZoom(true);
    reactFlowInstance.zoomTo(0.01, { duration: totalTransitionTime });
    setTimeout(() => {
      reactFlowInstance.zoomTo(20);
      reactFlowInstance.zoomTo(2, { duration: totalTransitionTime/2 });

      if (parentInstance) {
        // recover parent reactFlowInstance
        reactFlowInstance.setNodes(parentInstance.jsonObject.nodes);
        reactFlowInstance.setEdges(parentInstance.jsonObject.edges);
      }
      setInfiniteZoom(false);
    }, totalTransitionTime/2);

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

const prepareDive = (
  reactFlowInstance: ReactFlowInstance,
  setSemanticCarryList: Dispatch<SetStateAction<NodeEdgeList>>
) => {
  // Save selected nodes & edges for semantic dives
  setSemanticCarryList({
    nodes: reactFlowInstance.getNodes().filter(node => node.selected),
    edges: reactFlowInstance.getEdges().filter(edge => edge.selected),
  });

  // Preprocessing of nodes before semantic dive
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    node.selected = false;
    return node;
  }));
}