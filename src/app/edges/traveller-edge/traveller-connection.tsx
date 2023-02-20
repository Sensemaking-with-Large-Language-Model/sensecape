import React from 'react';
import { getBezierPath } from 'reactflow';
import { getEdgeParams } from './traveller-edge.helper';

import './traveller-edge.scss';

function FloatingConnectionLine({ targetX, targetY, sourcePosition, targetPosition, sourceNode }: any) {
  if (!sourceNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    width: 1,
    height: 1,
    position: { x: targetX, y: targetY },
  };

  const { sx, sy } = getEdgeParams(sourceNode, targetNode);
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <g>
      <path fill="none" stroke="#000" strokeWidth={2} className="animated" d={edgePath} />
      <circle cx={targetX} cy={targetY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}

export default FloatingConnectionLine;