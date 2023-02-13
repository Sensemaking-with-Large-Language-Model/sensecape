import { Node } from 'reactflow';

type TopicNodeData = {
  chatNodeId: string;
  chatReference: string;
  topicName: string;
};

export type TypeTopicNode = Node<TopicNodeData>;
