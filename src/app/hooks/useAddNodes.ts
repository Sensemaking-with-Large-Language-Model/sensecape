import { ReactFlowInstance, useReactFlow } from "reactflow";
import { TypeChatNode } from "../nodes/chat-node/chat-node.model";

export const useAddNodes = async (node_: TypeChatNode) => {
    const reactFlowInstace = useReactFlow();
    await reactFlowInstace.addNodes(node_);
    return Promise.resolve(true);
}