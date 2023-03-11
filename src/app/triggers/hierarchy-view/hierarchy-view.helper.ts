import { getChatGPTRelatedTopics } from "../../../api/openai-api";
import { TypeHierarchyNode } from "../../nodes/hierarchy-node/hierarchy-node.model";
import { TypeTopicNode } from "../../nodes/topic-node/topic-node.model";

export const recommendSubtopics = async (
  topicNode: TypeTopicNode,
) => {
  const randNTopics = Math.floor(Math.random() * 2) + 1; // 1-2 subtopics
  return await getChatGPTRelatedTopics(
    topicNode.data.state.topic ?? '',
    randNTopics,
  );
}
