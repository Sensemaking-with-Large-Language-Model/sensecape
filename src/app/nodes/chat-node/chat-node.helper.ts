import { MouseEvent } from 'react';
import { Edge, ReactFlowInstance, XYPosition, getRectOfNodes } from "reactflow";
import { createTravellerEdge } from '../../edges/traveller-edge/traveller-edge.helper';
import { uuid } from "../../utils";
import { ChatNodeData, TypeChatNode } from "./chat-node.model";

export const createChatNode = (
  reactFlowInstance: ReactFlowInstance,
  sourceId: string,
  data: ChatNodeData
) => {
  const currNode: TypeChatNode | undefined =
    reactFlowInstance.getNode(sourceId);
  if (!currNode) {
    return;
  }
  setTimeout(() => {
    const nodeElement = document.querySelectorAll(`[data-id="${sourceId}"]`)[0];
    let position: XYPosition;
    if (nodeElement) {
      const height = nodeElement.clientHeight;
      const width = nodeElement.clientWidth;
      position = {
        x: width / 2,
        y: (height ?? 0) + 20,
      };
    } else {
      position = {
        x: 0,
        y: 100,
      };
    }
    const newNode: TypeChatNode = {
      id: `chat-${uuid()}`,
      type: 'chat',
      dragHandle: '.drag-handle',
      position,
      parentNode: sourceId,
      data,
    };
    const edge: Edge =  {
      id: `e-${uuid()}`,
      source: sourceId,
      target: newNode.id,
      data: {},
    };
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(edge);

    console.log(reactFlowInstance.getNodes());
  }, 100);
};

export const createChatNodeFromDiv = (
  reactFlowInstance: ReactFlowInstance,
  event: MouseEvent,
  questionId: string,
  brainstormNodeId: string,
  data: ChatNodeData
) => {

  setTimeout(() => {
    // const nodeElement = document.getElementById(questionId);
    // const nodeElement = document.querySelectorAll(`[data-id="${questionId}"]`)[0];
    
    // grab question div to get offset height to place generated chat node next to question
    const nodeElement = document.getElementById(questionId); 
    // grab brainstorm node to identify at what (x, y) coordinate to place generated chat node
    const brainstormNodeElement = reactFlowInstance.getNode(brainstormNodeId);
    const xy_position = brainstormNodeElement?.position!;
    const height = brainstormNodeElement?.height!;
    const width = brainstormNodeElement?.width!;

    let position: XYPosition;
    position = {
      x: xy_position['x'] + width + 80, // place chat node on the right of brainstorm node
      y: xy_position['y'] + nodeElement?.offsetTop! - 10, // place chat node next to question div relative to brainstorm node (offsetTop)
    };

    const newNode: TypeChatNode = {
      id: `chat-${reactFlowInstance.getNodes().length}-${uuid()}`,
      type: "chat",
      dragHandle: ".drag-handle",
      position,
      data,
    };

    console.log('brainstormNodeId', brainstormNodeId);
    console.log('newNode.id', newNode.id);
    // const edge: Edge =  {
    //   type: 'default',
    //   id: `e-${reactFlowInstance.getEdges().length}-${uuid()}`,
    //   source: brainstormNodeId,
    //   target: newNode.id,
    //   data: {},
    // }

    reactFlowInstance.addNodes(newNode);

    const newEdge = createTravellerEdge(brainstormNodeId, newNode.id, false)
    reactFlowInstance.setEdges((edges) => edges.concat(newEdge));

    // reactFlowInstance.addEdges(edge);
  }, 0);
};
