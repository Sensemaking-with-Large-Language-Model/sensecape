import { Component } from "react";
import { ReactComponent as Expand } from '../../../../assets/expand-to-topic.svg';
import { ReactComponent as Delete } from '../../../../assets/delete-highlight.svg';
import './highlight-tooltip.scss';

interface TopicProps {
  // position: any;
}

export default class HighlightTooltip extends Component<TopicProps> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="highlight-tooltip">
        <Expand />
        <Delete />
      </div>
    )
  }
}