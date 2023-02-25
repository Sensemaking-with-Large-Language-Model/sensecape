import {
  useReactFlow,
  NodeProps,
} from "reactflow";
import { QuestionNodeData } from "./question-node.model";
import { createChatNode, createChatNodeFromDiv } from "../chat-node/chat-node.helper";
import { ChatNodeData } from "../chat-node/chat-node.model";
import { ResponseState } from "../../components/input.model";


export const QuestionNode: React.FC<QuestionNodeData> = ( props: QuestionNodeData) => {
// export const QuestionNode: ( props: NodeProps) => {
  const reactFlowInstance = useReactFlow();

  const handleClick = (event: any) => {
    const data:ChatNodeData = {  
      parentId: '',
      chatReference: '',
      placeholder: '',        // If no response yet, use placeholder
      state: {
        input: props.question,
        responseInputState: ResponseState.LOADING,
      }
    }
    // createChatNode(reactFlowInstance, '', data);
    createChatNodeFromDiv(reactFlowInstance, event, data);
  }

  return <div onClick={ handleClick } id={`${ props.keyword}` + "-" + `${ props.fiveWsType}` + "-" +  props.index} className="brainstorm-response-question">{ props.question }</div>
};

export default QuestionNode;
