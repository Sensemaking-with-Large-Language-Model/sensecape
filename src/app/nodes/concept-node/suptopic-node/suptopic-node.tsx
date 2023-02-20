import { NodeProps, Handle, Position, useReactFlow } from "reactflow";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import extendConcept from "../../../hooks/useExtendConcept";
import "./suptopic-node.scss";
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';

const SupTopicNode = (props: NodeProps) => {
  const reactFlowInstance = useReactFlow();

  return (
    <div className="suptopic-node" title="click to add a parent node">
      <Handle
        id="a"
        className="handle"
        type="source"
        position={Position.Top}
        isConnectable={true}
        onClick={() => extendConcept(reactFlowInstance, props.id, 'top', props.data.label, 'prod')}
      />
      {/* <span>subtopic</span> */}
      {props.data.label}
      <Handle
        id="b"
        className="handle"
        type="target"
        position={Position.Bottom}
        isConnectable={true}
      />
    </div>
  );
};

export default SupTopicNode;
