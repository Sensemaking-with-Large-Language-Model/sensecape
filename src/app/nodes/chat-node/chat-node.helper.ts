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
    };
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(edge);
    console.log(reactFlowInstance.getNodes());
  }, 0);
};

export const createChatNodeFromDiv = (
  reactFlowInstance: ReactFlowInstance,
  event: any,
  data: ChatNodeData
) => {
  // const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(sourceId);
  // console.log('createChatNodefromDiv1');
  // if (!currNode) {
  //   return;
  // }

  setTimeout(() => {
    const nodeElement = document.getElementById(event?.target.id);
    let position: XYPosition;
    // console.log('event.pageX', event.pageX);
    // console.log('event.pageY', event.pageY);
    position = {
    //   // x: (width / 2) - (575 / 2),
    //   // y: (height ?? 0) + 20,
      x: event.clientLeft + event.clientWidth + 150,
      y: event.clientTop + event.clientHeight,
    };
    const newNode: TypeChatNode = {
      id: `chat-${reactFlowInstance.getNodes().length}`,
      type: "chat",
      dragHandle: ".drag-handle",
      position,
      parentNode: event.target.id,
      data,
    };
    console.log(newNode);
    // const edge: Edge =  {
    //   id: `e-${reactFlowInstance.getEdges().length}`,
    //   source: sourceId,
    //   target: newNode.id,
    // }
    console.log("createChatNodefromDiv3");
    reactFlowInstance.addNodes(newNode);
    console.log("createChatNodefromDiv4");
    // reactFlowInstance.addEdges(edge);
  }, 0);
};
