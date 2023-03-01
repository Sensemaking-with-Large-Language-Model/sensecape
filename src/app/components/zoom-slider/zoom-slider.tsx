import { Slider } from "antd";
import { SliderMarks } from "antd/es/slider";
import { useCallback } from "react";
import { useReactFlow, useStore } from "reactflow";
import { ZoomState } from "../../nodes/node.model";

import './zoom-slider.scss';

const ZoomSlider = (props: any) => {
  const reactFlowInstance = useReactFlow();

  const onChange = useCallback((value: number) => {
    reactFlowInstance.zoomTo(Math.pow(10, value));
  },
  [reactFlowInstance]);

  const marks: SliderMarks = {
    [Math.log10(ZoomState.ALL)]: {
      style: { right: 18, textAlign: 'right' },
      label: 'Summary',
    },
    [Math.log10(ZoomState.SUMMARY)]: {
      style: { right: 18, textAlign: 'right' },
      label: 'Keywords',
    },
  };

  return (
    <div className="zoom-slider">
      <Slider
        vertical
        included={false}
        step={0.001}
        value={Math.log10(props.zoom)}
        onChange={onChange}
        min={Math.log10(props.range.min+0.001)}
        max={Math.log10(props.range.max-0.001)}
        marks={marks}
      />
    </div>
  )
}

export default ZoomSlider;