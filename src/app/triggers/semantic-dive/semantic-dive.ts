import { ChatCompletionRequestMessage } from "openai";
import React, { Dispatch, SetStateAction } from "react";
import { Node, Edge, getRectOfNodes, ReactFlowInstance, ReactFlowJsonObject, Viewport } from "reactflow";
import { ResponseState } from "../../components/input.model";
import { duplicateNode } from "../../nodes/node.helper";
import { InputHoverState } from "../../nodes/node.model";
import { createTopicNode } from "../../nodes/topic-node/topic-node.helper";
import { TopicNodeData, TypeTopicNode } from "../../nodes/topic-node/topic-node.model";
import { uuid, zoomLimits } from "../../utils";
import { animateDiveInLanding, animateDiveInTakeoff, animateDiveOutLanding, animateDiveOutTakeoff, animateDiveToLanding } from "./semantic-dive.animate";
import { calculateSurroundPositions, deleteRecommendedNodes, predictRelatedTopics, prepareDive, SemanticRouteItem } from "./semantic-dive.helper";

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
  jsonObject: ReactFlowJsonObject;
  level: number;
};

export type InstanceMap = {
  [x: string]: Instance;
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
  [semanticRoute, setSemanticRoute]: [SemanticRouteItem[], Dispatch<SetStateAction<SemanticRouteItem[]>>],
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
        copyNode.data.chatHistory = [
          ...copyNode.data.chatHistory,
          {
            role: 'user',
            content: `I would like to start a new conversation
              and dive deeper into ${copyNode.data.state.topic}.
              Keep in mind of the context behind this topic, but allow
              the conversation to hold independently of the chat history.`
          },
        ];

        // Create New Instance
        childInstance = {
          name: topicName,
          parentId: currentTopicId,
          childrenId: [],
          topicNode: copyNode,
          jsonObject: {
            nodes: [copyNode],
            edges: [],
            viewport: reactFlowInstance.getViewport(),
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

      prepareDive(
        reactFlowInstance,
        [semanticCarryList, setSemanticCarryList],
        nodeMouseOver.id
      );

      setInfiniteZoom(true);
      animateDiveInTakeoff(
        nodeMouseOver,
        reactFlowInstance
      );

      setTimeout(() => {
        // Save current instance state to the parent instance
        const currentInstance = instanceMap[currentTopicId]!;
        currentInstance.jsonObject = reactFlowInstance.toObject();
        currentInstance.jsonObject.nodes = deleteRecommendedNodes(currentInstance.jsonObject.nodes);
        setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

        // Set topic as current instance
        childInstance.topicNode.data.instanceState = InstanceState.CURRENT;
        setCurrentTopicId(childInstance.topicNode.id ?? '-'); // If id DNE, it should be home
        setSemanticRoute(semanticRoute.concat({
          title: topicName,
          topicId: childInstance.topicNode.id,
          level: childInstance.level,
        }));

        // Restore child instance
        reactFlowInstance.setNodes(childInstance.jsonObject.nodes);
        reactFlowInstance.setEdges(childInstance.jsonObject.edges);
        reactFlowInstance.setViewport(childInstance.jsonObject.viewport);

        predictRelatedTopics(childInstance.jsonObject.nodes
          .filter(node => node.type === 'topic')
          .map((node: TypeTopicNode) => node.data.state.topic)
          .join(',')
        ).then(topics => {
          const surroundPositions = calculateSurroundPositions(topics.length, childInstance.topicNode.position);
          const chatHistory: ChatCompletionRequestMessage = {
            role: 'user',
            content: `The topic of the conversation is focused on ${childInstance.name}`
          }
          topics
          .filter((topic): topic is string => !!topic)
          .forEach((topic, i) => {
            createTopicNode(
              topic,
              currentTopicId,
              surroundPositions[i],
              chatHistory,
              true,
              reactFlowInstance);
          });
        });

        setTimeout(() => {
          animateDiveInLanding(
            childInstance.topicNode,
            reactFlowInstance
          );
          setInfiniteZoom(false);
          // document.getElementById('reactFlowInstance')!.style.pointerEvents = 'unset';
          // TODO: Make animations promises, and setInfiniteZoom(false);
        });
      }, totalTransitionTime/2);
    });
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
  [predictedTopicName, setPredictedTopicName]: [string, Dispatch<SetStateAction<string>>],
  [infiniteZoom, setInfiniteZoom]: [boolean, Dispatch<SetStateAction<boolean>>],
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [SemanticRouteItem[], Dispatch<SetStateAction<SemanticRouteItem[]>>],
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    const currentInstance = instanceMap[currentTopicId]!;
    let parentInstance = instanceMap[currentInstance.parentId];
    const currentInstanceName = predictedTopicName || currentInstance.name;

    if (!parentInstance) {
      if (reactFlowInstance.getNodes().length <= 1) {
        return;
      }

      // Create the parent instance
      parentInstance = {
        name: currentInstanceName + '-parent',
        parentId: '',
        childrenId: [],
        topicNode: {
          id: `topic-${uuid()}`,
          type: 'topic',
          dragHandle: '.drag-handle',
          data: {
            parentId: '',
            chatHistory: [],
            instanceState: InstanceState.NONE, // To temporarily disable dive out of home
            state: {
              topic: currentInstanceName + '-parent',
            }
          } as TopicNodeData,
          position: currentInstance.topicNode.position,
        },
        jsonObject: {
          nodes: [currentInstance.topicNode] as Node[],
          edges: [] as Edge[],
          viewport: reactFlowInstance.getViewport(),
        },
        level: currentInstance.level-1,
      } as Instance;

      currentInstance.parentId = parentInstance.topicNode.id;
      currentInstance.name = predictedTopicName;
      currentInstance.topicNode.data.state.topic = predictedTopicName;
      currentInstance.topicNode.position = reactFlowInstance.getViewport();
      setInstanceMap(map => Object.assign(map, {
        [currentInstance.topicNode.id]: currentInstance,
        [currentInstance.parentId]: parentInstance,
      }))

      setSemanticRoute([{
        title: parentInstance.name,
        topicId: parentInstance.topicNode.id,
        level: parentInstance.level,
      }].concat(semanticRoute));
    } else {

      setSemanticRoute([{
        title: parentInstance.name,
        topicId: parentInstance.topicNode.id,
        level: parentInstance.level
      }]);
      // TODO: add Ellipses
    }

    prepareDive(reactFlowInstance, [semanticCarryList, setSemanticCarryList]);

    // store current reactFlowInstance
    currentInstance.jsonObject = reactFlowInstance.toObject();
    if (currentInstance.name === 'SenseCape') {
      currentInstance.name = currentInstanceName;
      currentInstance.topicNode.data.state.topic = currentInstanceName;
    }
    console.log('nodes', currentInstance.jsonObject.nodes);
    currentInstance.jsonObject.nodes = deleteRecommendedNodes(currentInstance.jsonObject.nodes);

    setPredictedTopicName('');
    setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

    // Set topic as parent topic
    currentInstance.topicNode.data.instanceState = InstanceState.WAS;
    setCurrentTopicId(parentInstance.topicNode.id);

    // Transition
    setInfiniteZoom(true);
    animateDiveOutTakeoff(reactFlowInstance);
    setTimeout(() => {

      if (parentInstance) {
        // recover parent reactFlowInstance
        reactFlowInstance.setNodes(parentInstance.jsonObject.nodes);
        reactFlowInstance.setEdges(parentInstance.jsonObject.edges);
        reactFlowInstance.setViewport(parentInstance.jsonObject.viewport);
      }

      setTimeout(() => {
        animateDiveOutLanding(reactFlowInstance);
        setInfiniteZoom(false);
      })

    }, totalTransitionTime/2);

  }, 0);
}

/**
 * Jumps to a particular topic
 */
export const semanticDiveTo = (
  nextTopicId: string,
  [infiniteZoom, setInfiniteZoom]: [boolean, Dispatch<SetStateAction<boolean>>],
  [instanceMap, setInstanceMap]: [InstanceMap, Dispatch<SetStateAction<InstanceMap>>],
  [currentTopicId, setCurrentTopicId]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [SemanticRouteItem[], Dispatch<SetStateAction<SemanticRouteItem[]>>],
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    if (currentTopicId !== nextTopicId) {
      const currentInstance = instanceMap[currentTopicId]!;
      let nextInstance = instanceMap[nextTopicId];

      if (nextInstance) {
        setSemanticRoute(semanticRoute.filter(routeItem => routeItem.level <= nextInstance.level));

        prepareDive(reactFlowInstance, [semanticCarryList, setSemanticCarryList]);

        // store current reactFlowInstance
        currentInstance.jsonObject = reactFlowInstance.toObject();
        currentInstance.jsonObject.nodes = deleteRecommendedNodes(currentInstance.jsonObject.nodes);
        setInstanceMap(map => Object.assign(map, {[currentTopicId]: currentInstance}));

        // Set topic as parent topic
        currentInstance.topicNode.data.instanceState = InstanceState.WAS;
        setCurrentTopicId(nextInstance.topicNode.id);

        // Transition
        setInfiniteZoom(true);
        animateDiveOutTakeoff(reactFlowInstance);
        setTimeout(() => {
          // recover next reactFlowInstance
          reactFlowInstance.setNodes(nextInstance.jsonObject.nodes);
          reactFlowInstance.setEdges(nextInstance.jsonObject.edges);
          reactFlowInstance.setViewport(nextInstance.jsonObject.viewport);

          setTimeout(() => {
            animateDiveToLanding(reactFlowInstance);
            setInfiniteZoom(false);
          })
        }, totalTransitionTime/2);
      }
    }

  })
};
