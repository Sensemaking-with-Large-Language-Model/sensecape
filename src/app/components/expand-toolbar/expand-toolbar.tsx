import { useState } from "react";
import { NodeProps, NodeToolbar, Position } from "reactflow";
import GPTInput from "../gpt-input/gpt-input";

import './expand-toolbar.scss'

const ExpandToolbar = (props: any) => {
  const [input, setInput] = useState('');

  return (
    <div className="expand-toolbar">
      <div className="expand-toolbar-box">
        <div className="default-buttons">
          <button onClick={() => props.generateResponse('Elaborate on that')}>Elaborate</button>
        </div>
        <GPTInput 
          responseState={props.responseState}
          generateResponse={props.generateResponse}
          placeholder={`Follow up`}
          input={input}
          setInput={setInput}
        />
      </div>
    </div>
  )
}

export default ExpandToolbar;