import { MouseEvent } from 'react';
import { Edge, ReactFlowInstance, XYPosition, getRectOfNodes } from "reactflow";
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
        x: width / 2 - 575 / 2,
        y: (height ?? 0) + 20,
      };
    } else {
      position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 100,
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
  }, 0);
};

export const createChatNodeFromDiv = (
  reactFlowInstance: ReactFlowInstance,
  event: MouseEvent,
  questionId: string,
  brainstormNodeId: string,
  data: ChatNodeData
) => {

  setTimeout(() => {
    const brainstormNodeElement = reactFlowInstance.getNode(brainstormNodeId);
    const xy_position = brainstormNodeElement?.position!;
    const height = brainstormNodeElement?.height!;
    const width = brainstormNodeElement?.width!;
    let position: XYPosition;

    position = {
      x: xy_position['x'] + width + 10,
      y: xy_position['y'] - 5,
    };
    console.log('position', position);
    const newNode: TypeChatNode = {
      id: `chat-${reactFlowInstance.getNodes().length}-${uuid()}`,
      type: "chat",
      dragHandle: ".drag-handle",
      position,
      data,
    };
    console.log('newNode', newNode);
    const edge: Edge =  {
      id: `e-${reactFlowInstance.getEdges().length}`,
      source: brainstormNodeId,
      type: 'default',
      target: newNode.id,
    }
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(edge);
  }, 0);
};
