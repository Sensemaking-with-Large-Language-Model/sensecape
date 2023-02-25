import { Node } from 'reactflow';
import { ResponseState } from '../../components/input.model';
import { InstanceState } from '../../triggers/semantic-dive';
import { InputHoverState } from '../node.model';

export interface TopicNodeData {
  parentId: string;
  chatReference: string;
  conceptId?: string;
  instanceTopicName?: string; // Topic name of the instance
  instanceState: InstanceState;
  state: {
    topic?: string;
    // topicUniqueName: string; // Used for semantic dive
    tooltipAvailable?: true;
    toolbarViewState?: InputHoverState.OUT;
  }
};

export type TypeTopicNode = Node<TopicNodeData>;
