import { Node } from 'reactflow';
import { ResponseState } from '../../components/input.model';

export interface FlexNodeData {
  parentId?: string;
  placeholder: string;        // If no response yet, use placeholder
  state: {
    input?: string;
    response?: string;
    summary?: string;
    keywords?: string;
    responseInputState?: ResponseState;
  }
};

// Reference to a ChatNode's input and response
export interface Reference {
  input: string;
  response: string;
}

export type TypeFlexNode = Node<FlexNodeData>;
