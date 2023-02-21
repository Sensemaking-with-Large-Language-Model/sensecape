import { Edge, ReactFlowInstance, XYPosition, getRectOfNodes } from "reactflow";
import { BrainstormNodeData, TypeBrainstormNode } from "./brainstorm-node.model";

export const createBrainstormNode = (reactFlowInstance: ReactFlowInstance, sourceId: string, data: BrainstormNodeData) => {
  const currNode: TypeBrainstormNode | undefined = reactFlowInstance.getNode(sourceId);
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
        x: (width / 2) - (575 / 2),
        y: (height ?? 0) + 20,
      };
    } else {
      position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 100,
      }
    }
    const newNode: TypeBrainstormNode = {
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

  }, 0);
}