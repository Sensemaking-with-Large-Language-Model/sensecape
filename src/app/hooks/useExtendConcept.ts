import { uuid } from "../utils";
import { useContext } from "react";
import { ReactFlowInstance, MarkerType } from "reactflow";
import { getTopics } from "../../api/openai-api";
import { ResponseState } from "../components/input.model";

const devMode: boolean = true;
const verbose: boolean = false;

const extendConcept = async (
  reactFlowInstance: ReactFlowInstance,
  id: string,
  pos: string,
  concept: string,
  conceptnode: boolean = true,
  setResponseState?: Function,
) => {
  const parentNode = reactFlowInstance.getNode(id);

  if (!parentNode) {
    return;
  }

  console.log('=====');
  console.log('concept', concept);
  console.log('=====');

  if (setResponseState) {
    setResponseState(ResponseState.LOADING);
  }
  let prompt = "";
  let sourceHandleId = "";
  let targetHandleId = "";
  let newNodePosition: { x: number; y: number };
  let nodeType = "";
  let edgeLabel = "";

  if (!parentNode) {
    return;
  }

  if (pos === "top") {
    prompt = "Give me 5 higher level topics of " + concept;
    sourceHandleId = "a";
    targetHandleId = "b";
    edgeLabel = "upper-level topic";
    if (conceptnode) {
      newNodePosition = {
        x: parentNode.position.x - 50,
        y: parentNode.position.y - 200,
      };
    } else {
      // if suptopic, create it above
      newNodePosition = {
        x: parentNode.position.x,
        y: parentNode.position.y - 200,
      };
    }
    nodeType = "suptopic";
  } else if (pos === "bottom") {
    prompt = "Give me 5 lower level topics of " + concept;
    sourceHandleId = "b";
    targetHandleId = "a";
    edgeLabel = "lower-level topic";
    if (conceptnode) {
      newNodePosition = {
        x: parentNode.position.x - 50,
        y: parentNode.position.y + 200,
      };
    } else {
      newNodePosition = {
        // if subtopic, create it below
        x: parentNode.position.x,
        y: parentNode.position.y + 200,
      };
    }
    nodeType = "subtopic";
  } else if (pos === "left") {
    prompt =
      "Give me 5 related topics of " +
      concept +
      " at this level of abstraction";
    sourceHandleId = "c";
    targetHandleId = "d";
    newNodePosition = {
      x: parentNode.position.x - 150,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  } else if (pos === "right") {
    prompt =
      "Give me 5 related topics of " +
      concept +
      " at this level of abstraction";
    sourceHandleId = "d";
    targetHandleId = "c";
    newNodePosition = {
      x: parentNode.position.x + 250,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  }

  let topics: string[] | any;
  if (devMode) {
    topics = [
      "Human Resources Management",
      "Financial Management",
      "Project Management",
      "Strategic Planning",
      "Risk Management",
      "Quality Management",
    ];
  } else {
    topics = await getTopics(concept);
  }

  // create a unique id for the child node
  const childNodeId = uuid();

  // const parentNodeLabel = parentNode.data['label'];
  if (verbose) {console.log('topics', topics)}

  // create the child node
  const childNode = {
    id: childNodeId,
    // we try to place the child node close to the calculated position from the layout algorithm
    // 150 pixels below the parent node, this spacing can be adjusted in the useLayout hook
    position: newNodePosition!,
    type: nodeType,
    // data: { label: randomLabel() },
    data: { label: topics[Math.floor((Math.random() * 10) % 5)] },
  };

  const childEdge = {
    id: `${parentNode.id}=>${childNodeId}`,
    source: parentNode.id,
    target: childNodeId,
    label: edgeLabel,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };

  reactFlowInstance.addNodes(childNode);
  reactFlowInstance.addEdges(childEdge);

  if (setResponseState) {
    setResponseState(ResponseState.COMPLETE);
  }

  return [childNode, childEdge];
};

export default extendConcept;
