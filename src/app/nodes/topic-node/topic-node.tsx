import { Component, useState } from "react";
import { NodeProps } from "reactflow";
import './topic-node.scss';

const TopicNode = (props: NodeProps) => {

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="topic-node">
      <div className="topic-node-box">{props.data.topicName}</div>
      <div className="topic-node-tooltip">Options here</div>
    </div>
  )
}

export default TopicNode;