import { NodeProps, Handle, Position } from "reactflow";
import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
import './subtopic-node.scss';
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';

const SubTopicNode = (props: NodeProps) => {
    return (
        <div className="subtopic-node" title="click to add a child node">
            <Handle id="a" className="handle" type="target" position={Position.Top} isConnectable={true} />
            {/* <span>subtopic</span> */}
            { props.data.label }
            <Handle id="b" className="handle" type="source" position={Position.Bottom} isConnectable={true} />
        </div>
      );

}

export default SubTopicNode;