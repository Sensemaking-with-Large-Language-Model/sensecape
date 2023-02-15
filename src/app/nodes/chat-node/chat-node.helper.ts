import { Edge, ReactFlowInstance, XYPosition } from "reactflow";
import { ChatNodeData, TypeChatNode } from "./chat-node.model";

export const createChatNode = (reactFlowInstance: ReactFlowInstance, sourceId: string, data: ChatNodeData) => {
  const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(sourceId);
  if (!currNode) {
    return;
  }
  setTimeout(() => {
    const nodeElement = document.querySelectorAll(`[data-id="${sourceId}"]`)[0]
    const height = nodeElement.clientHeight;
    const width = nodeElement.clientWidth;
    const position: XYPosition = {
      x: (width / 2) - (575 / 2),
      y: (height ?? 0) + 20,
      // x: currNode.position.x,
      // y: currNode.position.y + (height ?? 0) + 20,
    };
    const newNode: TypeChatNode = {
      id: `chat-${reactFlowInstance.getNodes().length}`,
      type: 'chat',
      dragHandle: '.drag-handle',
      position,
      parentNode: sourceId,
      data,
    };
    const edge: Edge =  {
      id: `e-${reactFlowInstance.getEdges().length}`,
      source: sourceId,
      target: newNode.id,
    }
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(edge);
    console.log(reactFlowInstance.getNodes());
  }, 0);
}