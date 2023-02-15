import { Node } from 'reactflow';

export interface TopicNodeData {
  chatNodeId: string;
  chatReference: string;
  topicName: string;
  conceptId?: string;
};

export type TypeTopicNode = Node<TopicNodeData>;
