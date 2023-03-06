import { ChatCompletionRequestMessage } from 'openai';
import { Node } from 'reactflow';
import { ResponseState } from '../../components/input.model';

export interface ChatNodeData {
  parentId: string;
  chatHistory: ChatCompletionRequestMessage[];
  placeholder: string;        // If no response yet, use placeholder
  state: {
    input?: string;
    response?: string;
    summary?: string;
    keywords?: string;
    responseInputState?: ResponseState;
    highlightIds?: string[];
  }
};

// Reference to a ChatNode's input and response
export interface Reference {
  input: string;
  response: string;
}

export type TypeChatNode = Node<ChatNodeData>;
