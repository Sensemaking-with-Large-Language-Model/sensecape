import { useEffect, useState } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';
import './subtopic-node.module.scss';

const SubTopicNode = (props: NodeProps) => {
  
    return (
        <div className="node" title="click to add a child node">
            <DragHandle className='drag-handle' />
            {/* {data.label} */}
            <Handle className="handle" type="target" position={Position.Top} isConnectable={false} />
            <Handle className="handle" type="source" position={Position.Bottom} isConnectable={false} />
        </div>
      );

}
  
  export default SubTopicNode;