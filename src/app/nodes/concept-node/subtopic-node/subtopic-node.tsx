import { NodeProps, Handle, Position, useReactFlow, useStore } from "reactflow";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import { extendConcept } from "../../../../api/openai-api";
import "./subtopic-node.scss";
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';
import { ZoomState } from "../../../nodes/node.model";

const zoomSelector = (s: any) => s.transform[2];

const SubTopicNode = (props: NodeProps) => {
  const reactFlowInstance = useReactFlow();
  const zoom: number = useStore(zoomSelector);

  // Depending on Zoom level, vary subtopic font size
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return 'subtopic-node all';
    } else if (zoom > ZoomState.SUMMARY) {
      return 'subtopic-node summary';
    } else {
      return 'subtopic-node keywords';
    }
  }

  return (
    // <div className="subtopic-node" title="click to add a child node">
    <div className={`${currentZoomState()}`} title="click to add a child node">
      
      <Handle
        id="a"
        className="handle"
        type="target"
        position={Position.Top}
        isConnectable={true}
      />
      {props.data.label}
      <Handle
        id="b"
        className="handle"
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        onClick={() =>
          extendConcept(
            reactFlowInstance,
            props.id,
            "bottom",
            props.data.label, 
            false
          )
        }
      />
    </div>
  );
};

export default SubTopicNode;
