import { memo } from 'react';
import { getRectOfNodes, NodeProps, NodeToolbar, useReactFlow, useStore, useStoreApi } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';

import useDetachNodes from '../../hooks/useDetachNodes';

const lineStyle = { borderColor: '#aaa' };
const padding = 25;

function GroupNode({ id }: NodeProps) {
  const store = useStoreApi();
  const { deleteElements } = useReactFlow();
  const detachNodes = useDetachNodes();
  const { minWidth, minHeight, hasChildNodes } = useStore((store) => {
    const childNodes = Array.from(store.nodeInternals.values()).filter((n) => n.parentNode === id);
    const rect = getRectOfNodes(childNodes);

    return {
      minWidth: rect.width + padding * 2,
      minHeight: rect.height + padding * 2,
      hasChildNodes: childNodes.length > 0,
    };
  }, isEqual);

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const onDetach = () => {
    const childNodeIds = Array.from(store.getState().nodeInternals.values())
      .filter((n) => n.parentNode === id)
      .map((n) => n.id);

    detachNodes(childNodeIds, id);
  };

  return (
    <>
      <NodeResizer lineStyle={lineStyle} minWidth={minWidth} minHeight={minHeight} />
      <NodeToolbar className="node-toolbar nodrag">
        {/* <button onClick={onDelete}>Delete</button> */}
        {hasChildNodes && <button onClick={onDetach}>Ungroup</button>}
      </NodeToolbar>
    </>
  );
}

function isEqual(prev: any, next: any) {
  return (
    prev.minWidth === next.minWidth && prev.minHeight === next.minHeight && prev.hasChildNodes === next.hasChildNodes
  );
}

export default memo(GroupNode);
