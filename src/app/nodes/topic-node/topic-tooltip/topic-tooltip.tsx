import { useState } from "react";
import { NodeProps } from "reactflow";
import GPTInput from "../../../components/gpt-input/gpt-input";
import { ResponseState } from "../../../components/gpt-input/gpt-input.model";
import './topic-tooltip.scss'

const TopicTooltip = (props: any) => {
  const [input, setInput] = useState('');

  return (
    <div className="topic-tooltip">
      <div className="topic-tooltip-box">
        {/* <button>Elaborate</button> */}
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

export default TopicTooltip;