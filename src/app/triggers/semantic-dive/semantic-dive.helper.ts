import React, { CSSProperties, Dispatch, SetStateAction } from "react";
import { Edge, getRectOfNodes, Node, ReactFlowInstance, Rect, XYPosition } from "reactflow";
import { getChatGPTRelatedTopics } from "../../../api/openai-api";
import { ResponseState } from "../../components/input.model";
import { TypeChatNode } from "../../nodes/chat-node/chat-node.model";
import { TypeConceptNode } from "../../nodes/concept-node/concept-node.model";
import { TopicNodeData } from "../../nodes/topic-node/topic-node.model";
import { Instance, InstanceMap, NodeEdgeList } from "./semantic-dive";

export interface SemanticRouteItem {
  title: string;
  topicId: string;
  level: number;
}

/**
 * Returns the name of the instance
 */
export const getInstanceName = (instance: Instance) => {
  let toReturn = '';
  try {
    toReturn = instance.topicNode.data.state.topic ?? '';
  } catch (error) {
  }
  return toReturn;
}

/**
 * For any node that is loading a response, cancel the API call and reset
 * input state to IDLE
 */
export const resetLoadingStates = (
  nodes: Node[],
) => {
  return nodes.map(node => {
    if (
      node.type === 'chat' ||
      node.type === 'concept' ||
      node.type === 'brainstorm'
    ) {
      if (node.data.state.responseInputState == ResponseState.LOADING) {
        node.data.state.responseInputState = ResponseState.IDLE;
      }
    }
    return node;
  });
}

export const prepareDive = (
  reactFlowInstance: ReactFlowInstance,
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
  diveInstanceId?: string,
) => {
  const nodesToCarry = reactFlowInstance.getNodes().filter(node => node.selected && node.id !== diveInstanceId);

  // Save selected nodes & edges for semantic dives
  setSemanticCarryList({
    nodes: semanticCarryList.nodes.concat(nodesToCarry),
    edges: semanticCarryList.edges.concat(reactFlowInstance
      .getEdges().filter(edge => edge.selected)),
  });

  // Node Elements cloned to create the capture of carry nodes
  const nodeElements = (nodesToCarry
    .map(node => document.querySelector(`[data-id="${node.id}"]`))
    .filter(nodeElement => nodeElement) as HTMLElement[])
    .map(nodeElement => nodeElement.firstChild!.cloneNode(true));

  const carryCapture = document.createElement('div');

  carryCapture.append(...nodeElements);

  carryCapture.style.pointerEvents = 'none';
  carryCapture.style.scale = '0.2';
  carryCapture.style.opacity = '0.7';
  carryCapture.style.position = 'absolute';
  carryCapture.style.transition = 'scale ease 0.5s';
  const handles = carryCapture.querySelectorAll('.react-flow__handle');
  handles.forEach(handle => {
    handle.remove();
  });

  setTimeout(() => {
    carryCapture.style.scale = '0.5';
    carryCapture.style.display = 'flex';
    carryCapture.style.gap = '20px';
  }, 1);

  document.addEventListener('mousemove', (e) => {
    carryCapture.style.top = `${e.clientY - carryCapture.clientHeight/2}px`;
    carryCapture.style.left = `${e.clientX - carryCapture.clientWidth/2}px`;
  })

  const carryBox = document.getElementById('semantic-carry-box');
  carryBox?.appendChild(carryCapture);

  // Preprocessing of nodes before semantic dive
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    node.selected = false;
    return node;
  }));
}

export const styleNodesAndEdges = (
  reactFlowInstance: ReactFlowInstance,
  focusNodeIds: string[],
  style: CSSProperties,
  repelSurroundings?: boolean,
) => {
  const focusNodes = focusNodeIds
    .map(nodeId => reactFlowInstance.getNode(nodeId))
    .filter((node): node is Node => !!node);
  const sourceRect: Rect = getRectOfNodes(focusNodes);
  setTimeout(() => {
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (!focusNodeIds.includes(node.id)) {
        if (repelSurroundings) {
          const {x, y} = getRepelDirection(sourceRect, node);
          node.style = {
            ...style,
            translate: `${x*300}px ${y*300}px`
          };
        } else {
          node.style = style;
        }
      }
      return node;
    }));
    reactFlowInstance.setEdges(edges => edges.map(edge => {
      if (repelSurroundings) {
        const {x, y} = getRepelDirection(sourceRect, reactFlowInstance.getNode(edge.source)!);
        edge.style = {
          ...style,
          translate: `${x*300}px ${y*300}px`
        };
      } else {
        edge.style = style;
      }
      return edge;
    }));
  });
}

export const getRepelDirection = (sourceRect: Rect, target: Node) => {
  const xDiff = target?.position.x - sourceRect.x;
  const yDiff = target?.position.y - sourceRect.y;
  const mag = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  return {x: xDiff/mag, y: yDiff/mag};
}

export const clearSemanticCarry = (
  setSemanticCarryList: Dispatch<SetStateAction<NodeEdgeList>>
) => {
  const carryBox = document.getElementById('semantic-carry-box');
  carryBox?.replaceChildren();
  setSemanticCarryList({
    nodes: [],
    edges: [],
  });
}

// Just a wrapper for now, but potentially may have more functionality
export const predictRelatedTopics = (
  context: string,
) => {
  return getChatGPTRelatedTopics(context);
}

export const calculateSurroundPositions = (
  n: number,
  {x, y}: XYPosition
) => {
  let positions: XYPosition[] = [];
  const radius = 200;
  for (let i = 0; i < 5; i += 1) {
    const theta = ((Math.PI*2)*i)/n;
    let dx = radius * Math.cos(theta);
    let dy = radius * Math.sin(theta);
    positions.push({x: x+dx, y: y+dy});
  }
  return positions;
}

// Delete any recommended nodes that were ignored
export const deleteRecommendedNodes = (
  nodes: Node[]
) => {
  return nodes.filter(node => {
    if (node.type === 'topic') {
      console.log(node.data.state.isRecommended);
      if ((node.data as TopicNodeData).state.isRecommended) {
        console.log('deleting', node);
      }
      return !(node.data as TopicNodeData).state.isRecommended;
    } else {
      return true;
    }
  });
}
