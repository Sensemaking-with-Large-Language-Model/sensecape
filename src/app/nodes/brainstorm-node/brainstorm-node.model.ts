import { Node } from "reactflow";

export interface BrainstormNodeData {
  parentChatId: string;
  placeholder: string; // If no response yet, use placeholder
  instantInput?: string;
}

export type TypeBrainstormNode = Node<BrainstormNodeData>;
