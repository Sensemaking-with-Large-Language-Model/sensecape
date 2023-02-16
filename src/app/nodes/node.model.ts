import { ChatNodeData, TypeChatNode } from "./chat-node/chat-node.model";
import { ConceptNodeData, TypeConceptNode } from "./concept-node/concept-node.model";
import { MemoNodeData, TypeMemoNode } from "./memo-node/memo-node.model";
import { TopicNodeData, TypeTopicNode } from "./topic-node/topic-node.model";

export type CreativeNodeData = 
  ChatNodeData |
  TopicNodeData |
  ConceptNodeData |
  MemoNodeData;

export type CreativeNode = 
  TypeChatNode |
  TypeTopicNode |
  TypeConceptNode |
  TypeMemoNode;