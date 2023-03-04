import { BrainstormNodeData, TypeBrainstormNode } from "./brainstorm-node/brainstorm-node.model";
import { ChatNodeData, TypeChatNode } from "./chat-node/chat-node.model";
import { ConceptNodeData, TypeConceptNode } from "./concept-node/concept-node.model";
import { MemoNodeData, TypeMemoNode } from "./memo-node/memo-node.model";
import { TopicNodeData, TypeTopicNode } from "./topic-node/topic-node.model";

export type CreativeNodeData = 
  BrainstormNodeData |
  ChatNodeData |
  TopicNodeData |
  ConceptNodeData |
  MemoNodeData;

export type CreativeNode = 
  TypeBrainstormNode |
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
  KEYWORDS = 0.4,
  PREDIVEOUT = 0.4,  // indicates Semantic Dive Out ready
  // MIN ZOOM = 0.3
}

// enum for a 3 state input/click ui system
export enum InputHoverState {
  OUT = 'out',
  HOVER = 'hover',
  CLICKED = 'clicked',
}