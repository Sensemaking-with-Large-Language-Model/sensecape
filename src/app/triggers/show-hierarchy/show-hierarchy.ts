import { Edge, ReactFlowInstance, XYPosition } from "reactflow";
import { TypeHierarchyNode } from "../../nodes/hierarchy-node/hierarchy-node.model";
import { uuid } from "../../utils";
import { InstanceMap } from "../semantic-dive/semantic-dive";

/**
 * Saves current instance
 * Prepares hierarchy structure in hierarchy instance
 */
export const showHierarchyView = (
  instanceMap: InstanceMap,
  reactFlowInstance: ReactFlowInstance
) => {
  // Idea: get every possible instance map that was generated
  // Convert it into children graph
  // Set Reactflowinstance to be those nodes and edges only


  const defaultPosition: XYPosition = { x: 0, y: 0 };
  const tempNodes: TypeHierarchyNode[] = [
    {
      id: uuid(),
      type: 'hierarchy',
      position: defaultPosition,
      data: {
        expanded: true,
      },
    },
    {
      id: uuid(),
      type: 'hierarchy',
      position: defaultPosition,
      data: {
        expanded: true,
      },
    },
    {
      id: uuid(),
      type: 'hierarchy',
      position: defaultPosition,
      data: {
        expanded: true,
      },
    },
  ];

  const tempEdges: Edge[] = [
    {
      id: uuid(),
      source: tempNodes[0].id,
      target: tempNodes[1].id,
    },
    {
      id: uuid(),
      source: tempNodes[0].id,
      target: tempNodes[2].id,
    },
  ];

  reactFlowInstance.setNodes(tempNodes);
  reactFlowInstance.setEdges(tempEdges);
}