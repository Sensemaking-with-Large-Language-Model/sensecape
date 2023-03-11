import { Edge, XYPosition } from "reactflow";
import { uuid } from "../../utils";
import { HierarchyNodeData, TypeHierarchyNode } from "./hierarchy-node.model"

/**
 * Creates a new hierarchy node object
 * NOTE: Does not create the topic node and instances!
 */
export const createHierarchyNode = (
  topicName: string,
  topicId: string,
  parentTopicId: string,
  isRecommended: boolean,
  position: XYPosition,
): TypeHierarchyNode => {
  return {
    id: `hierarchy-${topicId}`,
    type: 'hierarchy',
    position,
    data: {
      topicId,
      parentTopicId,
      topicName,
      state: {
        isRecommended,
      }
    } as HierarchyNodeData,
  } as TypeHierarchyNode;
}
