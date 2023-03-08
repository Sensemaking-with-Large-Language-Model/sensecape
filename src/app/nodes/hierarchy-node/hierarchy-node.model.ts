import { Node } from 'reactflow';

export type HierarchyNodeData = {
  expanded: boolean;
  expandable?: boolean;
};

export type TypeHierarchyNode = Node<HierarchyNodeData>;
