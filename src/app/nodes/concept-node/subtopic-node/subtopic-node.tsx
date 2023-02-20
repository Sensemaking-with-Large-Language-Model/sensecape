import { NodeProps, Handle, Position, useReactFlow } from "reactflow";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import extendConcept from "../../../hooks/useExtendConcept";
import "./subtopic-node.scss";
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';

const SubTopicNode = (props: NodeProps) => {
  const reactFlowInstance = useReactFlow();

  return (
    <div className="subtopic-node" title="click to add a child node">
      <Handle
        id="a"
        className="handle"
        type="target"
        position={Position.Top}
        isConnectable={true}
      />
      {/* <span>subtopic</span> */}
      {props.data.label}
      <Handle
        id="b"
        className="handle"
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        onClick={() => extendConcept(reactFlowInstance, props.id, 'bottom', props.data.label, 'prod')}
      />
    </div>
  );
};

export default SubTopicNode;
