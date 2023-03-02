import { useCallback, useEffect, useRef, useState, createContext } from "react";
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
  SelectionMode,
  NodeDragHandler,
  ReactFlowJsonObject,
} from "reactflow";
import { getTopics } from "../api/openai-api";

import "reactflow/dist/style.css";
import "@reactflow/node-resizer/dist/style.css";
import "./flow.scss";

// Components
import GenerateConceptButton from "./components/button-generate-concept/button-generate-concept";
import NodeToolkit from "./components/node-toolkit/node-toolkit";
import SelectedTopicsToolbar from "./components/selected-topics-toolbar/selected-topics-toolbar";
import TravellerConnectionLine from "./edges/traveller-edge/traveller-connection";

// Nodes
import ChatNode from "./nodes/chat-node/chat-node";
import { ChatNodeData, TypeChatNode } from './nodes/chat-node/chat-node.model';
import ConceptNode from "./nodes/concept-node/concept-node";
import { createConceptNode } from "./nodes/concept-node/concept-node.helper";
import { TypeConceptNode } from "./nodes/concept-node/concept-node.model";
import MemoNode from "./nodes/memo-node/memo-node";
import { TypeMemoNode } from "./nodes/memo-node/memo-node.model";
import { CreativeNode } from "./nodes/node.model";
import TopicNode from "./nodes/topic-node/topic-node";
import {
  TopicNodeData,
  TypeTopicNode,
} from "./nodes/topic-node/topic-node.model";
import useLayout from "./hooks/useLayout";
import useAutoLayout, { Direction } from "./hooks/useAutoLayout";
import SubTopicNode from "./nodes/concept-node/subtopic-node/subtopic-node";
import { TypeSubTopicNode } from "./nodes/concept-node/subtopic-node/subtopic-node.model";
import SupTopicNode from "./nodes/concept-node/suptopic-node/suptopic-node";
import { TypeSupTopicNode } from "./nodes/concept-node/suptopic-node/suptopic-node.model";
import WorkflowNode from "./nodes/workflow-node/WorkflowNode";
import PlaceholderNode from "./nodes/workflow-node/PlaceholderNode";
import BrainstormNode from "./nodes/brainstorm-node/brainstorm-node";
import { TypeBrainstormNode } from "./nodes/brainstorm-node/brainstorm-node.model";
import GroupNode from "./nodes/group-node/group-node";
import edgeTypes from "./edges";
import {
  getNodePositionInsideParent,
  sortNodes,
} from "./nodes/group-node/group-node.helper";
import QuestionNode from "./nodes/brainstorm-node/question-node";
import {
  QuestionNodeData,
  TypeQuestionNode,
} from "./nodes/brainstorm-node/question-node.model";

import { devFlags, uuid } from "./utils";
import {
  Instance,
  InstanceMap,
  InstanceState,
  semanticDiveIn,
  semanticDiveOut,
} from "./triggers/semantic-dive";
import SemanticRoute from "./components/semantic-route/semantic-route";
// import { FlowContext } from './FlowContext';
import { FlowContext } from "./flow.model";
import { stratify, tree } from "d3-hierarchy";
import { useLocalStorage } from "./hooks/useLocalStorage";
import ZoomSlider from "./components/zoom-slider/zoom-slider";
import { FlexNodeData } from "./nodes/flex-node/flex-node.model";
import FlexNode from "./nodes/flex-node/flex-node";

const verbose: boolean = true;

const nodeColor = (node: Node) => {
  switch (node.type) {
    case "brainstorm":
      // return '#4193F5';
      return "#6ede87";
    case "chat":
      return "#FF4500";
    case "concept":
      return "#0984e326";
    case "topic":
      return "#6865A5";
    case "subtopic":
      return "#6865A5";
    case "suptopic":
      return "#6865A5";
    case "memo":
      return "#FFFF00";
    default:
      return "#ff0072";
  }
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

const proOptions = { account: "paid-pro", hideAttribution: true };

const panOnDrag = [1, 2];

const nodeTypes: NodeTypes = {
  brainstorm: BrainstormNode,
  chat: ChatNode,
  topic: TopicNode,
  subtopic: SubTopicNode,
  suptopic: SupTopicNode,
  concept: ConceptNode,
  memo: MemoNode,
  flex: FlexNode,
  workflow: WorkflowNode,
  placeholder: PlaceholderNode,
  group: GroupNode,
};

export const zoomRange = { min: 0.3, max: 3 };

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<TypeTopicNode[]>([]);
  const [travellerMode, setTravellerMode] = useState(true);
  const connectingNodeId = useRef("");

  const [numOfConceptNodes, setNumOfConceptNodes] = useState(0);
  const [conceptNodes, setConceptNodes] = useState([]);
  const [conceptEdges, setConceptEdges] = useState([]);

  const zoomSelector = (s: any) => s.transform[2];
  const zoom: number = useStore(zoomSelector);
  const [nodeMouseOver, setNodeMouseOver] = useState<Node | null>(null);

  const homeTopicNode: TypeTopicNode = {
    id: "topic-home",
    type: "topic",
    dragHandle: ".drag-handle",
    data: {
      parentId: "",
      chatReference: "",
      instanceState: InstanceState.NONE, // To temporarily disable dive out of home
      state: {
        topic: "home",
      },
    } as TopicNodeData,
    position: { x: 0, y: 0 },
  };

  // Topic Node Id of the current instance
  const [currentTopicId, setCurrentTopicId] = useLocalStorage<string>(
    "currentTopicId",
    homeTopicNode.id
  );

  // Maps topicNodeId to Instance
  const [instanceMap, setInstanceMap] = useLocalStorage<InstanceMap>(
    "instanceMap",
    {
      [currentTopicId]: {
        name: "home",
        parentId: "",
        childrenId: [] as string[],
        topicNode: homeTopicNode,
        jsonObject: {
          nodes: [] as Node[],
          edges: [] as Edge[],
        },
        level: 0,
      } as Instance,
    }
  );

  const [semanticRoute, setSemanticRoute] = useLocalStorage("semanticRoute", [
    "home",
  ]);

  // Updates the current instance of reactflow
  useEffect(() => {
    if (devFlags.disableLocalStorage) {
      return;
    }
    const currInstance = instanceMap[currentTopicId];
    if (currInstance && reactFlowInstance) {
      currInstance.jsonObject = {
        nodes: nodes,
        edges: edges,
      };
      instanceMap[currentTopicId] = currInstance;
      localStorage.setItem("instanceMap", JSON.stringify(instanceMap));
      setInstanceMap(instanceMap);
    }
  }, [instanceMap, nodes, edges]);

  // On first load, recover nodes from localstorage
  useEffect(() => {
    if (devFlags.disableLocalStorage) {
      return;
    }
    const recoveredInstanceMap = JSON.parse(
      localStorage.getItem("instanceMap") ?? ""
    );
    const currentInstance = recoveredInstanceMap[currentTopicId];
    if (currentInstance && reactFlowInstance) {
      reactFlowInstance.setNodes(currentInstance.jsonObject.nodes);
      reactFlowInstance.setEdges(currentInstance.jsonObject.edges);
    }
  }, [reactFlowInstance]);

  // show minimap only when there is more than one node
  // showing minimap when there is no node or only one node is perceived as clutter (NOTE: user feedback)
  useEffect(() => {
    // console.log('getRectOfNodes',getRectOfNodes(nodes));
    if (nodes.length < 2) {
      // document.getElementsByClassName('minimap')[0].style.visibility = 'hidden';
      const minimap = document.getElementsByClassName(
        "minimap"
      )[0] as HTMLElement;
      minimap.style.visibility = "hidden";
    } else {
      const minimap = document.getElementsByClassName(
        "minimap"
      )[0] as HTMLElement;
      minimap.style.visibility = "visible";
    }
  }, [nodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      reactFlowInstance?.setEdges((els) => addEdge(params, els)),
    [reactFlowInstance]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  // this drops node containing extended topic at location where dragging from handle stops
  // currently disabled, however, to switch to interaction where users can simply click on handle to create extended topic
  // extended topic is intelligently placed at right location (so that users do not have to manually do this)
  const onConnectEnd = useCallback(
    async (event: any) => {
      console.log("event", event);
      console.log("event.target", event.target);
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
        const id = "generated-topic-" + uuid();
        console.log(id);
        const newNode: any = {
          id,
          position,
          // data: { label: `Node ${id}` },
          data: { label: topics[Math.floor((Math.random() * 10) % 5)] },
        };

        const newEdge: Edge = {
          id: `edge-${uuid()}`,
          source: connectingNodeId.current,
          sourceHandle: "c",
          target: newNode.id,
          data: {},
        };

        reactFlowInstance.setNodes((nds) => nds.concat(newNode));
        reactFlowInstance.setEdges((eds) => eds.concat(newEdge));
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
        // Type of node denoted in id
        const newNode: CreativeNode = {
          id: `${type}-${uuid()}`,
          dragHandle: ".drag-handle",
          type,
          position,
          data,
        };
        reactFlowInstance.setNodes((nodes) => nodes.concat(newNode));
        if (data.parentId) {
          // Add traveller edge
          let newEdge: Edge = {
            id: `edge-travel-${uuid()}`,
            source: data.parentId,
            target: newNode.id,
            data: {},
            hidden: !travellerMode,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
              color: "#3facff",
            },
            type: "traveller",
          };
          reactFlowInstance.setEdges((edges) => edges.concat(newEdge));
        }
      }
    },
    [reactFlowInstance, travellerMode]
  );

  const onNodeDrag = useCallback(
    (_: any, node: Node) => {
      if (node.type !== "node" && !node.parentNode) {
        return;
      }

      if (reactFlowInstance) {
        const intersections = reactFlowInstance
          .getIntersectingNodes(node)
          .filter((n) => n.type === "group");
        const groupClassName =
          intersections.length && node.parentNode !== intersections[0]?.id
            ? "active"
            : "";

        reactFlowInstance.setNodes((nds) => {
          return nds.map((n) => {
            if (n.type === "group") {
              return {
                ...n,
                className: groupClassName,
              };
            } else if (n.id === node.id) {
              return {
                ...n,
                position: node.position,
              };
            }

            return { ...n };
          });
        });
      }
    },
    [reactFlowInstance]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      if (node.type !== "node") {
        return;
      }

      if (reactFlowInstance) {
        const intersections = reactFlowInstance
          .getIntersectingNodes(node)
          .filter((n) => n.type === "group");
        const groupNode = intersections[0];

        // when there is an intersection on drag stop, we want to attach the node to its new parent
        if (intersections.length && node.parentNode !== groupNode?.id) {
          const nextNodes: Node[] = reactFlowInstance
            .getNodes()
            .filter((node): node is Node => !!node)
            .map((n) => {
              if (n.id === groupNode.id) {
                return {
                  ...n,
                  className: "",
                };
              } else if (n.id === node.id) {
                const position = getNodePositionInsideParent(n, groupNode);
                if (position) {
                  return {
                    ...n,
                    position,
                    parentNode: groupNode.id,
                    extent: "parent" as "parent",
                  };
                }
              }

              return n;
            })
            .sort(sortNodes);

          reactFlowInstance.setNodes(nextNodes);
        }
      }
    },
    [reactFlowInstance]
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
  const toggleTravellerMode = useCallback(() => {
    setTravellerMode(!travellerMode);
    console.log(travellerMode);
    if (reactFlowInstance) {
      console.log(reactFlowInstance.getEdges());
      reactFlowInstance.setEdges((edges) =>
        edges.map((edge) => {
          // if edge is traveller, toggle hidden
          if (edge.id.includes("edge-travel")) {
            edge.hidden = travellerMode;
          }
          return edge;
        })
      );
    }
  }, [reactFlowInstance, travellerMode]);
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
  const generateConceptNode = useCallback(
    (selectedTopicIds: string[]) => {
      if (reactFlowInstance) {
        const topicNodes: TypeTopicNode[] = selectedTopicIds
          .map((topicId) => reactFlowInstance.getNode(topicId))
          .filter((node): node is TypeTopicNode => !!node);
        createConceptNode(reactFlowInstance, topicNodes, travellerMode);
      }
    },
    [reactFlowInstance]
  );

  useEffect(() => {
    // console.log('dsfa')
    if (
      nodeMouseOver &&
      nodeMouseOver.type === "topic" &&
      nodeMouseOver.id !== currentTopicId &&
      reactFlowInstance &&
      zoom >= zoomRange.max
    ) {
      // console.log('in')
      semanticDiveIn(
        nodeMouseOver,
        [instanceMap, setInstanceMap],
        [currentTopicId, setCurrentTopicId],
        [semanticRoute, setSemanticRoute],
        reactFlowInstance
      );
    } else if (reactFlowInstance && zoom <= zoomRange.min) {
      semanticDiveOut(
        [instanceMap, setInstanceMap],
        [currentTopicId, setCurrentTopicId],
        [semanticRoute, setSemanticRoute],
        reactFlowInstance
      );
    }
  }, [
    zoom,
    reactFlowInstance,
    nodeMouseOver,
    currentTopicId,
    instanceMap,
    semanticRoute,
  ]);

  // add flex node when user double clicks on canvas
  const onPaneClick = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      if (evt.detail === 1) { // single click
        // it was a double click
        return;
      } else if (evt.detail === 2) { // double click
        // 👇 make adding nodes undoable

        const position: XYPosition = reactFlowInstance!.project({
          // x: evt.clientX + (525 / 2),
          x: evt.clientX,
          y: evt.clientY,
        });

        const data: FlexNodeData = {
          // We want chat node to have no response yet, since the user will ask for a response
          placeholder: 'Ask a follow up question',
          state: {},
        };

        reactFlowInstance!.addNodes([
          {
            id: `chat-${uuid()}`,
            type: 'flex',
            dragHandle: '.drag-handle',
            position,
            data,
          },
        ]);
      }
    },
    [reactFlowInstance]
  );

  return (
    <FlowContext.Provider
      value={{
        numOfConceptNodes,
        setNumOfConceptNodes,
        conceptNodes,
        setConceptNodes,
        conceptEdges,
        setConceptEdges,
      }}
    >
      <div className="explore-flow">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          {/* <button onClick={semanticDive}>Semantic Dive</button> */}

          <ReactFlow
            proOptions={proOptions}
            nodes={nodes}
            edges={edges}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineComponent={TravellerConnectionLine}
            // fitViewOptions={fitViewOptions}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onNodeMouseEnter={(_, node) => setNodeMouseOver(node)}
            onNodeMouseLeave={() => setNodeMouseOver(null)}
            onDrop={onDrop}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onConnectStart={onConnectStart}
            // onConnectEnd={onConnectEnd} // if enabled, it generates sup- or sub- topics when user drags mouse out from handle
            onSelectionChange={onSelectionChange}
            // onSelectionEnd={onSelectTopicNodes}
            // onSelectionContextMenu={onSelectTopicNodes}
            panOnScroll
            selectionOnDrag
            panOnDrag={panOnDrag}
            selectionMode={SelectionMode.Partial}
            minZoom={zoomRange.min}
            maxZoom={zoomRange.max}
            // minZoom={-Infinity} // appropriate only if we constantly fit the view depending on the number of nodes on the canvas
            // maxZoom={Infinity} // otherwise, it might not be good to have this
          >
            <Background />
            <MiniMap
              nodeColor={nodeColor}
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="minimap"
            />
            <SelectedTopicsToolbar generateConceptNode={generateConceptNode} />
          </ReactFlow>

          <SemanticRoute route={semanticRoute} />
          {/* <div className="semantic-route">{semanticRoute.join(' / ')}</div> */}
          <NodeToolkit
            travellerMode={travellerMode}
            toggleTravellerMode={toggleTravellerMode}
          />
          <ZoomSlider zoom={zoom} range={zoomRange} />
        </div>
      </div>
    </FlowContext.Provider>
  );
};

export default ExploreFlow;
