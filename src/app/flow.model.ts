import { createContext } from 'react';
import { Node } from 'reactflow';

export interface FlowContextValue {
    numOfConceptNodes: number;
    setNumOfConceptNodes: React.Dispatch<React.SetStateAction<number>>,
    conceptNodes: Node[],
    conceptEdges: Node[],
    setConceptNodes: Function,
    setConceptEdges: Function,
}
  
export const FlowContext = createContext<FlowContextValue>({
    numOfConceptNodes: 0,
    setNumOfConceptNodes: () => {},
    conceptNodes:[],
    conceptEdges:[],
    setConceptNodes: () => {},
    setConceptEdges: () => {},
});