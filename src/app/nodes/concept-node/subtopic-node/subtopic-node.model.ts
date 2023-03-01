import { Node } from 'reactflow';

export interface SubTopicNodeData {
  parentId: string
}

export type TypeSubTopicNode = Node<SubTopicNodeData>;