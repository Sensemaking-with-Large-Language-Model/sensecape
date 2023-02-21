import { uuid } from "../utils";
import { ReactFlowInstance, MarkerType } from "reactflow";
// import { getTopics } from "../../api/openai-api";

const useBrainstorm = async (
  reactFlowInstance: ReactFlowInstance,
  id: string,
  concept: string,
  conceptnode: boolean = true
) => {
  const parentNode = reactFlowInstance.getNode(id);

  if (!parentNode) {
    return;
  }

};

export default useBrainstorm;
