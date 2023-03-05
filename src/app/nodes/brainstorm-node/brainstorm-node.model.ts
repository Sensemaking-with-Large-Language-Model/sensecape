import { Node } from "reactflow";
import { ResponseState } from "../../components/input.model";

export interface BrainstormNodeData {
  placeholder: string; // If no response yet, use placeholder
  state: {
    input?: string;
    questions?: {};
    responseInputState?: ResponseState;
  }
  instantInput?: string;
}

export type TypeBrainstormNode = Node<BrainstormNodeData>;
