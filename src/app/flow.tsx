import { useCallback } from "react";
import ReactFlow, {
  Node,
  addEdge,
  Background,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes
} from "reactflow";

import "reactflow/dist/style.css";
import ChatNode from "./nodes/chat-node/chat-node";
import ConceptNode from "./nodes/concept-node/concept-node";
import TopicNode from "./nodes/topic-node/topic-node";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "chat",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 }
  }
];

const initialEdges: Edge[] = [];

const proOptions = { account: 'paid-pro', hideAttribution: true };

const nodeTypes: NodeTypes = {
  chat: ChatNode,
  topic: TopicNode,
  concept: ConceptNode,
};

const ExploreFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  return (
    <ReactFlow
      proOptions={proOptions}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      panOnScroll={true}
      panOnDrag={false}
    >
      <Background />
    </ReactFlow>
  );
};

export default ExploreFlow;
