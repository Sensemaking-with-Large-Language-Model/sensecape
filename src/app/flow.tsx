import { useCallback, useEffect, useRef, useState, createContext, useMemo } from "react";
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
  useKeyPress,
  Viewport,
} from "reactflow";
import { getChatGPTOverarchingTopic, getChatGPTResponse, getTopics } from "../api/openai-api";

import "reactflow/dist/style.css";
import '@reactflow/node-resizer/dist/style.css';
import { usePinch } from '@use-gesture/react'
import { PinchGesture } from '@use-gesture/vanilla'
import './flow.scss';

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
import { ConceptNodeData, TypeConceptNode } from "./nodes/concept-node/concept-node.model";
import MemoNode from "./nodes/memo-node/memo-node";
import { MemoNodeData, TypeMemoNode } from "./nodes/memo-node/memo-node.model";
import { CreativeNode, ZoomState } from "./nodes/node.model";
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

import { devFlags, projectTitle, uuid } from "./utils";
import {
  Instance,
  InstanceMap,
  InstanceState,
  NodeEdgeList,
  semanticDiveIn,
  semanticDiveOut,
  semanticDiveTo,
  totalTransitionTime,
} from "./triggers/semantic-dive/semantic-dive";
import SemanticRoute from "./components/semantic-route/semantic-route";
// import { FlowContext } from './FlowContext';
import { FlowContext } from "./flow.model";
import { stratify, tree } from "d3-hierarchy";
import { useLocalStorage } from "./hooks/useLocalStorage";
import ZoomSlider from "./components/zoom-slider/zoom-slider";
import { FlexNodeData } from "./nodes/flex-node/flex-node.model";
import FlexNode from "./nodes/flex-node/flex-node";
import { createTravellerEdge } from "./edges/traveller-edge/traveller-edge.helper";
import { usePrevious } from "./hooks/usePrevious";
import useAnimatedNodes from "./hooks/useAnimatedNodes";
import useExpandCollapse from './hooks/useExpandCollapse';
import { duplicateNode } from "./nodes/node.helper";
import { clearSemanticCarry, getInstanceName, SemanticRouteItem } from "./triggers/semantic-dive/semantic-dive.helper";
import { notification } from "antd";
import React from "react";
import HierarchyNode from "./nodes/hierarchy-node/hierarchy-node";
import { hideHierarchyViewTo, showHierarchyView } from "./triggers/hierarchy-view/hierarchy-view";
import { HierarchyNodeData, TypeHierarchyNode } from "./nodes/hierarchy-node/hierarchy-node.model";

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
    case "hierarchy":
      return "#3c6792";
    default:
      return "#ddd";
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
  hierarchy: HierarchyNode,
};

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

    const connectingNodeId = useRef("");
  const [selectedTopics, setSelectedTopics] = useState<TypeTopicNode[]>([]);

  const [travellerMode, setTravellerMode] = useState(true);
  const [showingHierarchy, setShowingHierarchy] = useState(false);
  const [showingRecommendations, setShowingRecommendations] = useState(true);

  const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(showingHierarchy, nodes, edges);
  const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes);

  const zoomSelector = (s: any) => s.transform[2];
  const zoom: number = useStore(zoomSelector);
  const prevZoom = usePrevious(zoom) ?? 0;
  const [zoomRange, setZoomRange] = useState({min: 0.3, max: 3});
  const [infiniteZoom, setInfiniteZoom] = useState(false);

  const [nodeMouseOver, setNodeMouseOver] = useState<Node | null>(null);

  const homeTopicNode: TypeTopicNode = {
    id: "topic-home",
    type: "topic",
    dragHandle: ".drag-handle",
    data: {
      parentId: "",
      chatHistory: [],
      instanceState: InstanceState.NONE, // To temporarily disable dive out of home
      state: {
        topic: projectTitle,
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
        name: projectTitle,
        parentId: "",
        topicNode: homeTopicNode,
        jsonObject: {
          nodes: [] as Node[],
          edges: [] as Edge[],
          viewport: {x: 0, y: 0, zoom: 1},
        },
        level: 0,
      } as Instance,
    }
  );

  const defaultRouteItem: SemanticRouteItem = {
    title: getInstanceName(instanceMap[currentTopicId]!),
    topicId: currentTopicId,
    level: 0,
  };

  const [semanticRoute, setSemanticRoute] = useLocalStorage<SemanticRouteItem[]>("semanticRoute", [defaultRouteItem]);

  const [loadingTopicPrediction, setLoadingTopicPrediction] = useState(false);
  const [predictedTopicName, setPredictedTopicName] = useLocalStorage<string>('predictedTopicName', '');

  // List of nodes and edges to carry into another semantic level
  const [semanticCarryList, setSemanticCarryList] = useState<NodeEdgeList>({
    nodes: [],
    edges: [],
  });

  const toggleHierarchyView = useCallback(() => {
    if (reactFlowInstance) {
      if (!showingHierarchy) {
        setShowingHierarchy(true);
        showHierarchyView(
          predictedTopicName,
          currentTopicId,
          [instanceMap, setInstanceMap],
          reactFlowInstance
        );
      } else {
        setShowingHierarchy(false);
        hideHierarchyViewTo(
          currentTopicId,
          instanceMap,
          [currentTopicId, setCurrentTopicId],
          [semanticRoute, setSemanticRoute],
          [semanticCarryList, setSemanticCarryList],
          reactFlowInstance
        );
      }
    }
  },
  [showingHierarchy, predictedTopicName, currentTopicId, instanceMap, reactFlowInstance]);

  // const toggleRecommendations = useCallback(() => {
  //   if (reactFlowInstance) {
  //     if (!showingRecommendations) {

  //     }
  //   }
  // })

  // Ask ChatGPT for the topic from the nodes in the canvas
  useEffect(() => {
    if (!predictedTopicName && !instanceMap[currentTopicId]?.parentId) {
      const extractedTexts = nodes.map(node => {
        if (node.type === 'chat') {
          if ((node.data as ChatNodeData).state.response) {
            return `${(node.data as ChatNodeData).state.input}: 
              ${node.data.state.response}`;
          } else {
            return node.data.state.input;
          }
        } else if (node.type === 'topic') {
          return (node.data as TopicNodeData).state.topic;
        } else if (node.type === 'memo') {
          return (node.data as MemoNodeData).state.memo;
        } else if (node.type === 'concept') {
          return (node.data as ConceptNodeData).state.concept;
        } else {
          return '';
        }
      });

      if (
        !loadingTopicPrediction &&
        extractedTexts.length >= 2 &&
        (!predictedTopicName || predictedTopicName === projectTitle)
      ) {
        getChatGPTOverarchingTopic(extractedTexts, setLoadingTopicPrediction).then(response => {
          setPredictedTopicName(response ?? '');
          instanceMap[currentTopicId].topicNode.data.state.topic = response;
          setInstanceMap(instanceMap);
          semanticRoute[0]!.title = response ?? semanticRoute[0]!.title;
          setSemanticRoute(semanticRoute);
        });
      }
    }
  }, [reactFlowInstance, nodes, instanceMap, semanticRoute, currentTopicId]);

  // Whether semantic dive can actually be triggered
  const [semanticDivable, setSemanticDivable] = useState(true);
  const altKeyPressed = useKeyPress('Alt');
  const escKeyPressed = useKeyPress('Escape');
  const travellerPressed = useKeyPress('t');
  const hierarchyPressed = useKeyPress('h');
  const recommendationsPressed = useKeyPress('r');

  useEffect(() => {
    if (travellerPressed) {
      toggleTravellerMode();
    }
  }, [travellerPressed]);

  useEffect(() => {
    if (hierarchyPressed) {
      toggleHierarchyView();
    }
  }, [hierarchyPressed]);

  // useEffect(() => {
  //   if (recommendationsPressed) {
  //     toggleRecommendations();
  //   }
  // }, [recommendationsPressed]);

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
        viewport: reactFlowInstance.getViewport(),
      };
      instanceMap[currentTopicId] = currInstance;
      localStorage.setItem("instanceMap", JSON.stringify(instanceMap));
      setInstanceMap(instanceMap);
    }
  }, [reactFlowInstance, instanceMap, nodes, edges]);

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

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("dragNodeType");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const data = JSON.parse(event.dataTransfer.getData("dragNodeData"));

      if (reactFlowInstance) {
        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        // Type of node denoted in id
        const nodeId = `${type}-${uuid()}`;
        const newNode: CreativeNode = {
          id: nodeId,
          dragHandle: ".drag-handle",
          type,
          position,
          data,
        };
        reactFlowInstance.setNodes((nodes) => nodes.concat(newNode));
        if (data.parentId) {
          // Add traveller edge
          const newEdge = createTravellerEdge(data.parentId, newNode.id, !travellerMode)
          reactFlowInstance.setEdges((edges) => edges.concat(newEdge));
        }
        setTimeout(() => {
          const currElement = document.querySelectorAll(`[data-id="${nodeId}"]`)[0];
          const inputElement = currElement.getElementsByClassName('text-input')[0] as HTMLInputElement;
          inputElement?.focus();
        }, 100);
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

      if (selectedTopicNodes.length > 0) {
        setSelectedTopics(selectedTopicNodes);
      }
      return;

    },
    [reactFlowInstance]
  );

  const notifySemanticDive = (message: string) => {
    notification.open({
      message,
      placement: 'bottom',
      duration: 2,
    });
  }

  const onNodeClick = useCallback((e: any) => {
    switch (e.detail) {
      case 1:
        return;
      case 2:
        if ( // Naviate to canvas from Hierarchy View
          nodeMouseOver &&
          nodeMouseOver.type === 'hierarchy' &&
          reactFlowInstance
        ) {
          setShowingHierarchy(false);
          hideHierarchyViewTo(
            (nodeMouseOver as TypeHierarchyNode).data.topicId,
            instanceMap,
            [currentTopicId, setCurrentTopicId],
            [semanticRoute, setSemanticRoute],
            [semanticCarryList, setSemanticCarryList],
            reactFlowInstance
          );
        } else if ( // Semantic Zoom by Double Click
          nodeMouseOver &&
          nodeMouseOver.type === 'topic' &&
          reactFlowInstance
        ) {
          if (nodeMouseOver.id !== currentTopicId) {
            semanticDiveIn(
              nodeMouseOver,
              [predictedTopicName, setPredictedTopicName],
              [infiniteZoom, setInfiniteZoom],
              [instanceMap, setInstanceMap],
              [currentTopicId, setCurrentTopicId],
              [semanticRoute, setSemanticRoute],
              [semanticCarryList, setSemanticCarryList],
              reactFlowInstance
            );
            notifySemanticDive('⬇️ Dive in');
          } else {
            semanticDiveOut(
              [predictedTopicName, setPredictedTopicName],
              [infiniteZoom, setInfiniteZoom],
              [instanceMap, setInstanceMap],
              [currentTopicId, setCurrentTopicId],
              [semanticRoute, setSemanticRoute],
              [semanticCarryList, setSemanticCarryList],
              reactFlowInstance
            );
            notifySemanticDive('⬆️ Dive out');
          }
        }
        break;
    }
  },
  [reactFlowInstance, nodeMouseOver, currentTopicId, instanceMap, semanticRoute, semanticCarryList, predictedTopicName]);

  // add flex node when user double clicks on canvas
  const onPaneClick = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      if (reactFlowInstance) {
        const position: XYPosition = reactFlowInstance!.project({
          x: evt.clientX,
          y: evt.clientY,
        });
  
        if (evt.detail === 1) { // Single click, drop semantic carry list if exists
          if (semanticCarryList.nodes.length > 0) {
            const groupRect = getRectOfNodes(semanticCarryList.nodes);
            const carriedNodes = semanticCarryList.nodes.map(node => {
              const duplicate = duplicateNode(node);
              duplicate.position.x += position.x - groupRect.x - groupRect.width/2;
              duplicate.position.y += position.y - groupRect.y - groupRect.height/2;
              return duplicate;
            });
            reactFlowInstance.addNodes(carriedNodes);

            reactFlowInstance.fitView({
              duration: 400,
              padding: 5,
              nodes: carriedNodes,
            });
          }
          clearSemanticCarry(setSemanticCarryList);
          return;
        } else if (evt.detail === 2) {
          if (showingHierarchy) {
            // Hierarchy view, doule click to create new hierarchy
            // const data: HierarchyNodeData {
            //   topicId: 
            // }
          } else {
            // Canvas, view, double click to create flex node
            const data: FlexNodeData = {
              // We want chat node to have no response yet, since the user will ask for a response
              placeholder: 'Ask ChatGPT',
              state: {},
            };
    
            const nodeId = `flex-${uuid()}`;
            reactFlowInstance.addNodes([
              {
                id: nodeId,
                type: 'flex',
                dragHandle: '.drag-handle',
                position,
                data,
              },
            ]);
            setTimeout(() => {
              const currElement = document.querySelectorAll(`[data-id="${nodeId}"]`)[0];
              const inputElement = currElement.getElementsByClassName('text-input')[0] as HTMLInputElement;
              inputElement.focus();
              const buttonElements = currElement.getElementsByClassName('flex-node-button');
              for (let i = 0; i < 4; i++) {
                buttonElements[i].addEventListener('mouseover', () => {
                })
              }
            }, 100);
          }
  
        }
      }
    },
    [reactFlowInstance, semanticCarryList]
  );

  // Semantic Dive to 
  const semanticDiveToInstance = useCallback((nextTopicId: string) => {
    if (reactFlowInstance) {
      semanticDiveTo(
        nextTopicId,
        [infiniteZoom, setInfiniteZoom],
        [instanceMap, setInstanceMap],
        [currentTopicId, setCurrentTopicId],
        [semanticRoute, setSemanticRoute],
        [semanticCarryList, setSemanticCarryList],
        reactFlowInstance,
      );
    }
  }, [reactFlowInstance, infiniteZoom, instanceMap, currentTopicId, semanticRoute, semanticCarryList])

  // Clears semantic carry list when esc key pressed
  useEffect(() => {
    if (escKeyPressed) {
      clearSemanticCarry(setSemanticCarryList);
    }
  }, [escKeyPressed]);

  // Toggle Semantic Dive Ready Mode
  useEffect(() => {
    if (reactFlowInstance && altKeyPressed && semanticDivable) {
      if (zoom > prevZoom && nodeMouseOver) {
        setSemanticDivable(false);
        setTimeout(() => setSemanticDivable(true), totalTransitionTime);
        semanticDiveIn(
          nodeMouseOver,
          [predictedTopicName, setPredictedTopicName],
          [infiniteZoom, setInfiniteZoom],
          [instanceMap, setInstanceMap],
          [currentTopicId, setCurrentTopicId],
          [semanticRoute, setSemanticRoute],
          [semanticCarryList, setSemanticCarryList],
          reactFlowInstance
        );
        notifySemanticDive('⬇️ Dive in');
      } else if (zoom < prevZoom) {
        // Disabled:  && (instanceMap[currentTopicId]?.level ?? -1) >= 0
        setSemanticDivable(false);
        setTimeout(() => setSemanticDivable(true), totalTransitionTime);
        semanticDiveOut(
          [predictedTopicName, setPredictedTopicName],
          [infiniteZoom, setInfiniteZoom],
          [instanceMap, setInstanceMap],
          [currentTopicId, setCurrentTopicId],
          [semanticRoute, setSemanticRoute],
          [semanticCarryList, setSemanticCarryList],
          reactFlowInstance
        );
        notifySemanticDive('⬆️ Dive out');
      }
    }
  }, [altKeyPressed, zoom, prevZoom, infiniteZoom, reactFlowInstance, nodeMouseOver,
      currentTopicId, instanceMap, semanticRoute, semanticCarryList, predictedTopicName]);

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
        }));
      }
    },
    [reactFlowInstance, travellerMode]
  ) 

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

  const resetCanvas = useCallback(() => {
    if (reactFlowInstance) {
      localStorage.clear();
      if (showingHierarchy) {
        hideHierarchyViewTo(
          currentTopicId,
          instanceMap,
          [currentTopicId, setCurrentTopicId],
          [semanticRoute, setSemanticRoute],
          [semanticCarryList, setSemanticCarryList],
          reactFlowInstance
        );
        setShowingHierarchy(false);
      }
      setCurrentTopicId(homeTopicNode.id);
      setInstanceMap(    {
        [homeTopicNode.id]: {
          name: projectTitle,
          parentId: "",
          topicNode: homeTopicNode,
          jsonObject: {
            nodes: [] as Node[],
            edges: [] as Edge[],
            viewport: {x: 0, y: 0, zoom: 1},
          },
          level: 0,
        } as Instance,
      })
      setSemanticRoute([defaultRouteItem]);
      reactFlowInstance.setNodes([]);
      reactFlowInstance.setEdges([]);
      reactFlowInstance.zoomTo(1, {
        duration: 400,
      });
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance, showingHierarchy, currentTopicId, instanceMap]);

  return (
    <div className="explore-flow">
      <div id="reactflow-wrapper" className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          id='reactFlowInstance'
          className={`flow ${showingHierarchy ? 'hierarchy-flow' : altKeyPressed ? 'semantic-carry-ready' : ''}`}
          proOptions={proOptions}
          nodes={showingHierarchy ? animatedNodes : nodes}
          edges={showingHierarchy ? visibleEdges : edges}
          fitView
          zoomOnPinch
          selectionOnDrag
          panOnDrag={panOnDrag}
          zoomOnDoubleClick={false}
          selectionMode={SelectionMode.Partial}
          multiSelectionKeyCode={'Shift'}
          nodeOrigin={[0.5, 0]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
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
          onDragOver={onDragOver}
          onConnectStart={onConnectStart}
          // onConnectEnd={onConnectEnd} // if enabled, it generates sup- or sub- topics when user drags mouse out from handle
          onSelectionChange={onSelectionChange}
          panOnScroll={!altKeyPressed}
          onPaneClick={onPaneClick}
          onNodesDelete={(event) => console.log(event)}
          maxZoom={infiniteZoom ? Infinity : zoomRange.max}
          minZoom={infiniteZoom ? -Infinity : zoomRange.min}
          elevateNodesOnSelect
        >
          <Background />
          <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable className="minimap"/>
        </ReactFlow>
        {
          !showingHierarchy ?
          <>
            <div id='semantic-carry-box'></div>
            <div style={{
              boxShadow: 'inset 0 0 50px #3c6792',
              position: 'absolute',
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              visibility: `${altKeyPressed ? 'visible' : 'hidden'}`,
              opacity: `${altKeyPressed ? 1 : 0}`,
              transition: 'ease 0.2s',
            }} />
            <SemanticRoute
              currentTopicId={currentTopicId}
              route={semanticRoute}
              semanticJumpTo={semanticDiveToInstance}
            />
            <SelectedTopicsToolbar generateConceptNode={generateConceptNode} />
            <ZoomSlider zoom={zoom} range={zoomRange} />
          </> : <></>
        }
        <NodeToolkit
          resetCanvas={resetCanvas}
          travellerMode={travellerMode}
          toggleTravellerMode={toggleTravellerMode}
          showingHierarchy={showingHierarchy}
          toggleHierarchyView={toggleHierarchyView}
        />
      </div>
    </div>
  );
};

export default ExploreFlow;
