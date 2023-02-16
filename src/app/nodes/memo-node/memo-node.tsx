import { useState } from "react";
import { NodeProps } from "reactflow";
import './memo-node.scss';

const MemoNode = (props: NodeProps) => {
  const [memo, setMemo] = useState('');

  return (
    <div className="memo-node">
      <h3>Memo</h3>
      <textarea></textarea>
    </div>
  )
}

export default MemoNode;