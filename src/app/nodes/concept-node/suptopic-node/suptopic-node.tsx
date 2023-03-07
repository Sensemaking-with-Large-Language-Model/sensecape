import { NodeProps, Handle, Position, useReactFlow, useStore } from "reactflow";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import { extendConcept } from "../../../../api/openai-api";
import "./suptopic-node.scss";
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';
import { ZoomState } from "../../node.model";

const zoomSelector = (s: any) => s.transform[2];

const SupTopicNode = (props: NodeProps) => {
  const reactFlowInstance = useReactFlow();
  const zoom: number = useStore(zoomSelector);

  // Depending on Zoom level, vary subtopic font size
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return 'suptopic-node all';
    } else if (zoom > ZoomState.SUMMARY) {
      return 'suptopic-node summary';
    } else {
      return 'suptopic-node keywords';
    }
  }

  return (
    // <div className="suptopic-node" title="click to add a parent node">
    <div className={`${currentZoomState()}`} title="click to add a parent node">
      <Handle
        id="a"
        className="handle"
        type="source"
        position={Position.Top}
        isConnectable={true}
        onClick={() => extendConcept(reactFlowInstance, props.id, 'top', props.data.label, false)}
      />
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
