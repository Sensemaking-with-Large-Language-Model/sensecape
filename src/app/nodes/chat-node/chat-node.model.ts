import { Node } from 'reactflow';

export interface ChatNodeData {
  parentChatId: string;
  chatReference: string;
  placeholder: string;        // If no response yet, use placeholder
  instantInput?: string;       // If instant input exists, instantly generate response
};

// Reference to a ChatNode's input and response
export interface Reference {
  input: string;
  response: string;
}

export type TypeChatNode = Node<ChatNodeData>;
