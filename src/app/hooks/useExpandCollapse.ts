import { useMemo } from 'react';
import { Node, Edge, XYPosition } from 'reactflow';
import { HierarchyNode, HierarchyPointNode, stratify, tree } from 'd3-hierarchy';
import { TypeHierarchyNode } from '../nodes/hierarchy-node/hierarchy-node.model';

export type UseExpandCollapseOptions = {
  layoutNodes?: boolean;
  treeWidth?: number;
  treeHeight?: number;
};

function isHierarchyPointNode(
  pointNode: HierarchyNode<TypeHierarchyNode> | HierarchyPointNode<TypeHierarchyNode>
): pointNode is HierarchyPointNode<TypeHierarchyNode> {
  return (
    typeof (pointNode as HierarchyPointNode<TypeHierarchyNode>).x === 'number' &&
    typeof (pointNode as HierarchyPointNode<TypeHierarchyNode>).y === 'number'
  );
}

function useExpandCollapse(
  enabled: boolean,
  nodes: Node[],
  edges: Edge[],
  { layoutNodes = true, treeWidth = 250, treeHeight = 100 }: UseExpandCollapseOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  return useMemo(() => {

    // All elements need to be hierarchy
    if (!nodes.every(node => node.type === 'hierarchy')) {
      return { nodes, edges };
    }

    // If not in hierarchy view, don't stratify
    if (!enabled) {
      return {nodes, edges};
    }

    const hierarchy = stratify<TypeHierarchyNode>()
      .id((d) => d.id)
      .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(nodes);

    hierarchy.descendants().forEach((d) => {
      d.data.data.expandable = !!d.children?.length;
      d.children = d.data.data.expanded ? d.children : undefined;
    });

    const layout = tree<TypeHierarchyNode>()
      .nodeSize([treeWidth, treeHeight])
      .separation(() => 1);

    const root = layoutNodes ? layout(hierarchy) : hierarchy;

    return {
      nodes: root.descendants().map((d) => ({
        ...d.data,
        type: 'hierarchy',
        position: isHierarchyPointNode(d) ? { x: d.x, y: d.y } : d.data.position,
      })),
      edges: edges.filter((edge) => root.find((h) => h.id === edge.source) && root.find((h) => h.id === edge.target)),
    };
  }, [nodes, edges, layoutNodes, treeWidth, treeHeight]);
}

export default useExpandCollapse;