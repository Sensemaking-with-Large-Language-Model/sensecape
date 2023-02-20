import { uuid } from "../utils";
import { useReactFlow, ReactFlowInstance } from "reactflow";
import { getTopics } from "../../api/openai-api";

const extendConcept = async (
  reactFlowInstance: ReactFlowInstance,
  id: string,
  pos: string,
  concept: string,
  mode: string = "dev"
) => {
  const parentNode = reactFlowInstance.getNode(id);

  if (!parentNode) {
    return;
  }

  let prompt = "";
  let sourceHandleId = "";
  let targetHandleId = "";
  let newNodePosition: { x: number; y: number };
  let nodeType = "";

  if (!parentNode) {
    return;
  }

  if (pos === "top") {
    prompt = "Give me 5 higher level topics of " + concept;
    sourceHandleId = "a";
    targetHandleId = "b";
    newNodePosition = {
      x: parentNode.position.x,
      y: parentNode.position.y - 150,
    };
    nodeType = "suptopic";
  } else if (pos === "bottom") {
    prompt = "Give me 5 lower level topics of " + concept;
    sourceHandleId = "b";
    targetHandleId = "a";
    newNodePosition = {
      x: parentNode.position.x,
      y: parentNode.position.y + 150,
    };
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
  console.log("prompt", prompt);
  if (mode === "dev") {
    topics = [
      "Human Resources Management",
      "Financial Management",
      "Project Management",
      "Strategic Planning",
      "Risk Management",
      "Quality Management",
    ];
  } else {
    topics = await getTopics(prompt, concept);
  }

  // create a unique id for the child node
  const childNodeId = uuid();

  // const parentNodeLabel = parentNode.data['label'];
  console.log("topics:", topics);

  // create the child node
  console.log("nodeType", nodeType);
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
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
    type: "placeholder",
  };

  reactFlowInstance.addNodes(childNode);
  reactFlowInstance.addEdges(childEdge);
};

export default extendConcept;