import React, { CSSProperties, Dispatch, SetStateAction } from "react";
import { getRectOfNodes, Node, ReactFlowInstance, Rect } from "reactflow";
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
  focusNodeIds: string[],
  style: CSSProperties,
  repelOtherNodes?: boolean,
) => {
  const sourceRect: Rect = getRectOfNodes(
    focusNodeIds.map(nodeId => reactFlowInstance.getNode(nodeId)) as Node[]
  );
  setTimeout(() => {
    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (!focusNodeIds.includes(node.id)) {
        if (repelOtherNodes) {
          const {x, y} = getRepelDirection(sourceRect, node);
          console.log(x, y);
          node.style = {
            ...style,
            translate: `${x*300}px ${y*300}px`
          };
        } else {
          node.style = style;
        }
      }
      return node;
    }));
    reactFlowInstance.setEdges(edges => edges.map(edge => {
      console.log(edge);
      edge.style = style;
      return edge;
    }));
  });
}

export const getRepelDirection = (sourceRect: Rect, targetNode: Node) => {
  const xDiff = targetNode.position.x - sourceRect.x;
  const yDiff = targetNode.position.y - sourceRect.y;
  const mag = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  console.log()
  return {x: xDiff/mag, y: yDiff/mag};
}