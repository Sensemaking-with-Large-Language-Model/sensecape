import { useEffect, useState, useCallback, useContext } from "react";
import {
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  ReactFlowInstance,
  useReactFlow,
} from "reactflow";
import { getGPT3Term, getTopics } from "../../../api/openai-api";
import { ResponseState } from "../../components/input.model";
import { TypeTopicNode } from "../topic-node/topic-node.model";

import { ReactComponent as DragHandle } from "../../assets/drag-handle.svg";
import ConceptInput from "../../components/concept-input/concept-input";

import { uuid } from "../../utils";

import useNodeClick from "../../hooks/useNodeClick";

import "./concept-node.scss";

import { extendConcept } from "../../../api/openai-api";

// import { FlowContext } from "../../FlowContext"
import { FlowContext } from "../../flow.model";

import useLayout from "../../hooks/useLayout";
import { stratify, tree } from "d3-hierarchy";
import { SubTopicNodeData } from "./subtopic-node/subtopic-node.model";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

const verbose: boolean = true; // flag for console.log() messages during devMode
const use_dagre: boolean = false;

// import { dagre } from 'dagre';
const dagre = require("dagre");

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 150;
  const nodeHeight = 100;

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: Edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node: Node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // node.targetPosition = isHorizontal ? 'left' : 'top';
    // node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// ===========================

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([200, 150])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const options = { duration: 300 };

// the layouting function
// accepts current nodes and edges and returns the layouted nodes with their updated positions
function layoutNodes(rootNode: Node, nodes: Node[], edges: Edge[]): Node[] {
  // convert nodes and edges into a hierarchical object for using it with the layout function
  if (verbose) {
    console.log("===========");
    console.log("before running hierarchy");
    console.log("nodes", nodes);
    console.log("edges", edges);
  }
  const root_position = rootNode.position;
  console.log("rootNode", rootNode);
  console.log("root_position", root_position);

  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // get the id of each node by searching through the edges
    // this only works if every node has one connection
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes
  );
  console.log("hierarchy", hierarchy);

  // run the layout algorithm with the hierarchy data structure
  const root = layout(hierarchy);
  console.log("root", root);

  root.x = root_position["x"];
  root.y = root_position["y"];

  console.log("===========");
  // convert the hierarchy back to react flow nodes (the original node is stored as d.data)
  // we only extract the position from the d3 function
  return root
    .descendants()
    .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

// ===========================

// reference:
// add node on edge drop
// 1. https://reactflow.dev/docs/examples/nodes/add-node-on-edge-drop/
// auto layout (zoom in to specific node)
// 1. https://reactflow.dev/docs/examples/misc/use-react-flow-hook/

type ConceptNodeState = {
  input: string;
  subtopicIsLoading: boolean;
  suptopicIsLoading: boolean;
  lateralRightLoading: boolean;
  lateralLeftLoading: boolean;
  highLevelTopics: string[]; // bottom
  lowLevelTopics: string[]; // up
  lateralRightTopics: string[]; // right
  lateralLeftTopics: string[]; // left
  reactFlowInstance: ReactFlowInstance;
  placeholder: "Add a concept";
};

const ConceptNode = (props: NodeProps) => {
  const [responseSelfState, setResponseSelfState] = useState(
    props.data.state.responseSelfState ?? ResponseState.INPUT
  );
  const [responseInputState, setResponseInputState] = useState(
    props.data.state.responseInputState ?? ResponseState.INPUT
  );
  const [concept, setConcept] = useState(props.data.state.concept ?? "");
  const [input, setInput] = useState(props.data.state.input ?? "");
  // const [lowLevelTopics, setLowLevelTopics] = useState<string[]>([]);
  // const [highLevelTopics, setHighLevelTopics] = useState<string[]>([]);
  const [tree, setTree] = useState({});

  const reactFlowInstance = useReactFlow();

  let {
    numOfConceptNodes,
    setNumOfConceptNodes,
    setConceptNodes,
    conceptNodes,
  } = useContext(FlowContext);

  // useLayout();

  useEffect(() => {
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          node.data.state = {
            responseSelfState,
            responseInputState,
            concept,
            input,
          };
        }
        return node;
      })
    );
  }, [reactFlowInstance]);

  const generateConceptFromTopics = async (context: string, prompt: string) => {
    if (!prompt) return;

    setResponseSelfState(ResponseState.LOADING);

    const response =
      (await getGPT3Term(context, prompt)) || "Error: no response received";

    setConcept(response);
    setResponseSelfState(ResponseState.COMPLETE);
  };

  // When concept node renders, gpt3 is called
  useEffect(() => {
    if (!concept && props.data.topicNodes.length > 0) {
      // TODO: Too much duplicate strings. Make this a linear timeline
      const conceptContext = "";
      // const conceptContext = props.data.topicNodes.join('\n\n')
      const prompt = `${props.data.topicNodes
        .map((node: TypeTopicNode) => node.data.state.topic)
        .join(", ")}\n\n
        What is the overarching concept? (1-3 words)`;
      generateConceptFromTopics(conceptContext, prompt);
    }
  }, []);

  const calluseNodeClick = useNodeClick(props.id);

  // NOTE: To update context value with, e.g., `setNumOfConceptNodes` accessed with `useContext`,
  // the function needs to be `hook`. Using `useCallBack` does not update context value.. (ran into this bug)
  // cf: https://stackoverflow.com/questions/50502664/how-to-update-the-context-value-in-a-provider-from-the-consumer
  const handleSupTopicClick = () => {
    // const { childNode:any, childEdge:any } = extendConcept(reactFlowInstance, props.id, 'top', input)
    extendConcept(
      reactFlowInstance,
      props.id,
      "top",
      input,
      true,
      setResponseInputState
    );
    setNumOfConceptNodes(numOfConceptNodes + 1);
    // console.log(numOfConceptNodes);
    const direction = "TB";
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    // get nodes we want to rearrange
    const targetNodes = nodes.filter((node) => node.type === "subtopic");
    const targetEdges = edges.filter((edge) => edge.type === "smoothstep");
    // get new coordinates for nodes we want to rearrange
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      targetNodes,
      targetEdges,
      direction
    );
    if (verbose) {
      console.log("layoutedNodes", ...layoutedNodes);
      console.log("layoutedEdges", ...layoutedEdges);
    }

    // get other nodes that still need to be placed on canvas
    const otherNodes = nodes.filter((node) => node.type !== "subtopic");
    const otherEdges = edges.filter((edge) => edge.type !== "smoothstep");

    reactFlowInstance.setNodes([...layoutedNodes, ...otherNodes]);
    reactFlowInstance.setEdges([...layoutedEdges, ...otherEdges]);
  };

  const layout_ = async () => {
    setNumOfConceptNodes(numOfConceptNodes + 1);
    const direction = "TB";
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    const rootId_ = props.id;
    const rootNode = reactFlowInstance.getNode(rootId_);
    if (!rootNode) {
      return;
    }
    console.log("rootNode", rootNode);

    // get nodes we want to rearrange
    console.log("=========");
    // grab generated subtopics
    const targetNodes = nodes.filter((node) => node.data.rootId === rootId_);
    const targetEdges = edges.filter((edge) => edge.data.rootId === rootId_);
    console.log("targetConceptNode", targetNodes);
    console.log("targetConceptEdges", targetEdges);

    // get other nodes that still need to be placed on canvas
    const otherNodes = nodes.filter((node) => node.data.rootId !== rootId_);
    const otherEdges = edges.filter((edge) => edge.data.type !== rootId_);

    console.log("=========");

    if(use_dagre) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        targetNodes,
        targetEdges,
        direction
      );
      if (verbose) {
        console.log("layoutedNodes", ...layoutedNodes);
        console.log("layoutedEdges", ...layoutedEdges);
      }  
      reactFlowInstance.setNodes([...layoutedNodes, ...otherNodes]);
      reactFlowInstance.setEdges([...layoutedEdges, ...otherEdges]);
    } else {
      const targetNodes_ = layoutNodes(
        rootNode,
        [rootNode, ...targetNodes],
        targetEdges
      );
      console.log("targetNodes_", ...targetNodes_);
      await reactFlowInstance.setNodes([...targetNodes_, ...otherNodes]);
      await reactFlowInstance.setEdges([...targetEdges, ...otherEdges]);
    }
  };

  const handleSubmit = async () => {
    extendConcept(
      reactFlowInstance,
      props.id,
      "bottom",
      input,
      true,
      setResponseInputState
    ).then((data) => {
      console.log("data", data);
      setTimeout(layout_, 100);
    });
  };

  const handleSubTopicClick = async () => {
    extendConcept(
      reactFlowInstance,
      props.id,
      "bottom",
      input,
      true,
      setResponseInputState
    ).then((data) => {
      console.log("data", data);
      setTimeout(layout_, 100);
    });
  };

  if (responseSelfState === ResponseState.INPUT) {
    return (
      <div
        className={`node concept-node`}
        // onBlur={() => setResponseState(ResponseState.COMPLETE)}
      >
        {/* <Handle
          type="source"
          className={
            input !== ""
              ? "concept-node-handle handle-top visible"
              : "concept-node-handle handle-top hidden"
          }
          // className="concept-node-handle handle-top visible"
          position={Position.Top}
          // onClick={()=>extendConcept(reactFlowInstance, props.id, 'top', input)}
          onClick={handleSupTopicClick}
          id="a"
        /> */}
        <Handle
          type="source"
          className={
            input !== ""
              ? "concept-node-handle visible"
              : "concept-node-handle hidden"
          }
          position={Position.Bottom}
          onClick={handleSubTopicClick}
          id="b"
        />
        {/* target node for traveller edges */}
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
        />
        {/* <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          position={Position.Left}
          onClick={()=>extendConcept(props.id, 'left', input)}
          id="c"
        />
        <Handle
          type="source"
          className={input !== "" ? "concept-node-handle visible" : "concept-node-handle hidden"}
          position={Position.Right}
          onClick={()=>extendConcept(props.id, 'right', input)}
          id="d"
        /> */}
        <DragHandle className="drag-handle" />
        <ConceptInput
          responseState={responseInputState}
          placeholder={props.data.placeholder}
          setResponseInputState={setResponseInputState}
          id={props.id}
          handleSubmit={handleSubmit}
          input={input}
          setInput={setInput}
        />
      </div>
    );
  } else if (responseSelfState === ResponseState.LOADING) {
    return (
      <div className="concept-node">
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
        />
        Generating concept...
      </div>
    );
  } else {
    return (
      <div
        className="concept-node"
        onClick={() => setResponseSelfState(ResponseState.INPUT)}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="node-handle-direct"
        />
        {concept || "Enter concept"}
        <Handle
          type="source"
          className="concept-node-handle"
          position={Position.Bottom}
          onClick={handleSubTopicClick}
        />
      </div>
    );
  }
};

export default ConceptNode;
