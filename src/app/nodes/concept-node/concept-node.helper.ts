import React from "react";
import { Edge, MarkerType, ReactFlowInstance, XYPosition } from "reactflow";
import { uuid } from "../../utils";
import { TypeTopicNode } from "../topic-node/topic-node.model";
import { ConceptNodeData, TypeConceptNode, ExtendedConceptNodeData, TypeExtendedConceptNode } from "./concept-node.model";

export const createConceptNode = (reactFlowInstance: ReactFlowInstance, topicNodes: TypeTopicNode[], travellerMode: boolean) => {
  if (topicNodes.length === 0) {
    return;
  }
  setTimeout(() => {
    const y = Math.min(...topicNodes.map(node => node.position.y)) - 100;
    const xRange = topicNodes.map(node => node.position.x ?? 0);
    const x = (Math.min(...xRange) + Math.max(...xRange)) / 2;
    const position: XYPosition = {
      x,
      y,
    };
    const data: ConceptNodeData = {
      topicNodes,
      state: {},
      width: 150,
      height: 100,
    }
    const newNode: TypeConceptNode = {
      id: `chat-${uuid()}`,
      type: 'concept',
      position,
      width: 150,
      height: 100,
      data,
    }
    reactFlowInstance.addNodes(newNode);
    // Create traveller edges from topics to concept
    topicNodes.forEach(node => {
      node.data.conceptId = newNode.id;
      const newEdge: Edge = {
        id: `edge-travel-${uuid()}`,
        source: node.id,
        target: newNode.id,
        data: {},
        hidden: !travellerMode,
        animated: true,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: '#3ab2ee',
        },
        type: 'traveller',
      };
      reactFlowInstance.addEdges(newEdge);
    });
  }, 0);
}

export const updateConceptNode = (reactFlowInstance: ReactFlowInstance, id: string, data: string) => {
  setTimeout(() => {
    const nodeToUpdate = reactFlowInstance.getNode(id);
    
  }, 0);
}

export const createSubTopicNodes = (reactFlowInstance: ReactFlowInstance, parentNode: any, topics: any[]) => {
  let sourceHandleId = "";
  let targetHandleId = "";
  let newNodePosition: { x: number; y: number };
  let nodeType = "";
  let edgeLabel = "";
  let pos = "bottom";
  let prompt = "";
  let conceptnode = true;

  if (pos === "top") {
    sourceHandleId = "a";
    targetHandleId = "b";
    // edgeLabel = "upper-level topic";
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
    sourceHandleId = "b";
    targetHandleId = "a";
    // edgeLabel = "lower-level topic";
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
    sourceHandleId = "c";
    targetHandleId = "d";
    newNodePosition = {
      x: parentNode.position.x - 150,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  } else if (pos === "right") {
    sourceHandleId = "d";
    targetHandleId = "c";
    newNodePosition = {
      x: parentNode.position.x + 250,
      y: parentNode.position.y,
    };
    nodeType = "related-topic";
  }

    let childNodeArray = [];
    let childEdgeArray = [];

    for (const topic of topics) {
      // create a unique id for the child node
      const childNodeId = uuid();

      // create the child node
      const childNode = {
        id: childNodeId,
        parentNode: parentNode.id,
        // we try to place the child node close to the calculated position from the layout algorithm
        // 150 pixels below the parent node, this spacing can be adjusted in the useLayout hook
        position: newNodePosition!,
        type: "subtopic",
        width: 150,
        height: 50,
        // type: nodeType,
        // data: { label: randomLabel() },
        data: { label: topic,
          rootId: parentNode.data.rootId? parentNode.data.rootId: parentNode.id,
        },
      };

      const childEdge = {
        id: `${parentNode.id}=>${childNodeId}`,
        source: parentNode.id,
        target: childNodeId,
        // label: edgeLabel,
        // sourceHandle: sourceHandleId,
        // targetHandle: targetHandleId,
        // type: "default",
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        pathOptions: { offset: 5 },
        data: {
          rootId: parentNode.data.rootId? parentNode.data.rootId: parentNode.id,
        }
      };

      childNodeArray.push(childNode);
      childEdgeArray.push(childEdge);
    }

    return [childNodeArray, childEdgeArray];
}