import { NodeProps, Handle, Position } from "reactflow";
import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
import './suptopic-node.scss';
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';

const SupTopicNode = (props: NodeProps) => {
    return (
        <div className="suptopic-node" title="click to add a child node">
            <Handle id="a" className="handle" type="source" position={Position.Top} isConnectable={true} />
            {/* <span>subtopic</span> */}
            { props.data.label }
            <Handle id="b" className="handle" type="target" position={Position.Bottom} isConnectable={true} />
        </div>
      );
}

export default SupTopicNode;