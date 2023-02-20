import { useState } from "react";
import { NodeProps } from "reactflow";
import { ReactComponent as DragHandle } from '../../assets/drag-handle.svg';
import './memo-node.scss';

const MemoNode = (props: NodeProps) => {
  const [memo, setMemo] = useState('');

  return (
    <div className="memo-node">
      <DragHandle className='drag-handle' />
      <h3>Memo</h3>
      <textarea></textarea>
    </div>
  )
}

export default MemoNode;