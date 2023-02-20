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

// State of Semantic Zoom Content
// Show ZoomState.value if zoom <= value
export enum ZoomState {
  ALL = 0.75,         // ALL if zoom <= 0.75
  SUMMARY = 0.3,
  KEYWORDS = 0.2,
}