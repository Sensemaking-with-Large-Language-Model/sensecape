import { Node, NodeProps } from "reactflow";

export interface QuestionNodeData {
    fiveWsType?: string;
    question: string;
    index: number;
    keyword: string;
}

export type TypeQuestionNode = Node<QuestionNodeData>;
