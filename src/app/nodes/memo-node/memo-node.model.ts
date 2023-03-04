import { Node } from 'reactflow';

export interface MemoNodeData {
  state: {
    title?: string,
    memo?: string,
  }
}

export type TypeMemoNode = Node<MemoNodeData>;