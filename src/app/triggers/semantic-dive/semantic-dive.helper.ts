import { CSSProperties, Dispatch, SetStateAction } from "react";
import { ReactFlowInstance } from "reactflow";
import { NodeEdgeList } from "./semantic-dive";

export const prepareDive = (
  reactFlowInstance: ReactFlowInstance,
  [semanticCarryList, setSemanticCarryList]: [NodeEdgeList, Dispatch<SetStateAction<NodeEdgeList>>],
  diveInstanceId?: string,
) => {
  const nodesToCarry = reactFlowInstance.getNodes().filter(node => node.selected && node.id !== diveInstanceId);

  // Save selected nodes & edges for semantic dives
  setSemanticCarryList({
    nodes: nodesToCarry,
    edges: reactFlowInstance.getEdges().filter(edge => edge.selected),
  });

  console.log('nod', nodesToCarry);

  // Node Elements cloned to create the capture of carry nodes
  const nodeElements = (nodesToCarry
    .map(node => document.querySelector(`[data-id="${node.id}"]`))
    .filter(nodeElement => nodeElement) as HTMLElement[])
    .map(nodeElement => nodeElement.firstChild!.cloneNode(true));

  const carryCapture = document.createElement('div');

  carryCapture.append(...nodeElements);

  carryCapture.style.pointerEvents = 'none';
  carryCapture.style.scale = '0.2';
  carryCapture.style.opacity = '0.7';
  carryCapture.style.position = 'absolute';
  carryCapture.style.transition = 'scale ease 0.5s';

  setTimeout(() => {
    carryCapture.style.scale = '0.5';
  }, 1);

  console.log('capture', carryCapture, nodeElements);

  document.addEventListener('mousemove', (e) => {
    carryCapture.style.top = `${e.clientY - carryCapture.clientHeight/2}px`;
    carryCapture.style.left = `${e.clientX - carryCapture.clientWidth/2}px`;
  })

  const carryBox = document.getElementById('semantic-carry-box');
  carryBox?.appendChild(carryCapture);

  // Preprocessing of nodes before semantic dive
  reactFlowInstance.setNodes(nodes => nodes.map(node => {
    node.selected = false;
    return node;
  }));
}

export const styleNodesAndEdges = (
  reactFlowInstance: ReactFlowInstance,
  excludedNodeIds: string[],
  style: CSSProperties,
) => {
  setTimeout(() => {
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (!excludedNodeIds.includes(node.id)) {
        node.style = style;
      }
      return node;
    }));
    reactFlowInstance.setEdges(edges => edges.map(edge => {
      edge.style = style;
      return edge;
    }));
  });
}