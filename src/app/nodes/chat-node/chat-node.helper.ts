import { Edge, ReactFlowInstance, XYPosition, getRectOfNodes } from "reactflow";
import { uuid } from "../../utils";
import { ChatNodeData, TypeChatNode } from "./chat-node.model";

export const createChatNode = (reactFlowInstance: ReactFlowInstance, sourceId: string, data: ChatNodeData) => {
  const currNode: TypeChatNode | undefined = reactFlowInstance.getNode(sourceId);
  if (!currNode) {
    return;
  }
  setTimeout(() => {
    const nodeElement = document.querySelectorAll(`[data-id="${sourceId}"]`)[0];
    let position: XYPosition;
    if (nodeElement) {
      const height = nodeElement.clientHeight;
      const width = nodeElement.clientWidth;
      position = {
        x: (width / 2) - (575 / 2),
        y: (height ?? 0) + 20,
      };
    } else {
      position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 100,
      }
    }
    const newNode: TypeChatNode = {
      id: `chat-${uuid()}`,
      type: 'chat',
      dragHandle: '.drag-handle',
      position,
      parentNode: sourceId,
      data,
    };
    const edge: Edge =  {
      id: `e-${uuid()}`,
      source: sourceId,
      target: newNode.id,
    }
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(edge);
    console.log(reactFlowInstance.getNodes());

    // change view to show next answer 
    // currently, it focuses on the entire view, might want to move to just recently created node 
    // need to use 'nodes' param in fitViewOptions, cf. https://reactflow.dev/docs/api/types/#fitviewsoptions
    // const query = 'div[data-id="' + newNode.id + '"]';
    // const rectOfNodes = getRectOfNodes([newNode]);
    // console.log(rectOfNodes);
    // let activeElement = document.querySelector(query)!.getElementsByClassName('text-input')[0];
    // (activeElement as HTMLElement)?.focus();
    // const fitViewOptions = { duration: 900, padding: 0.3, nodes: [{ id: newNode.id}] }
    // reactFlowInstance!.fitView(fitViewOptions);
    // console.log(reactFlowInstance!.getViewport());
    // const viewport = reactFlowInstance!.getViewport();

    // reactFlowInstance!.zoomOut( { duration: 1300 } );
    // setTimeout(() => {
      // reactFlowInstance!.setCenter(viewport.x, viewport.y + 150, { duration: 2000 });
      // reactFlowInstance!.fitView({ duration: 900, padding: 0.3 });
    // },5000);
  }, 0);
}