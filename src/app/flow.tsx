import { useCallback, useEffect, useRef, useState } from "react";
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
  XYPosition,
  OnSelectionChangeParams,
  MarkerType
} from "reactflow";

import "reactflow/dist/style.css";
import GenerateConceptButton from "./components/button-generate-concept/button-generate-concept";
import NodeToolkit from "./components/node-toolkit/node-toolkit";
import FloatingConnectionLine from "./edges/floating-edge/floating-connection";
import FloatingEdge from "./edges/floating-edge/floating-edge";
import './flow.scss';
import ChatNode from "./nodes/chat-node/chat-node";
import { TypeChatNode } from "./nodes/chat-node/chat-node.model";
import ConceptNode from "./nodes/concept-node/concept-node";
import { createConceptNode } from "./nodes/concept-node/concept-node.helper";
import { TypeConceptNode } from "./nodes/concept-node/concept-node.model";
import MemoNode from "./nodes/memo-node/memo-node";
import { TypeMemoNode } from "./nodes/memo-node/memo-node.model";
import { CreativeNode } from "./nodes/node.model";
import TopicNode from "./nodes/topic-node/topic-node";
import { TypeTopicNode } from "./nodes/topic-node/topic-node.model";

const initialNodes: Node[] = [
  {
    id: "chat-0",
    type: "chat",
    dragHandle: '.drag-handle',
    data: {
      parentId: '',
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
  memo: MemoNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

let id = 0;
const getId = () => `${id++}`;

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<TypeTopicNode[]>([]);
  const [travellerMode, setTravellerMode] = useState(false);

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
        let newNode: CreativeNode;
        if (type === 'chat' || type === 'topic') {
          newNode = {
            id: getId(),
            dragHandle: '.drag-handle',
            type,
            position,
            data,
          };
        } else if (type === 'memo' || type === 'concept') {
          newNode = {
            id: getId(),
            type,
            position,
            data,
          };
        } else {
          return;
        }
        setNodes((nodes) => nodes.concat(newNode));
        if (data.parentId) {
          // Add traveller edge
          let newEdge: Edge = {
            id: `edge-travel-${reactFlowInstance.getEdges().length}`,
            source: data.parentId,
            target: newNode.id,
            hidden: !travellerMode,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            type: 'floating',
          }
          setEdges((edges) => edges.concat(newEdge));
        }
      }
    },
    [reactFlowInstance]
  );

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedTopicNodes: TypeTopicNode[] = params.nodes
        .filter(node => node.type === 'topic' && node.selected);

      if (selectedTopicNodes.length === 0) {
        return;
      }

      console.log('topic', selectedTopicNodes);
      setSelectedTopics(selectedTopicNodes);
    },
    [reactFlowInstance]
  )

  const generateConceptNode = useCallback(
    () => {
      console.log('generating concept from ', selectedTopics);
      if (reactFlowInstance) createConceptNode(reactFlowInstance, selectedTopics);
    },
    [reactFlowInstance, selectedTopics]
  );

  /**
   * Toggles visibility of traveller edges to track progress
   */
  const toggleTravellerMode = useCallback(
    () => {
      setTravellerMode(!travellerMode);
      console.log(travellerMode);
      if (!reactFlowInstance) return;
      setEdges((edges) => edges.map(edge => {
        // if edge is traveller, toggle hidden
        if (edge.id.includes('edge-travel')) {
          edge.hidden = travellerMode;
        }
        return edge;
      }));
    },
    [reactFlowInstance, travellerMode]
  ) 

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
            connectionLineComponent={FloatingConnectionLine}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            // onSelectionEnd={onSelectTopicNodes}
            // onSelectionContextMenu={onSelectTopicNodes}
            panOnScroll={true}
            panOnDrag={false}
            minZoom={0.3}
            maxZoom={3}
          >
            <Background />
          </ReactFlow>
          {selectedTopics.length > 0 ? 
            <GenerateConceptButton
              generateConceptNode={generateConceptNode}
            /> : <></>
          }
          <NodeToolkit 
            travellerMode={travellerMode}
            toggleTravellerMode={toggleTravellerMode}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ExploreFlow;
