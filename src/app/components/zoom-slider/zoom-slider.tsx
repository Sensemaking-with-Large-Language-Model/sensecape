import { Slider } from "antd";
import { SliderMarks } from "antd/es/slider";
import { useCallback } from "react";
import { useReactFlow, useStore } from "reactflow";
import { ZoomState } from "../../nodes/node.model";

import './zoom-slider.scss';

const ZoomSlider = (props: any) => {
  const reactFlowInstance = useReactFlow();

  const onChange = useCallback((value: number) => {
    reactFlowInstance.zoomTo(value);
  },
  [reactFlowInstance]);

  const marks: SliderMarks = {
    0.75: 'Summary',
    0.35: 'Keywords',
  };

  return (
    <div className="zoom-slider">
      <Slider
        vertical
        included={false}
        step={0.01}
        value={props.zoom}
        onChange={onChange}
        min={props.range.min+0.001}
        max={props.range.max-0.001}
        marks={marks}
      />
    </div>
  )
}

export default ZoomSlider;