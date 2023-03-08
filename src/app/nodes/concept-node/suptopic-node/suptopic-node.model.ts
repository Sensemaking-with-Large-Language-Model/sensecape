import { Node } from 'reactflow';

export interface SubTopicNodeData {
  parentId: string;
  rootId?: string;
}

export type TypeSubTopicNode = Node<SubTopicNodeData>;