import { Edge, MarkerType, ReactFlowInstance, XYPosition } from "reactflow";
import { TypeTopicNode } from "../topic-node/topic-node.model";
import { ConceptNodeData, TypeConceptNode, ExtendedConceptNodeData, TypeExtendedConceptNode } from "./concept-node.model";

export const createConceptNode = (reactFlowInstance: ReactFlowInstance, topicNodes: TypeTopicNode[], travellerMode: boolean) => {
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
    // Create traveller edges from topics to concept
    topicNodes.forEach(node => {
      node.data.conceptId = newNode.id;
      const newEdge: Edge = {
        id: `edge-travel-${reactFlowInstance.getEdges().length}`,
        source: node.id,
        target: newNode.id,
        hidden: !travellerMode,
        animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: '#3ab2ee',
        },
        type: 'traveller',
      };
      reactFlowInstance.addEdges(newEdge);
    });
  }, 0);
}

export const updateConceptNode = (reactFlowInstance: ReactFlowInstance, id: string, data: string) => {
  setTimeout(() => {
    const nodeToUpdate = reactFlowInstance.getNode(id);
    
  }, 0);
}