import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Button, Switch } from 'antd';
import { createChatNode } from '../../nodes/chat-node/chat-node.helper';
import { ChatNodeData } from '../../nodes/chat-node/chat-node.model';
import { ConceptNodeData } from '../../nodes/concept-node/concept-node.model';
import { CreativeNodeData } from '../../nodes/node.model';
import './node-toolkit.scss';
import 'intro.js/introjs.css';
import { Steps, Hints } from 'intro.js-react';



const ImageElement = () => {
    return (
      <>
      <h3>Tutorial</h3>
      <img src="https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp" alt="" />
      </>
    )
}

const VideoElement = () => {
  return (
    <>
    <h3>Tutorial</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/BzSMLP5KpjM" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
    </>
  )
}

// https://github.com/HiDeoo/intro.js-react#introjs-options
// element - target element
// intro - content
// tooltipClass - css for tooltip
// position - position of tooltip
const steps = [
  // {
  //   // element: document.querySelector('.reactflow-wrapper') as HTMLElement,
  //   element: '.react-flow',
  //   intro: 'canvas',
  //   position: 'right',
  //   // tooltipClass: 'myTooltipClass',
  //   // highlightClass: 'myHighlightClass',
  // },
  {
    intro: <ImageElement/>,
    tooltipClass: 'gif',
  },
  {
    intro: <VideoElement/>,
    tooltipClass: 'video',
  },
  {
    element: '.semantic-route',
    intro: 'Semantic route<br><br>[Description]',
    tooltipClass: 'semantic-route-tooltip',
    position: 'right', 
  },
  {
    element: '.node-toolkit',
    intro: 'Node Toolkit<br><br>[Description]',
    position: 'right',
    // tooltipClass: 'myTooltipClass',
    // highlightClass: 'myHighlightClass',
  },
  {
    element: '.toolkit-brainstorm',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-search',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-concept',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-memo',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-help',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-reset-canvas',
    intro: <ImageElement/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.zoom-slider',
    intro: <ImageElement/>,
    position: 'left',
    tooltipClass: 'gif',
  },
  {
    element: '.minimap',
    intro: 'Minimap<br><br>[Description]',
    position: 'left',
  },
];


const introOptions = {
  exitOnEsc: true,
  showStepNumbers: true,
  hidePrev: true,
  hideNext: true,
  showButtons: true,
  showBullets: false,
  keyboardNavigation: true,
  showProgress: true,
}

const NodeToolkit = (props: any) => {

  const reactFlowInstance = useReactFlow();
  const [stepsEnabled, setStepsEnabled] = useState(false);

  const addChatNode = useCallback(
    () => {
      const data: ChatNodeData = {
        parentId: '',
        chatReference: '',
        placeholder: 'Ask GPT-3',
        state: {},
      }
      createChatNode(reactFlowInstance, '', data);
    },
    [reactFlowInstance]
  )

  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('dragNodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    let data: CreativeNodeData;
    if (nodeType === 'brainstorm') {
      data = {
        parentId: '',
        chatReference: '',
        placeholder: 'Brainstorm',
        state: {},
      };
    } else if (nodeType === 'chat') {
      data = {
        parentId: '',
        chatReference: '',
        placeholder: 'Ask GPT-3',
        state: {},
      } as ChatNodeData;
    } else if (nodeType === 'concept') {
      data = {
        label: '',
        topicNodes: [],
        state: {},
      };
    }
     else if (nodeType === 'concept-from-topic') {
      data = {
        topicNodes: [],
      };
    } else if (nodeType === 'memo') {
      data = {
        state: {
          input: '',
        }
      }
    } else {
      return;
    }
    const dataString: string = JSON.stringify(data);
    event.dataTransfer.setData('dragNodeData', dataString);
  };

  const clearCanvas = useCallback(() => {
    localStorage.clear();
    reactFlowInstance.setNodes([]);
    reactFlowInstance.setEdges([]);
    reactFlowInstance.zoomTo(1, {
      duration: 400,
    });
    reactFlowInstance.fitView();
  },
  [reactFlowInstance]);

  const scale = () => {
    const el = document.getElementById('scale-it');
    el?.classList.add('scale');
    console.log(el);
  }

  const onExit = () => { setStepsEnabled(false) };

  const startIntroJS = () => {setStepsEnabled(true)}


  return (
    <div className="node-toolkit" data-intro='Hello step one!'>
      <Button onClick={scale}>Scale</Button>
      <div className='toolkit-option traveller-mode-toggle'>
        <Switch checked={props.travellerMode} onChange={props.toggleTravellerMode} size='small' />
        Traveller Mode
      </div>
      <div className='toolkit-option toolkit-brainstorm add-node' draggable onDragStart={(e) => onDragStart(e, 'brainstorm')}>
        {/* <svg width="16" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 8L15 8M8 15L8 1" stroke="#AAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg> */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.31993 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.51997C18.0399 2.45997 16.7199 1.95997 16.0199 2.75997L8.44994 11.36C7.79994 12.11 8.32993 13.28 9.31993 13.28Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 4H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 20H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 12H1.5" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Brainstorm
      </div>
      <div className='toolkit-option toolkit-search add-node' draggable onDragStart={(e) => onDragStart(e, 'chat')}>
        {/* <svg width="16" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 8L15 8M8 15L8 1" stroke="#AAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg> */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 5H20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 8H17" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 22L20 20" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Search
      </div>
      <div className='toolkit-option toolkit-concept add-node' draggable onDragStart={(e) => onDragStart(e, 'concept')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 20C18 21.1046 18.8954 22 20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 20C2 21.1046 2.89543 22 4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 4C10 5.10457 10.8954 6 12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6L12 18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 18V14C20 12 19 11 17 11L7 11C5 11 4 12 4 14V18" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.15007 12.1499L5.85004 14.8498C8.10001 17.0998 9.89999 17.0998 12.15 14.8498L14.8499 12.1499C17.0999 9.89988 17.0999 8.0999 14.8499 5.84993L12.15 3.14996C9.89999 0.89999 8.10001 0.89999 5.85004 3.14996L3.15007 5.84993C0.900095 8.0999 0.900095 9.89988 3.15007 12.1499Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg> */}
        Hierarchy
      </div>
      <div className='toolkit-option toolkit-memo add-node' draggable onDragStart={(e) => onDragStart(e, 'memo')}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 1.5V3.75M12 1.5V3.75M5.25 8.25H11.25M5.25 11.25H9M11.25 16.5H6.75C3 16.5 2.25 14.955 2.25 11.865V7.2375C2.25 3.7125 3.5025 2.7675 6 2.625H12C14.4975 2.76 15.75 3.7125 15.75 7.2375V12" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.75 12L11.25 16.5V14.25C11.25 12.75 12 12 13.5 12H15.75Z" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Memo
      </div>
      <div className='toolkit-option toolkit-help add-node' draggable onClick={startIntroJS}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 18.4301H13L8.54999 21.39C7.88999 21.83 7 21.3601 7 20.5601V18.4301C4 18.4301 2 16.4301 2 13.4301V7.42999C2 4.42999 4 2.42999 7 2.42999H17C20 2.42999 22 4.42999 22 7.42999V13.4301C22 16.4301 20 18.4301 17 18.4301Z" stroke="#AAAAAA" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.0001 11.36V11.15C12.0001 10.47 12.4201 10.11 12.8401 9.82001C13.2501 9.54001 13.66 9.18002 13.66 8.52002C13.66 7.60002 12.9201 6.85999 12.0001 6.85999C11.0801 6.85999 10.3401 7.60002 10.3401 8.52002" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.9955 13.75H12.0045" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Help
      </div>
      <Button onClick={clearCanvas} className="toolkit-reset-canvas" type="text" block danger>Reset Canvas</Button>
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        onExit={onExit}
        options={introOptions}
      />
    </div>
  )
}

export default NodeToolkit; 