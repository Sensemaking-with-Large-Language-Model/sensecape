import { useCallback } from 'react';
import { useStore, getBezierPath } from 'reactflow';
import { getEdgeParams } from './traveller-edge.helper';

import './traveller-edge.scss';

function TravellerEdge({ id, source, target, markerEnd, style, data }: any) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path traveller-edge"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}

export default TravellerEdge;