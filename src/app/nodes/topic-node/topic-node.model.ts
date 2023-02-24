import { Node } from 'reactflow';
import { InstanceState } from '../../triggers/semantic-dive';

export interface TopicNodeData {
  chatNodeId: string;
  chatReference: string;
  topicName: string;
  conceptId?: string;
  instanceState: InstanceState;
};

export type TypeTopicNode = Node<TopicNodeData>;
