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
    const nodeElement = document.getElementById(questionId);
    const brainstormNodeElement = document.querySelectorAll(`[data-id="${brainstormNodeId}"]`)[0];
    var node_rect = nodeElement!.getBoundingClientRect();
    var brainstorm_rect = brainstormNodeElement.getBoundingClientRect();
    var viewport = reactFlowInstance.getViewport();
    var zoom = viewport.zoom;
    console.log('nodeElement', nodeElement);
    console.log('node_rect', node_rect);
    console.log('brainstormNodeElement', brainstormNodeElement);
    console.log('brainstorm_rect', brainstorm_rect);
    // console.log('window.scrollX', window.scrollX);
    // console.log('window.scrollY', window.scrollY);
    console.log('viewport', viewport);
    let position: XYPosition;

    if (viewport.y < 0) {

    }

    position = {
      // x: (viewport.x * zoom) + (brainstorm_rect.right * zoom) + 10,
      // y: (viewport.y * zoom) + (brainstorm_rect.bottom * zoom) ,
      x: viewport.x + (brainstorm_rect.right) + 10,
      y: viewport.y + node_rect.bottom,
      // y: (viewport.y < 0)? viewport.y - brainstorm_rect.bottom : viewport.y + brainstorm_rect.bottom ,
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
    // const edge: Edge =  {
    //   id: `e-${reactFlowInstance.getEdges().length}`,
    //   source: sourceId,
    //   target: newNode.id,
    // }
    reactFlowInstance.addNodes(newNode);
    // reactFlowInstance.addEdges(edge);
  }, 0);
};
