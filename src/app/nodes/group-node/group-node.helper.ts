import { getRectOfNodes, Node, ReactFlowInstance, XYPosition } from 'reactflow';

// we have to make sure that parent nodes are rendered before their children
export const sortNodes = (a: Node, b: Node) => {
  if (a.type === b.type) {
    return 0;
  }
  return a.type === 'group' && b.type !== 'group' ? -1 : 1;
};

const groupPadding: number = 25;

export const createGroupNode = (reactFlowInstance: ReactFlowInstance, childNodes: Node[]) => {
  // TODO: Create group node
  // first, see if you don't need to set size of group node
  //    if it auto sizes on creation
  // else: import { getRectOfNodes } from 'reactflow';
  // make all containedNodes' parents the group node
  const rect = getRectOfNodes(childNodes);
  const position: XYPosition = {
    x: rect.x - groupPadding,
    y: rect.y - groupPadding,
  };

  // Get width and height of groupnode by getting list of positions
  const childX = childNodes.map(childNode => childNode.position.x);
  const childY = childNodes.map(childNode => childNode.position.y);

  // Used for width/height AND relative child positions in group
  const left = Math.min(...childX);
  const top = Math.min(...childY);

  const newGroupNode: Node = {
    id: `group-${reactFlowInstance.getNodes().length}`,
    position,
    type: 'group',
    data: {},
    style: {
      width: rect.width + 2*groupPadding,
      height: rect.height + 2*groupPadding,
      zIndex: -1,
    }
  };
  childNodes.forEach(childNode=> {
    childNode.parentNode = newGroupNode.id;
    const originalPosition: XYPosition = childNode.position;
    childNode.position = {
      // TODO: be able to reposition group of nodes to be relative
      x: originalPosition.x - left + groupPadding,
      y: originalPosition.y - top + groupPadding,
    }
  });
  reactFlowInstance.setNodes(nodes => nodes.concat(newGroupNode));
}

export const getNodePositionInsideParent = (node: Partial<Node>, groupNode: Node) => {
  const position = node.position;
  const nodeWidth = node.width ?? 0;
  const nodeHeight = node.height ?? 0;
  const groupWidth = groupNode.width ?? 0;
  const groupHeight = groupNode.height ?? 0;

  if (position) {
    if (position.x < groupNode.position.x) {
      position.x = 0;
    } else if (position.x + nodeWidth > groupNode.position.x + groupWidth) {
      position.x = groupWidth - nodeWidth;
    } else {
      position.x = position.x - groupNode.position.x;
    }
  
    if (position.y < groupNode.position.y) {
      position.y = 0;
    } else if (position.y + nodeHeight > groupNode.position.y + groupHeight) {
      position.y = groupHeight - nodeHeight;
    } else {
      position.y = position.y - groupNode.position.y;
    }
  }
  return position;
};
