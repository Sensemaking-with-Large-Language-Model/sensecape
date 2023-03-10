import {
  useReactFlow,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import { QuestionNodeData } from "./question-node.model";
import { createChatNode, createChatNodeFromDiv } from "../chat-node/chat-node.helper";
import { ChatNodeData } from "../chat-node/chat-node.model";
import { ResponseState } from "../../components/input.model";
import "./question-node.scss";

export const QuestionNode: React.FC<QuestionNodeData> = ( props: QuestionNodeData) => {
// export const QuestionNode: ( props: NodeProps) => {
  const reactFlowInstance = useReactFlow();


  const handleClick = (event: any) => {
    const data: ChatNodeData = {  
      parentId: props.parentId,
      chatHistory: [],
      placeholder:  props.question,        // If no response yet, use placeholder
      state: {
        input: props.question,
        responseInputState: ResponseState.LOADING,
      }
    }
    // createChatNode(reactFlowInstance, event.target.id, data);
    createChatNodeFromDiv(reactFlowInstance, event, event.target.id, props.parentId, data, props.index);
  }

  return (
      <div onClick={ handleClick } id={`${ props.keyword}` + "-" + `${ props.fiveWsType}` + "-" +  props.index} className="brainstorm-response-question">{ props.question }</div>
  )
};

export default QuestionNode;
