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
  // MAX ZOOM = 3
  PREDIVEIN = 2.5,    // Indicates Semantic Dive In ready
  ALL = 0.75,         // ALL if zoom <= 0.75
  SUMMARY = 0.5,
  KEYWORDS = 0.32,
  PREDIVEOUT = 0.32,  // indicates Semantic Dive Out ready
  // MIN ZOOM = 0.3
}

// enum for a 3 state input/click ui system
export enum InputHoverState {
  OUT = 0,
  HOVER = 1,
  CLICKED = 2,
}