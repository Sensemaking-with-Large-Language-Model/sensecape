import {
  useReactFlow,
  NodeProps,
} from "reactflow";
import { QuestionNodeData } from "./question-node.model";
import { createChatNode, createChatNodeFromDiv } from "../chat-node/chat-node.helper";
import { ChatNodeData } from "../chat-node/chat-node.model";


export const QuestionNode: React.FC<QuestionNodeData> = ( props: QuestionNodeData) => {
// export const QuestionNode: ( props: NodeProps) => {
  const reactFlowInstance = useReactFlow();

  const handleClick = (event: any) => {

    console.log(event);
    console.log(event.target.id);
    const data:ChatNodeData = {  
      parentChatId: '',
      chatReference: '',
      placeholder: '',        // If no response yet, use placeholder
      instantInput: props.question,
    }
    // createChatNode(reactFlowInstance, '', data);
    createChatNodeFromDiv(reactFlowInstance, event, data);
  }

  return <div onClick={ handleClick } id={`${ props.keyword}` + "-" + `${ props.fiveWsType}` + "-" +  props.index} className="brainstorm-response-question">{ props.question }</div>
};

export default QuestionNode;
