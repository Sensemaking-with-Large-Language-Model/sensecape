import { useState } from "react";
import { NodeProps, NodeToolbar, Position } from "reactflow";
import GPTInput from "../gpt-input/gpt-input";

import './expand-toolbar.scss'

const ExpandToolbar = (props: any) => {
  const defaultPlaceholder = 'Follow up';
  const [placeholder, setPlaceholder] = useState(defaultPlaceholder)
  const [input, setInput] = useState('');

  return (
    <div className="expand-toolbar">
      <div className="expand-toolbar-box">
        <div className="default-buttons">
          <button
            onClick={() => props.generateResponse(`Elaborate on ${props.topic}`)}
            onMouseEnter={() => setPlaceholder(`Elaborate on ${props.topic}`)}
            onMouseLeave={() => setPlaceholder(defaultPlaceholder)}
          >
            Elaborate
          </button>
        </div>
        <GPTInput 
          responseState={props.responseState}
          generateResponse={props.generateResponse}
          placeholder={placeholder}
          input={input}
          setInput={setInput}
          clickedInput={props.clickedInput}
        />
      </div>
    </div>
  )
}

export default ExpandToolbar;