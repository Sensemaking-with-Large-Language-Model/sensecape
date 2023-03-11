import { Node } from 'reactflow';
import { TopicNodeData, TypeTopicNode } from '../topic-node/topic-node.model';

export type HierarchyNodeData = {
  topicId: string;
  parentTopicId: string;
  topicName: string;
  state: {
    isRecommended?: boolean,
  }
};

export type TypeHierarchyNode = Node<HierarchyNodeData>;
