import { uuid, zoomLimits } from "../../utils";
import { Node, ReactFlowInstance } from "reactflow";
import { totalTransitionTime } from "./semantic-dive";
import { styleNodesAndEdges } from "./semantic-dive.helper";

/**
 * Performs Semantic Dive In transition, but only the first part.
 * This function animates the current semantic level nodes transition out.
 * 
 * @param focusNode - Node to focus on during dive
 * @param reactFlowInstance
 */
export const animateDiveInTakeoff = (
  focusNode: Node,
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    reactFlowInstance.fitView({
      duration: totalTransitionTime/2,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min,
      nodes: [focusNode]
    });

    styleNodesAndEdges(reactFlowInstance, [focusNode.id], {
      transition: 'ease 1s',
      opacity: 0,
    })

    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (node.id === focusNode.id) {
        setTimeout(() => {
          node.style = {
            transition: 'cubic-bezier(0.48,0,0.26,1) 1s',
            opacity: 1,
            scale: 0.6,
          }
        }, totalTransitionTime/2);
      }
      return node;
    }))

    setTimeout(() => {
      reactFlowInstance.zoomTo(4, { duration: totalTransitionTime });
    }, totalTransitionTime/2 - 100);
  });
}

/**
 * Performes Semantic Dive In transition, landing in the lower level node
 * Animates the child semantic level nodes transition in
 * 
 * @param focusNode - Node to focus on during dive
 * @param reactFlowInstance 
 */
export const animateDiveInLanding = (
  focusNode: Node,
  reactFlowInstance: ReactFlowInstance,
) => {
  setTimeout(() => {
    reactFlowInstance.fitView({
      duration: 0,
      padding: 0,
      nodes: [focusNode]
    });
    reactFlowInstance.zoomTo(1.4);
    reactFlowInstance.zoomTo(2, { duration: totalTransitionTime/2 });

    reactFlowInstance.setNodes(nodes => nodes.map(node => {
      if (node.id === focusNode.id) {
        node.style = {
          transition: 'none',
          opacity: 1,
          scale: 1.4,
        }
        setTimeout(() => {
          node.style = {
            transition: 'cubic-bezier(0,0,0.40,1) 0.5s',
            scale: 1,
          }
        });
      }
      return node;
    }))

    const focusNodeElement = document.querySelector(`[data-id="${focusNode.id}"]`) as HTMLElement;
    focusNodeElement.classList.add('node-enter');
    focusNodeElement.classList.remove('node-focus');
    setTimeout(() => {
      focusNodeElement.classList.add('node-blur');
      focusNodeElement.classList.remove('node-enter');
    });

    styleNodesAndEdges(reactFlowInstance, [focusNode.id], {
      transition: 'opacity ease-in 0.5s',
      opacity: 1,
    });
  });
}

/**
 * Performs Semantic Dive Out, transition out to the higher semantic level
 * 
 * 
 * @param reactFlowInstance
 */
export const animateDiveOutTakeoff = (
  reactFlowInstance: ReactFlowInstance,
) => {
  // opacity: 0
  // Zoom out a little, 
  reactFlowInstance.zoomTo(0.8, { duration: totalTransitionTime });
  styleNodesAndEdges(reactFlowInstance, [], {
    transition: 'opacity ease-in 0.5s',
    opacity: 0,
  });
}

export const animateDiveOutLanding = (
  reactFlowInstance: ReactFlowInstance,
) => {
  // Make nodes opacity: 1
  // zoom out a little
  styleNodesAndEdges(reactFlowInstance, [], {
    transition: 'none',
    opacity: 0,
  });
  reactFlowInstance.zoomTo(3);
  reactFlowInstance.zoomTo(2, { duration: totalTransitionTime/2 });
  setTimeout(() => {
    styleNodesAndEdges(reactFlowInstance, [], {
      transition: 'opacity ease-in 0.5s',
      opacity: 1,
    });
  });
}

