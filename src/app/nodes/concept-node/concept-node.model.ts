import { Node } from 'reactflow';
import { ResponseState } from '../../components/input.model';
import { TypeTopicNode } from '../topic-node/topic-node.model';

export interface ConceptNodeData {
  topicNodes?: TypeTopicNode[] // optional, since we also have concept node not generated from topics
  width: number,
  height: number,
  state: {
    responseSelfState?: ResponseState;    // State when concept itself is being generated
    responseInputState?: ResponseState             // State when concept is generating
    concept?: string;
    input?: string;
  }
}

export type TypeConceptNode = Node<ConceptNodeData>;

export enum ConceptNodeState {
  INPUT = 'input',
  COMPLETE = 'complete',
}


export interface ExtendedConceptNodeData {
  
}

export type TypeExtendedConceptNode = Node<ExtendedConceptNodeData>;
