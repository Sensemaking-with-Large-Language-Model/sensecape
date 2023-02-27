import { createContext } from 'react';
import { Node } from 'reactflow';
// import { FlowContextValue } from './flow.model';

// export const FlowContext = createContext<FlowContextValue | undefined>(undefined);
// export const FlowContext = createContext<FlowContextValue | undefined>({});

export interface FlowContent {
    numOfConceptNodes: number;
    conceptNodes: Node[],
    conceptEdges: Node[],
    setNumOfConceptNodes: Function,
    setConceptNodes?: Function,
    setConceptEdges?: Function,
}

// export type FlowContextType = {
//     numOfConceptNodes: 0;
//     conceptNodes: [];
//     conceptEdges: [];
//     setNumOfConceptNodes: () => void;
//     setConceptNodes?: () => void;
//     setConceptEdges?: () => void;
// }

// export const FlowContext = createContext<FlowContent>({
//     numOfConceptNodes: 0,
//     conceptNodes: [],
//     conceptEdges: [],
//     setNumOfConceptNodes: () => void,
//     setConceptNodes?:  Dispatch<SetStateAction<number>>,
//     setConceptEdges?: Function,, // set a default value
//     setCopy: () => {},
//     })
//     export const useGlobalContext = () => useContext(MyGlobalContext)
  
// export const FlowContext = createContext({
//     numOfConceptNodes: 0,
//     conceptNodes: [],
//     conceptEdges: [],
// });

// export const FlowContext = createContext(null);


// export interface ITodo {
//     id: number;
//     title: string;
//     description: string;
//     status: boolean;
//   }
//   export type TodoContextType = {
//     todos: ITodo[];
//     saveTodo: (todo: ITodo) => void;
//     updateTodo: (id: number) => void;
//   };