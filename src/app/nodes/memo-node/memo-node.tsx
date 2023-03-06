import { useCallback, useEffect, useState } from "react";
import { NodeProps, useStore, useReactFlow, getRectOfNodes } from "reactflow";
import { getChatGPTKeywords } from "../../../api/openai-api";
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { ZoomState } from "../node.model";
import './memo-node.scss';

const zoomSelector = (s: any) => s.transform[2];

const MemoNode = (props: NodeProps) => {
  const [title, setTitle] = useState(props.data.state.title ?? 'Memo Node');
  const [memo, setMemo] = useState(props.data.state.memo ?? '');
  const [hasUpdated, setHasUpdated] = useState(false);
  const zoom: number = useStore(zoomSelector);

  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    reactFlowInstance.setNodes((nodes) => nodes.map(node => {
      if (node.id === props.id) {
        node.data.state = {
          title,
          memo,
        };
      }
      return node;
    }));
  }, [reactFlowInstance, title, memo]);

  const handleChange = (event: any) => {
    setMemo(event.target.value);
    setHasUpdated(true);
  }

  const generateTitle = useCallback(() => {
    if (hasUpdated) {
      getChatGPTKeywords(memo).then(data => {
        setTitle(data ?? 'Memo Node');
        setHasUpdated(false);
      });
    };
  },
  [hasUpdated]);

  const handleOnFocus = () => {
    // reactFlowInstance!.fitView({ duration: 900, padding: 0.3 });
    const sourceNode = reactFlowInstance.getNode(props.id);
    if (sourceNode) {
      reactFlowInstance.fitView({
        duration: 900,
        padding: 0.8,
        maxZoom: 2,
        minZoom: 0.5,
        nodes: [sourceNode]
      });
    }
  }

  return (
    <div className={`node memo-node`}>
      {
        zoom > ZoomState.SUMMARY ?
          (<>
            <div className="header drag-handle">
              <DragHandle className='drag-handle' />
              <h3>{title}</h3>
            </div>
            <textarea
              className="text-input"
              value={memo}
              onChange={handleChange}
              // onBlur={generateTitle}
              onFocus={handleOnFocus}
              placeholder="Type notes here"
            ></textarea>
          </>) :
          (<>
            <div className="summary drag-handle">
              <h2>{title}</h2>
            </div>
          </>)
      }
    </div>
  )
}

export default MemoNode;