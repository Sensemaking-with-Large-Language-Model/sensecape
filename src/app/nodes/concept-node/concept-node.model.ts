import { Node } from 'reactflow';
import { TypeTopicNode } from '../topic-node/topic-node.model';

export interface ConceptNodeData {
  topicNodes: TypeTopicNode[]
}

export type TypeConceptNode = Node<ConceptNodeData>;