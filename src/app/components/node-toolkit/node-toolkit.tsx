import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useCallback, useState } from 'react';
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
import { ReactComponent as EraserIcon } from '../../assets/eraser.svg';
import { ReactComponent as KeyboardIcon } from '../../assets/keyboard.svg';
import { ReactComponent as ElementIcon } from '../../assets/element.svg';
import { ReactComponent as TeacherIcon } from '../../assets/teacher.svg';
import resetCanvas from "../../assets/tutorial/reset-canvas.gif";
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import useCloseOnDocumentClick from '../../hooks/useCloseOnDocumentClick';


const doNotShowTooltip = false; // change to true if don't want to show tool tip next to node types
const positionToolTip = "right center";
const mouseLeaveDelayTime = 20;
const offsetXValue = 15;
// const offsetYValue = 15;
const offsetYValue = 0;
const showArrow = true;

const StyledPopup = styled(Popup)`
  // use your custom style for ".popup-overlay"
  &-overlay {
    ...;
  }
  // use your custom style for ".popup-content"
  &-content {
    ...;
  }
`;

const ImageElement = (props: { title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; url: string | undefined; description: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
  return (
    <>
    <h3>{props.title}</h3>
    <img src={props.url} alt="" />
    <span>{props.description}</span>
    </>
  )
}

const VideoElement = (props: { url: string | undefined; }) => {
return (
  <>
  <h3>Tutorial</h3>
  <iframe width="560" height="315" src={props.url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
  </>
)
}

const ResetCanvas = () => {
return (
  <>
  <h3>Tutorial</h3>
  <img src={resetCanvas} width="700px" alt="" />
  </>
)
}

const ShortcutGIF = () => {
  return (
  <Popup
    trigger={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.53 20.4201H6.21C3.05 20.4201 2 18.3201 2 16.2101V7.79008C2 4.63008 3.05 3.58008 6.21 3.58008H12.53C15.69 3.58008 16.74 4.63008 16.74 7.79008V16.2101C16.74 19.3701 15.68 20.4201 12.53 20.4201Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.52 17.0999L16.74 15.1499V8.83989L19.52 6.88989C20.88 5.93989 22 6.51989 22 8.18989V15.8099C22 17.4799 20.88 18.0599 19.52 17.0999Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>}
    on="click"
    position="top center"
    nested
  >
  {/* Lorem ipsum */}
  <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>
</Popup>
)
}


const KeyboardShortcuts:any = (close: () => void) => {
  return (
    <>
      <div className="modal">
        <button className="close" onClick={close}>
          &times;
        </button>
        <div className="header"> <h3>Keyboard shortcuts</h3> </div>
        <div className="content">
          <div className="shortcut-navigation">
            <h2>Navigation</h2>
            <div className="shortcut-container">              
              <div className="shortcut">
              <div>Move Canvas</div>
                <div className="key-container"><kbd className="key">Space</kbd> + <kbd className="key">Drag</kbd>
                <ShortcutGIF ></ShortcutGIF>
                </div>
              </div>
              <div className="shortcut">
                <div>Zoom in/out</div>
                <div className="key-container"><kbd className="key">Cmd</kbd> + <kbd className="key">Scroll</kbd>
                  <ShortcutGIF ></ShortcutGIF>
                </div>
              </div>
            </div>
          </div>
          <div className="shortcut-editor">
            <h2>Editor</h2>
            <div className="shortcut-container">
              <div className="shortcut">
                <div>Delete</div>
                <div className="key-container"><kbd className="key">Delete</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
              <div className="shortcut">
                <div>Select multiple nodes</div>
                <div className="key-container"><kbd className="key">Shift</kbd> + <kbd className="key">Drag</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
            </div>
          </div>
          <div className="shortcut-semantic-navigation">
            <h2>Semantic Dive</h2>
            <div className="shortcut-container">
              <div className="shortcut">
                <div>Dive in</div>
                <div className="key-container"><kbd className="key">Delete</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
              <div className="shortcut">
                <div>Dive out</div>
                <div className="key-container"><kbd className="key">Shift</kbd> + <kbd className="key">Drag</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="actions">
          <button
            className="close-button"
            onClick={() => {
              console.log('modal closed ');
              close();
            }}
          >
            Close
          </button>
        </div> */}
      </div>
    </>
  )
};


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
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    tooltipClass: 'gif',
  },
  {
    intro: <VideoElement url={"https://www.youtube.com/embed/BzSMLP5KpjM"} />,
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
    element: '.traveller-mode-toggle',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
  },
  {
    element: '.toolkit-brainstorm',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-search',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-concept',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-memo',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-help',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    position: 'right',
    tooltipClass: 'gif',
  },
  {
    element: '.toolkit-reset-canvas',
    intro: <ResetCanvas/>,
    position: 'top',
    tooltipClass: 'gif',
  },
  {
    element: '.zoom-slider',
    intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
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
  showBullets: true,
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
        state: {
          memo: '',
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

  const startIntroJS = () => {setStepsEnabled(true)};

  const closeOnDocumentClick = useCloseOnDocumentClick();

  return (
    <div className="node-toolkit">
      <Popup
        trigger={<div className='toolkit-option traveller-mode-toggle'>
        <Switch checked={props.travellerMode} onChange={props.toggleTravellerMode} size='small' />Traveller Mode</div>}
        position={positionToolTip}
        offsetX={offsetXValue}
        offsetY={offsetYValue}
        on="hover"
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        disabled={doNotShowTooltip}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
          Show or hide track history
      </Popup>
      <Popup
        trigger={<div className='toolkit-option toolkit-brainstorm add-node' draggable onDragStart={(e) => onDragStart(e, 'brainstorm')}>
        <BrainstormIcon />
        Brainstorm
      </div>}
        position={positionToolTip}
        offsetX={offsetXValue}
        offsetY={offsetYValue}
        on="hover"
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        disabled={doNotShowTooltip}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
        Drag out to create this node
      </Popup>
      <Popup
        trigger={<div className='toolkit-option toolkit-search add-node' draggable onDragStart={(e) => onDragStart(e, 'chat')}>
        <SearchIcon />
        Search
      </div>}
        position={positionToolTip}
        offsetX={offsetXValue}
        offsetY={offsetYValue}
        on="hover"
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        disabled={doNotShowTooltip}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
        Drag out to create this node
      </Popup>
      <Popup
        trigger={<div className='toolkit-option toolkit-concept add-node' draggable onDragStart={(e) => onDragStart(e, 'concept')}>
        <HierarchyIcon />
        Hierarchy
      </div>}
        position={positionToolTip}
        offsetX={offsetXValue}
        offsetY={offsetYValue}
        on="hover"
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        disabled={doNotShowTooltip}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
        Drag out to create this node
      </Popup>
      <Popup
        trigger={<div className='toolkit-option toolkit-memo add-node' draggable onDragStart={(e) => onDragStart(e, 'memo')}>
          <MemoIcon />
          Memo
        </div>} 
        position={positionToolTip}
        offsetX={offsetXValue}
        offsetY={offsetYValue}
        on="hover"
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        disabled={doNotShowTooltip}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
          Drag out to create this node
      </Popup>
      {/* <div className='toolkit-option toolkit-help add-node' draggable onClick={startIntroJS}>
        <HelpIcon />
        Help
      </div> */}
      <Popup trigger={<div className='toolkit-option toolkit-help add-node'><HelpIcon />Help</div>} position={positionToolTip}
        on="hover"
        offsetX={0}
        mouseLeaveDelay={mouseLeaveDelayTime}
        mouseEnterDelay={0}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
        <div className="menu">
          <div onClick={startIntroJS} className="menu-item">
          <ElementIcon/>&nbsp; Interface</div>
          {/* <div className="menu-item">Keyboard shortcuts</div> */}
          {/* <KeyboardShortcuts /> */}
          <div onClick={startIntroJS} className="menu-item">
          <TeacherIcon/>&nbsp; Tutorial</div>
          <Popup trigger={<div className="menu-item">
          <KeyboardIcon/>&nbsp; Keyboard shortcuts</div>} modal nested closeOnEscape closeOnDocumentClick={closeOnDocumentClick}>
            { KeyboardShortcuts }
          </Popup>
          {/* <div className="menu-item"> item 3</div> */}
        </div>
      </Popup>
      <Button onClick={clearCanvas} className="toolkit-reset-canvas" type="text" block danger>
      {/* <EraserIcon/>&nbsp; */}
      Reset Canvas</Button>
      {/* <PopupExample /> */}
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