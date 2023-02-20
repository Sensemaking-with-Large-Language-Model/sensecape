import { ReactFlowInstance, XYPosition } from "reactflow";
import { TypeTopicNode } from "../topic-node/topic-node.model";
import { ConceptNodeData, TypeConceptNode, ExtendedConceptNodeData, TypeExtendedConceptNode } from "./concept-node.model";

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
export const extendConcepts = (reactFlowInstance: ReactFlowInstance, id_: string) => {
  setTimeout(() => {

    if (!id_){
      return;
    }
    // select concept node & get input value
    const nodeElement:any = document.querySelectorAll(`[data-id="${id_}"]`)[0];
    const currentValue:any = nodeElement.getElementsByClassName('text-input')[0].value;
    const elem = reactFlowInstance.getNode(id_);

    // const topics = generateTopic('bottom', currentValue);
    // console.log('topics', topics);
    const position = {
        x: elem?.position.x,
        y: elem?.position.y,
      };
    const id = reactFlowInstance.getNodes().length;
    // console.log(id);
    const newNode:any = {
      id,
      position,
      data: { label: `Node ${id}` },
    };

    reactFlowInstance.addNodes(newNode);
  }, 0);
}

export const updateConceptNode = (reactFlowInstance: ReactFlowInstance, id: string, data: string) => {
  setTimeout(() => {
    const nodeToUpdate = reactFlowInstance.getNode(id);
    
  }, 0);
}