import { ChatCompletionRequestMessage } from 'openai';
import { Node } from 'reactflow';
import { ResponseState } from '../../components/input.model';
import { InstanceState } from '../../triggers/semantic-dive/semantic-dive';
import { InputHoverState } from '../node.model';

export interface TopicNodeData {
  parentId: string;
  chatHistory: ChatCompletionRequestMessage[];
  conceptId?: string;
  instanceTopicName?: string; // Topic name of the instance
  instanceState: InstanceState;
  state: {
    topic?: string;
    toolbarAvailable?: true;
    toolbarViewState?: InputHoverState.OUT;
    isRecommended?: boolean;
  }
};

export type TypeTopicNode = Node<TopicNodeData>;
