import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Node,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  NodeTypes,
  XYPosition,
  OnSelectionChangeParams,
  MarkerType,
  MiniMap,
  useStore,
  getRectOfNodes,
} from "reactflow";
import { getTopics } from "../api/openai-api";

import "reactflow/dist/style.css";
import GenerateConceptButton from "./components/button-generate-concept/button-generate-concept";
import NodeToolkit from "./components/node-toolkit/node-toolkit";
import FloatingConnectionLine from "./edges/traveller-edge/traveller-connection";
import FloatingEdge from "./edges/traveller-edge/traveller-edge";
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
import useLayout from "./hooks/useLayout";
import useAutoLayout, { Direction } from './hooks/useAutoLayout';
import SubTopicNode from "./nodes/concept-node/subtopic-node/subtopic-node";
import { TypeSubTopicNode } from "./nodes/concept-node/subtopic-node/subtopic-node.model";
import SupTopicNode from "./nodes/concept-node/suptopic-node/suptopic-node";
import { TypeSupTopicNode } from "./nodes/concept-node/suptopic-node/suptopic-node.model";
import WorkflowNode from "./nodes/workflow-node/WorkflowNode";
import PlaceholderNode from "./nodes/workflow-node/PlaceholderNode";
import BrainstormNode from "./nodes/brainstorm-node/brainstorm-node";
import { TypeBrainstormNode } from "./nodes/brainstorm-node/brainstorm-node.model";
import edgeTypes from "./edges";

const nodeColor = (node:Node) => {
  switch (node.type) {
    case 'brainstorm':
      return '#FF4500';
    case 'chat':
      return '#FF4500';
    case 'concept':
      return '#6ede87';
    case 'topic':
      return '#6865A5';
    case 'subtopic':
      return '#6865A5';
    case 'suptopic':
      return '#6865A5';
    case 'memo':
        return '#FFFF00';
    default:
      return '#ff0072';
  }
};

const initialNodes: Node[] = [
  // {
  //   id: "chat-0",
  //   type: "chat",
  //   dragHandle: '.drag-handle',
  //   data: {
  //     parentChatId: '',
  //     chatReference: '',
  //     placeholder: 'Ask GPT-3'
  //   },
  //   position: { x: 250, y: 200 }
  // }
];

const initialEdges: Edge[] = [];

// const initialNodes: Node[] = [
//   {
//     id: '1',
//     data: { label: 'Human Computer Interaction' },
//     position: { x: 0, y: 0 },
//     type: 'workflow',
//   },
//   {
//     id: '2',
//     data: { label: '+' },
//     position: { x: 0, y: 150 },
//     type: 'placeholder',
//   },
// ];

// // initial setup: connect the workflow node to the placeholder node with a placeholder edge
// const initialEdges: Edge[] = [
//   {
//     id: '1=>2',
//     source: '1',
//     target: '2',
//     type: 'placeholder',
//   },
// ];

const proOptions = { account: "paid-pro", hideAttribution: true };

const fitViewOptions = {
  padding: 0.75,
};

const nodeTypes: NodeTypes = {
  brainstorm: BrainstormNode,
  chat: ChatNode,
  topic: TopicNode,
  subtopic: SubTopicNode,
  suptopic: SupTopicNode,
  concept: ConceptNode,
  memo: MemoNode,
  workflow: WorkflowNode,
  placeholder: PlaceholderNode,
};

let id = 0;
const getId = () => `${id++}`;

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<TypeTopicNode[]>([]);
  const [travellerMode, setTravellerMode] = useState(false);
  const connectingNodeId = useRef("");

  // useLayout();
  // useEffect(() => {
  //   console.log('getRectOfNodes',getRectOfNodes(nodes));
  // }, [nodes])

  // const { fitView } = useReactFlow();

  // every time our nodes change, we want to center the graph again
  // but commented out because it seems to disable node selection and dragging of nodes
  // it might not be ideal to recenter the graph every time nodes are moved
  // useEffect(() => {
    // reactFlowInstance!.fitView({ duration: 400 });
  // }, [nodes]);

  // const onNodesChange = () => {
  //   reactFlowInstance!.fitView({ duration: 900, padding: 0.4 });
  // }

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    // console.log('onConnectStart');
    connectingNodeId.current = nodeId;
  }, []);

  // this drops node containing extended topic at location where dragging from handle stops
  // currently disabled, however, to switch to interaction where users can simply click on handle to create extended topic
  // extended topic is intelligently placed at right location (so that users do not have to manually do this)
  const onConnectEnd = useCallback(
    async (event: any) => {
      console.log('event', event);
      console.log('event.target', event.target);
      // console.log('onConnectEnd');
      // get bounding box to find exact location of cursor
      const reactFlowBounds = 
        reactFlowWrapper?.current?.getBoundingClientRect();
        

      if (reactFlowInstance) {
        // select concept node & get text box input value
        const nodeElement: any = document.querySelectorAll(
          `[data-id="${connectingNodeId.current}"]`
        )[0];
        const currentValue: any =
          nodeElement.getElementsByClassName("text-input")[0].value;

        // get (sub-, sup-, related-) topics from GPT
        const topics: any = await generateTopic("bottom", currentValue);

        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const id = "generated-topic-" + getId();
        console.log(id);
        const newNode: any = {
          id,
          position,
          // data: { label: `Node ${id}` },
          data: { label: topics[Math.floor((Math.random() * 10) % 5)] },
        };

        const newEdge: Edge = {
          id: `edge-${reactFlowInstance.getEdges().length}`,
          source: connectingNodeId.current,
          sourceHandle: "c",
          target: newNode.id,
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
      }
    },
    [reactFlowInstance]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const reactFlowBounds =
        reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("dragNodeType");
      const data = JSON.parse(event.dataTransfer.getData("dragNodeData"));

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      if (reactFlowInstance) {
        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        let newNode: CreativeNode;
        if (type === "chat" || type === "topic") {
          newNode = {
            id: getId(),
            dragHandle: ".drag-handle",
            type,
            position,
            data,
          };
        } else if (type === "concept") {
          newNode = {
            id: "conccept-" + getId(),
            dragHandle: ".drag-handle",
            type,
            position,
            data,
          };
        } else if (type === "memo") {
          newNode = {
            id: "memo-" + getId(),
            dragHandle: ".drag-handle",
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
              width: 20,
              height: 20,
              color: '#3ab2ee',
            },
            type: 'traveller',
          }
          setEdges((edges) => edges.concat(newEdge));
        }
      }
    },
    [reactFlowInstance, travellerMode]
  );

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedTopicNodes: TypeTopicNode[] = params.nodes.filter(
        (node) => node.type === "topic" && node.selected
      );

      if (selectedTopicNodes.length === 0) {
        return;
      }

      console.log("topic", selectedTopicNodes);
      setSelectedTopics(selectedTopicNodes);
    },
    [reactFlowInstance]
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
  // this function is used for generating sub- or sup- topics 
  // specifically, it determines prompt based on which handle is clicked
  // and then it calls another function getTopics() to receive and return generated sub- or sup- topics
  const generateTopic = (pos: string, concept: string) => {
    let prompt = "";
    if (pos === "top") {
      prompt = "Give me 5 higher level topics of " + concept;
    } else if (pos === "bottom") {
      prompt = "Give me 5 lower level topics of " + concept;
    } else if (pos === "right" || pos === "left") {
      prompt =
        "Give me 5 related topics of " +
        concept +
        " at this level of abstraction";
    }
    const topics = getTopics(prompt, concept);

    return topics;
  };

  // this function is called when generate concept button is clicked
  const generateConceptNode = useCallback(() => {
    console.log("generating concept from ", selectedTopics);
    if (reactFlowInstance) createConceptNode(reactFlowInstance, selectedTopics);
  }, [reactFlowInstance, selectedTopics]);

  return (
    <div className="explore-flow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            proOptions={proOptions}
            nodes={nodes}
            edges={edges}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineComponent={FloatingConnectionLine}
            // fitViewOptions={fitViewOptions}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onConnectStart={onConnectStart}
            // onConnectEnd={onConnectEnd} // if enabled, it generates sup- or sub- topics when user drags mouse out from handle
            onSelectionChange={onSelectionChange}
            // onSelectionEnd={onSelectTopicNodes}
            // onSelectionContextMenu={onSelectTopicNodes}
            panOnScroll={true}
            panOnDrag={false}
            minZoom={0.3}
            maxZoom={3}
            // minZoom={-Infinity} // appropriate only if we constantly fit the view depending on the number of nodes on the canvas
            // maxZoom={Infinity} // otherwise, it might not be good to have this 
          >
            <Background />
            <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
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
