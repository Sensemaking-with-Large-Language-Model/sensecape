import { Component } from 'react';
import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export default class ChatNode extends Component<NodeProps> {
  render() {
    return (
      <div className='chat-node'>
        <label htmlFor="text">GPT-3 Input</label>
        <input
          id="text"
          className="text-input"
          name="text"
        />
        <button>Submit</button>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    )
  }
}
