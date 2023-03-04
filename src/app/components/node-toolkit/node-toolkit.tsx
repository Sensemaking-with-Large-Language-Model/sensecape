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
import { ReactComponent as BrainstormIcon } from '../../assets/node-icons/brainstorm.svg';
import { ReactComponent as SearchIcon } from '../../assets/node-icons/search.svg';
import { ReactComponent as HierarchyIcon } from '../../assets/node-icons/hierarchy.svg';
import { ReactComponent as MemoIcon } from '../../assets/node-icons/memo.svg';
import { ReactComponent as HelpIcon } from '../../assets/help.svg';



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
    element: '.semantic-route',
    intro: 'Semantic route<br><br>[Description]',
    tooltipClass: 'semantic-route-tooltip',
    position: 'right', 
  },
  {
    intro: <ImageElement/>,
    tooltipClass: 'gif',
  },
  {
    intro: <VideoElement/>,
    tooltipClass: 'video',
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
        state: {}
      };
    } else if (nodeType === 'memo') {
      data = {
        state: {}
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
    <div className="node-toolkit">
      <div className='toolkit-option traveller-mode-toggle'>
        <Switch checked={props.travellerMode} onChange={props.toggleTravellerMode} size='small' />
        Traveller Mode
      </div>
      <div className='toolkit-option toolkit-brainstorm add-node' draggable onDragStart={(e) => onDragStart(e, 'brainstorm')}>
        <BrainstormIcon />
        Brainstorm
      </div>
      <div className='toolkit-option toolkit-search add-node' draggable onDragStart={(e) => onDragStart(e, 'chat')}>
        <SearchIcon />
        Search
      </div>
      <div className='toolkit-option toolkit-concept add-node' draggable onDragStart={(e) => onDragStart(e, 'concept')}>
        <HierarchyIcon />
        Hierarchy
      </div>
      <div className='toolkit-option toolkit-memo add-node' draggable onDragStart={(e) => onDragStart(e, 'memo')}>
        <MemoIcon />
        Memo
      </div>
      <div className='toolkit-option toolkit-help add-node' draggable onClick={startIntroJS}>
        <HelpIcon />
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