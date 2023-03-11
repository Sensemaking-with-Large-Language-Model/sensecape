import { ChatCompletionRequestMessage } from "openai";
import { useCallback, useEffect, useState } from "react";
import { NodeProps, useStore, useReactFlow, getRectOfNodes, Handle, Position } from "reactflow";
import { getChatGPTKeywords } from "../../../api/openai-api";
import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
import { highlightSelection, isHighlightable } from "../../triggers/highlighter/highlighter";
import { InstanceState } from "../../triggers/semantic-dive/semantic-dive";
import { ZoomState } from "../node.model";
import { TypeMemoNode } from "./memo-node.model";
import './memo-node.scss';

const zoomSelector = (s: any) => s.transform[2];

const MemoNode = (props: NodeProps) => {
  const [title, setTitle] = useState(props.data.state.title ?? 'Memo');
  const [memo, setMemo] = useState(props.data.state.memo ?? '');
  const [highlightIds, setHighlightIds] = useState<string[]>(props.data.state.highlightIds ?? []);

  const [hasUpdated, setHasUpdated] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
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

  const beginEditing = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      console.log('m', document.getElementById('memo-input'));
      document.getElementById('memo-input')?.focus();
    }, 1);
  }, [isEditing]);

  return (
    <div className={`node memo-node`}
      onBlur={() => setIsEditing(false)}
      onDoubleClick={beginEditing}
    >
      <Handle type="target" position={Position.Top} id="b" className="node-handle-direct "/>
      {
        zoom > ZoomState.SUMMARY ?
          (<>
            <div className="header drag-handle">
              <DragHandle className='drag-handle' />
              <h3>{title}</h3>
            </div>
            {
              isEditing ?
                (<textarea
                  id='memo-input'
                  value={memo}
                  onChange={handleChange}
                  // onBlur={generateTitle}
                  // onFocus={handleOnFocus}
                  placeholder="Type notes here"
                ></textarea>) :
                <div
                  id='highlight-box'
                  className="text-input"
                  onMouseUp={(event) => highlightSelection(
                    props.id,
                    [{ role: 'user', content: memo }],
                    [highlightIds, setHighlightIds],
                    reactFlowInstance,
                  )}
                >
                  { memo }
                </div>

            }
          </>) :
          (<>
            <div className="summary drag-handle">
              <h2>{title}</h2>
            </div>
          </>)
      }
      <Handle type="source" position={Position.Bottom} id="a" className="node-handle-direct" />
    </div>
  )
}

export default MemoNode;