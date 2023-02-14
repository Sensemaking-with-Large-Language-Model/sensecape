import { Node } from 'reactflow';

type ChatNodeData = {
  parentChatId: string;
  chatReference: string;
  placeholder: string;
};

export enum ResponseState {
  INPUT = 'input',
  LOADING = 'loading',
  COMPLETE = 'complete',
}

export type TypeChatNode = Node<ChatNodeData>;
