import { useCallback, useState } from "react";
import { NodeProps, useStore } from "reactflow";
import { getGPT3Keywords } from "../../../api/openai-api";
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import { ZoomState } from "../node.model";
import './memo-node.scss';

const zoomSelector = (s: any) => s.transform[2];

const MemoNode = (props: NodeProps) => {
  const [title, setTitle] = useState('Memo Node');
  const [memo, setMemo] = useState('');
  const [hasUpdated, setHasUpdated] = useState(false);
  const zoom: number = useStore(zoomSelector);

  const handleChange = (event: any) => {
    setMemo(event.target.value);
    setHasUpdated(true);
  }

  const generateTitle = useCallback(() => {
    if (hasUpdated) {
      getGPT3Keywords(memo).then(data => {
        setTitle(data ?? 'Memo Node');
        setHasUpdated(false);
      });
    };
  },
  [hasUpdated]);

  return (
    <div className="memo-node">
      {
        zoom >= ZoomState.SUMMARY ?
          (<>
            <div className="header drag-handle">
              <DragHandle className='drag-handle' />
              <h3>{title}</h3>
            </div>
            <textarea
              value={memo}
              onChange={handleChange}
              onBlur={generateTitle}
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