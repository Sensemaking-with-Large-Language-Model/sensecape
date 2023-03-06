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
          <button
            onClick={() => props.generateQuestions(`Brainstorm questions about ${props.topic}`)}
            onMouseEnter={() => setPlaceholder(`Brainstorm questions about ${props.topic}`)}
            onMouseLeave={() => setPlaceholder(defaultPlaceholder)}
          >
            Brainstorm
          </button>
          <button
            onClick={() => props.generateQuestions(`Tell me more about ${props.topic}`)}
            onMouseEnter={() => setPlaceholder(`Tell me more about ${props.topic}`)}
            onMouseLeave={() => setPlaceholder(defaultPlaceholder)}
          >
            Tell me more
          </button>
        </div>
        <GPTInput
          sourceId={props.sourceId}
          responseState={props.responseState}
          generateResponse={props.generateResponse}
          placeholder={placeholder}
          input={input}
          setInput={setInput}
          setInputState={props.setInputState}
        />
      </div>
    </div>
  )
}

export default ExpandToolbar;