import { ConfigProvider } from 'antd';
import { Component } from 'react';
import { ReactFlowProvider } from 'reactflow';
import './App.scss';
import ExploreFlow from './flow';


class Highlight extends HTMLElement {
  constructor() {
    const curr = super();
    // this.attachShadow({ mode: 'open' });
    // console.log(curr)
    // const ReactApp = () => {
    //   return (
    //     <span onMouseEnter={() => this.handleMouseEnter()}>
    //       <TooltipWrapper content="This is a tooltip">
    //         text
    //       </TooltipWrapper>
    //     </span>
    //   );
    // };
    // createRoot(this.shadowRoot ?? new ShadowRoot).render(<ReactApp />);
  }

  handleMouseEnter() {
    console.log('hovering in react!');
  }
}

customElements.define("highlight-text", Highlight);

export default class App extends Component {
  render() {
    return (
      <div className='App'>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#3facff',
            },
          }}
        >
          <ReactFlowProvider>
            <ExploreFlow />
          </ReactFlowProvider>
        </ConfigProvider>
      </div>
    )
  }
}
