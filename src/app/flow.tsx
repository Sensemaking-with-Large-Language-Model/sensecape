import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Node,
  addEdge,
  ReactFlowProvider,
  Background,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  NodeTypes,
  XYPosition
} from "reactflow";

import "reactflow/dist/style.css";
import './flow.scss';
import ChatNode from "./nodes/chat-node/chat-node";
import { TypeChatNode } from "./nodes/chat-node/chat-node.model";
import ConceptNode from "./nodes/concept-node/concept-node";
import TopicNode from "./nodes/topic-node/topic-node";
import { TypeTopicNode } from "./nodes/topic-node/topic-node.model";

const initialNodes: Node[] = [
  {
    id: "chat-0",
    type: "chat",
    dragHandle: '.drag-handle',
    data: {
      parentChatId: '',
      chatReference: '',
      placeholder: 'Ask GPT-3'
    },
    position: { x: 250, y: 200 }
  }
];

const initialEdges: Edge[] = [];

const proOptions = { account: 'paid-pro', hideAttribution: true };

const nodeTypes: NodeTypes = {
  chat: ChatNode,
  topic: TopicNode,
  concept: ConceptNode,
};

let id = 0;
const getId = () => `${id++}`;

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('dragNodeType');
      const data = JSON.parse(event.dataTransfer.getData('dragNodeData'));

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowInstance) {
        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const newNode: TypeTopicNode = {
          id: getId(),
          dragHandle: '.drag-handle',
          type,
          position,
          data,
        };
        setNodes((nodes) => nodes.concat(newNode));
      }
    },
    [reactFlowInstance]
  );
  const createChatNode = useCallback(
    (e: any) => {
      console.log('received!', e.id);
    },
    // (event: any) => {
    //   event.preventDefault();
    //   const data = JSON.parse(event.dataTransfer.getData('chatParentData'));

    //   // if (reactFlowInstance) {
    //   //   // const position: XYPosition = reactFlowInstance.project({
    //   //   //   x: ,
    //   //   //   y: ,
    //   //   // });
    //   //   const newNode: TypeChatNode = {
    //   //     id: getId(),
    //   //     type: 'chat',
    //   //     position,
    //   //     data,
    //   //   };
    //   //   setNodes((nodes) => nodes.concat(newNode));
    //   // }
    // },
    [reactFlowInstance]
  );

  document.addEventListener('create-chat-follow-up', (e) => {
    console.log('listened');
    createChatNode(e);
  });

  return (
    <div className="explore-flow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            proOptions={proOptions}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            panOnScroll={true}
            panOnDrag={false}
          >
          <Background />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ExploreFlow;
