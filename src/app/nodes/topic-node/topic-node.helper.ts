import { ChatCompletionRequestMessage } from 'openai';
import { ReactFlowInstance, XYPosition } from 'reactflow';
import { createTravellerEdge } from '../../edges/traveller-edge/traveller-edge.helper';
import { InstanceState } from '../../triggers/semantic-dive/semantic-dive';
import { uuid } from '../../utils';
import { TopicNodeData, TypeTopicNode } from './topic-node.model';

// Unlike other create Nodes
export const createTopicNode = (
  topic: string,
  parentId: string,
  position: XYPosition,
  chatHistory: ChatCompletionRequestMessage[],
  isRecommended: boolean,
  reactFlowInstance: ReactFlowInstance,
) => {
  const newTopicNode: TypeTopicNode = {
    id: uuid(),
    type: 'topic',
    dragHandle: '.drag-handle',
    position,
    data: {
      parentId,
      chatHistory,
      instanceState: InstanceState.NONE,
      state: {
        topic,
        isRecommended,
      }
    } as TopicNodeData,
    selectable: true,
    zIndex: -100,
  };
  // TODO: Make travellerEdge show or no show depending on state
  const newTravellerEdge = createTravellerEdge(parentId, newTopicNode.id, false)
  reactFlowInstance.addNodes(newTopicNode);
  reactFlowInstance.addEdges(newTravellerEdge);
  return newTopicNode;
}