import { Node } from 'reactflow';
import { TypeTopicNode } from '../topic-node/topic-node.model';

export interface ConceptNodeData {
  topicNodes?: TypeTopicNode[] // optional, since we also have concept node not generated from topics
}

export type TypeConceptNode = Node<ConceptNodeData>;

export enum ConceptNodeState {
  INPUT = 'input',
  COMPLETE = 'complete',
}


export interface ExtendedConceptNodeData {
  
}

export type TypeExtendedConceptNode = Node<ExtendedConceptNodeData>;
