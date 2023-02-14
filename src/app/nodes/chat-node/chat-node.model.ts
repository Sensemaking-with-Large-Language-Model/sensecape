import { Node } from 'reactflow';

type ChatNodeData = {
  parentChatId: string;
  chatReference: string;
  placeholder: string;
};

export type TypeChatNode = Node<ChatNodeData>;
