import { Node } from 'reactflow';
import { TopicNodeData, TypeTopicNode } from '../topic-node/topic-node.model';

export type HierarchyNodeData = {
  topicId: string;
  topicName: string;
  expanded: boolean;
  expandable?: boolean;
};

export type TypeHierarchyNode = Node<HierarchyNodeData>;
