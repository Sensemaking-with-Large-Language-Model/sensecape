import { ReactFlowInstance, XYPosition } from "reactflow";
import { TypeTopicNode } from "../topic-node/topic-node.model";
import { ConceptNodeData, TypeConceptNode } from "./concept-node.model";

export const createConceptNode = (reactFlowInstance: ReactFlowInstance, topicNodes: TypeTopicNode[]) => {
  if (topicNodes.length === 0) {
    return;
  }
  setTimeout(() => {
    const y = Math.min(...topicNodes.map(node => node.position.y)) - 100;
    const xRange = topicNodes.map(node => node.position.x ?? 0);
    const x = (Math.min(...xRange) + Math.max(...xRange)) / 2;
    const position: XYPosition = {
      x,
      y,
    };
    const data: ConceptNodeData = {
      topicNodes,
    }
    const newNode: TypeConceptNode = {
      id: `chat-${reactFlowInstance.getNodes().length}`,
      type: 'concept',
      position,
      data,
    }
    reactFlowInstance.addNodes(newNode);
    topicNodes.forEach(node => {
      node.data.conceptId = newNode.id
    });
  }, 0);
}

// generate subtopics 
export const generateSubtopics = (reactFlowInstance: ReactFlowInstance, id: string, concept: string) => {
  setTimeout(() => {
    
    
  }, 0);
}

export const updateConceptNode = (reactFlowInstance: ReactFlowInstance, id: string, data: string) => {
  setTimeout(() => {
    const nodeToUpdate = reactFlowInstance.getNode(id);
    
  }, 0);
}


// export const createChatNode = (reactFlowInstance: ReactFlowInstance, sourceId: string, data: ChatNodeData) => {
//   const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(sourceId);
//   if (!currNode) {
//     return;
//   }
//   setTimeout(() => {
//     const nodeElement = document.querySelectorAll(`[data-id="${sourceId}"]`)[0]
//     const height = nodeElement.clientHeight;
//     const width = nodeElement.clientWidth;
//     const position: XYPosition = {
//       x: (width / 2) - (575 / 2),
//       y: (height ?? 0) + 20,
//       // x: currNode.position.x,
//       // y: currNode.position.y + (height ?? 0) + 20,
//     };
//     const newNode: TypeChatNode = {
//       id: `chat-${reactFlowInstance.getNodes().length}`,
//       type: 'chat',
//       dragHandle: '.drag-handle',
//       position,
//       parentNode: sourceId,
//       data,
//     };
//     const edge: Edge =  {
//       id: `e-${reactFlowInstance.getEdges().length}`,
//       source: sourceId,
//       target: newNode.id,
//     }
//     reactFlowInstance.addNodes(newNode);
//     reactFlowInstance.addEdges(edge);
//     console.log(reactFlowInstance.getNodes());
//   }, 0);
// }