import { Component } from "react";
import { NodeProps } from "reactflow";
import './topic-node.scss';

export default class TopicNode extends Component<NodeProps> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="topic-node">
        {this.props.data.topicName}
      </div>
    )
  }
}