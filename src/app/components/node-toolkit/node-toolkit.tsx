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
import { ReactComponent as BrainstormIcon } from '../../../assets/node-icons/brainstorm.svg';
import { ReactComponent as SearchIcon } from '../../../assets/node-icons/search.svg';
import { ReactComponent as HierarchyIcon } from '../../../assets/node-icons/hierarchy.svg';
import { ReactComponent as MemoIcon } from '../../../assets/node-icons/memo.svg';
import { ReactComponent as HelpIcon } from '../../../assets/help.svg';
import { ReactComponent as EraserIcon } from '../../../assets/eraser.svg';
import { ReactComponent as KeyboardIcon } from '../../../assets/keyboard.svg';
import { ReactComponent as ElementIcon } from '../../../assets/element.svg';
import { ReactComponent as TeacherIcon } from '../../../assets/teacher.svg';

import travellerModeImage from '../../../assets/images/traveller-mode.png';
import brainstormNode from "../../../assets/tutorial/brainstorm-node.png";
import brainstormNodeNChatNode from "../../../assets/tutorial/brainstorm-node-with-chat-node.png";
import toolkitHelp from "../../../assets/tutorial/toolkit-help.png";
import interfaceTutorial from "../../../assets/tutorial/interface-tutorial.png";
import miniMap from "../../../assets/tutorial/minimap.png";
import searchNode from "../../../assets/tutorial/search-node.png";
import memoNode from "../../../assets/tutorial/memo-node.png";

import resetCanvasGIF from "../../../assets/tutorial/reset-canvas.gif";
import memoNodeGIF from "../../../assets/tutorial/memo-node.gif";
import brainstormNodeVideo from "../../../assets/tutorial/use-brainstorm-node-faster.mp4";
import conceptNodeGIF from "../../../assets/tutorial/concept-node.gif";
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import useCloseOnDocumentClick from '../../hooks/useCloseOnDocumentClick';


const doNotShowTooltip = false; // change to true if don't want to show tool tip next to node types
const positionToolTipRight = "right center";
const positionToolTipTop = "right top";
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

const ImageElement = (props: { title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; width?: number; url: string | undefined; description: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
  return (
    <>
    <h3>{props.title}</h3>
    <img src={props.url} width={props.width} alt="" />
    <div className="tutorial-description">{props.description}</div>
    </>
  )
}

const VideoElement = (props: { url: string | undefined; }) => {
  return (
    <video width="320" height="240" controls>
      <source src={props.url} type="video/mp4" />
      <source src="" type="video/ogg" />
      Your browser does not support the video tag.
    </video>
  )
}


const YTVideoElement = (props: { url: string | undefined; description?: string}) => {
return (
  <>
  <iframe width="900" height="504" src={props.url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
  <div className="tutorial-description">{ props.description }</div>
  </>
)
}

const ShortcutGIF = () => {
  return (
  <Popup
    trigger={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.53 20.4201H6.21C3.05 20.4201 2 18.3201 2 16.2101V7.79008C2 4.63008 3.05 3.58008 6.21 3.58008H12.53C15.69 3.58008 16.74 4.63008 16.74 7.79008V16.2101C16.74 19.3701 15.68 20.4201 12.53 20.4201Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.52 17.0999L16.74 15.1499V8.83989L19.52 6.88989C20.88 5.93989 22 6.51989 22 8.18989V15.8099C22 17.4799 20.88 18.0599 19.52 17.0999Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const Tutorial:any = (close: () => void) => {
  return (
    <>
      <div className="modal">
        <button className="close" onClick={close}>
          &times;
        </button>
        <div className="header"> <h3>Tutorial</h3> </div>
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
                <div>Select</div>
                <div className="key-container"><kbd className="key">Click</kbd> or <kbd className="key">Drag</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
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
                <div>Select</div>
                <div className="key-container"><kbd className="key">Click</kbd> or <kbd className="key">Drag</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
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
                <div className="key-container"><kbd className="key">Opt</kbd> + <kbd className="key">Scroll Up</kbd><ShortcutGIF ></ShortcutGIF></div>
              </div>
              <div className="shortcut">
                <div>Dive out</div>
                <div className="key-container"><kbd className="key">Opt</kbd> + <kbd className="key">Scroll Down</kbd><ShortcutGIF ></ShortcutGIF></div>
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
const interface_steps = [
  {
    title: 'Welcome! 👋',
    intro: "SenseCape facilitates information exploration with ChatGPT.",
    tooltipClass: 'content',
  },
  {
    title: 'Semantic Level',
    element: '.semantic-route',
    intro: 'This breadcrumb indicates at which level you are in.',
    tooltipClass: 'semantic-route-tooltip',
    position: 'right', 
  },
  {
    element: '.traveller-mode-toggle',
    intro: <ImageElement width={450} title={""} url={travellerModeImage} description={"It helps you track search process with blue arrow."}/>,
    // intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    element: '.toolkit-brainstorm',
    intro: <ImageElement width={420} title={""} url={brainstormNode} description={"Brainstorm node generates questions to help you brainstorm ideas on what to explore.."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    element: '.toolkit-brainstorm',
    intro: <ImageElement width={420} title={""} url={brainstormNodeNChatNode} description={"You can click on any question to generate follow up explanation."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    // title: 'Search node',
    element: '.toolkit-search',
    intro: <ImageElement width={420} title={""} url={searchNode} description={""}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    // title: 'Concept node',
    element: '.toolkit-concept',
    intro: <ImageElement width={450} title={""} url={conceptNodeGIF} description={"Hierarchy node allows you to explore hierarchy of concepts."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    // title: 'Memo node',
    element: '.toolkit-memo',
    intro: <ImageElement width={450} title={""} url={memoNode} description={"You can use memo node to write anything."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    // title: 'Help',
    element: '.toolkit-help',
    intro: <ImageElement width={450} title={""} url={toolkitHelp} description={"You can hover over this to find introduction to interface, tutorial, and keyboard shortcuts."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    // title: 'Reset canvas',
    element: '.toolkit-reset-canvas',
    intro: <ImageElement width={450} title={""} url={resetCanvasGIF} description={"Clicking this deletes everything on canvas."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
  {
    title: 'Zoom Slider',
    element: '.zoom-slider',
    // intro: <ImageElement title={""} url={"https://i.giphy.com/media/ujUdrdpX7Ok5W/giphy.webp"} description={""}/>,
    intro: 'Slider represents at which zoom level you are at.',
    // tooltipClass: 'image',
    position: 'left',
  },
  {
    // title: 'Mini Map',
    element: '.minimap',
    intro: <ImageElement width={450} title={""} url={miniMap} description={"Mini map appears when there is more than one node."}/>,
    position: 'top',
    tooltipClass: 'image',
  },
  {
    // title: 'Help',
    element: '.toolkit-help',
    intro: <ImageElement width={450} title={""} url={interfaceTutorial} description={"To see this again, you can hover over 'Help' and click 'Interface'."}/>,
    tooltipClass: 'image',
    position: 'top',
  },
];
{/* <iframe width="560" height="315" src="https://www.youtube.com/embed/F7ldOvCXGbw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> */}
const flexNodeTutorial = [
  {
    intro: <YTVideoElement url={"https://youtube.com/embed/F7ldOvCXGbw"} description={"You can add flex node to canvas by double clicking anywhere on canvas. Flex node can transform to any node."}/>,
    tooltipClass: 'video',
  },
]

const semanticZoomTutorial = [
  {
    intro: <YTVideoElement url={"https://youtube.com/embed/lQrnySZNUpA"} description={"You can control the granularity of the information with semantic zoom. You see detailed response, summary, or keywords depending on your zoom level."}/>,
    tooltipClass: 'video',
  },
]

const semanticDiveTutorial = [
  {
    intro: <YTVideoElement url={"https://youtube.com/embed/9ZhX8mYqQBM"} description={"You can use dive into and out of topic nodes - alt (option) + scroll. You can also carry information between semantic levels by clicking nodes with alt (option) and using alt (option) + scroll"}/>,
    tooltipClass: 'video',
  },
]

const groupNodeTutorial = [
  {
    intro: <YTVideoElement url={"https://youtube.com/embed/itpmjpFiYKM"} description={"You can group relevant topic nodes together."}/>,
    tooltipClass: 'video',
  },
]

const introOptions = {
  exitOnEsc: true,
  showStepNumbers: false,
  hidePrev: true,
  hideNext: true,
  showButtons: true,
  showBullets: true,
  keyboardNavigation: true,
  showProgress: false,
  autoPosition: true,
}


const ytVideoOptions = {
  exitOnEsc: true,
  showStepNumbers: false,
  hidePrev: true,
  hideNext: true,
  showButtons: false,
  showBullets: false,
  keyboardNavigation: true,
  showProgress: false,
  autoPosition: true,
}

const NodeToolkit = (props: any) => {

  const reactFlowInstance = useReactFlow();
  const [interfaceStepsEnabled, setInterfaceStepsEnabled] = useState(false);
  const [flexNodeTutorialEnabled, setFlexNodeTutorialEnabled] = useState(false);
  const [semanticZoomTutorialEnabled, setSemanticZoomTutorialEnabled] = useState(false);
  const [semanticDiveTutorialEnabled, setSemanticDiveTutorialEnabled] = useState(false);
  const [groupNodeTutorialEnabled, setGroupNodeTutorialEnabled] = useState(false);

  const addChatNode = useCallback(
    () => {
      const data: ChatNodeData = {
        parentId: '',
        chatHistory: [],
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
        chatHistory: [],
        placeholder: 'Brainstorm',
        state: {},
      };
    } else if (nodeType === 'chat') {
      data = {
        parentId: '',
        chatHistory: [],
        placeholder: 'Ask ChatGPT',
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

  const onExit = () => { setInterfaceStepsEnabled(false) };
  const startIntroJS = () => { setInterfaceStepsEnabled(true) };
  
  const startFlexNodeTutorial = () => { setFlexNodeTutorialEnabled(true) };
  const endFlexNodeTutorial = () => { setFlexNodeTutorialEnabled(false) };
  const startSemanticZoomTutorial = () => { setSemanticZoomTutorialEnabled(true) };
  const endSemanticZoomTutorial = () => { setSemanticZoomTutorialEnabled(false) };
  const startSemanticDiveTutorial = () => { setSemanticDiveTutorialEnabled(true) };
  const endSemanticDiveTutorial = () => { setSemanticDiveTutorialEnabled(false) };
  const startGroupNodeTutorial = () => { setGroupNodeTutorialEnabled(true) };
  const endGroupNodeTutorial = () => { setGroupNodeTutorialEnabled(false) };

  const closeOnDocumentClick = useCloseOnDocumentClick();

  // check if opening page for the first time
  if (sessionStorage.getItem("firstTime")) {
    // if second time, skip intro.js
  } else {
    // if first time, trigger intro.js
    // trigger intro.js
    startIntroJS();
    // save flag in sessionStorage so intro.js is not triggered when user refreshes
    sessionStorage.setItem("firstTime", 'true');
  }

  return (
    <div className="node-toolkit">
      <Popup
        trigger={<div className='toolkit-option traveller-mode-toggle' onClick={props.toggleTravellerMode}>
        <Switch checked={props.travellerMode} onChange={props.toggleTravellerMode} size='small' />Traveller Mode</div>}
        position={positionToolTipRight}
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
      <Button type="text" block onClick={props.showHierarchy}>View Hierarchy</Button>
      {/* <div className='toolkit-option toolkit-help add-node' draggable onClick={startIntroJS}>
        <HelpIcon />
        Help
      </div> */}
      <Popup trigger={<div className='toolkit-option toolkit-help add-node'><HelpIcon />Help</div>} position={positionToolTipRight}
        on="hover"
        offsetX={0}
        mouseLeaveDelay={100}
        mouseEnterDelay={0}
        contentStyle={{ padding: '5px', border: 'none' }}
        arrow={showArrow}>
        <div className="menu">
          <div onClick={startIntroJS} className="menu-item">
          <ElementIcon/>&nbsp; Interface</div>
          {/* <div className="menu-item">Keyboard shortcuts</div> */}
          {/* <KeyboardShortcuts /> */}
          {/* <Popup trigger={<div className="menu-item">
            <TeacherIcon/>&nbsp; Tutorial</div>}  modal nested closeOnEscape closeOnDocumentClick={closeOnDocumentClick}>
            <Tutorial />
          </Popup> */}
          <Popup trigger={<div className="menu-item"><TeacherIcon/>&nbsp; Tutorial</div>} position={'right bottom'}
            on="hover"
            offsetX={0}
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{ padding: '5px', border: 'none' }}
            arrow={showArrow}>
              <div className="menu-item" onClick={startFlexNodeTutorial}>Flex Node</div>
              <div className="menu-item" onClick={startSemanticZoomTutorial}>Semantic Zoom</div>
              <div className="menu-item" onClick={startGroupNodeTutorial}>Group Node</div>
              <div className="menu-item" onClick={startSemanticDiveTutorial}>Semantic Dive</div>
              {/* <div className="menu-item">Brainstorm Node</div> */}
              {/* <div className="menu-item">Search Node</div> */}
              {/* <div className="menu-item">Concept Node</div> */}
              {/* <div className="menu-item">Memo Node</div> */}
          </Popup>


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
        enabled={interfaceStepsEnabled}
        steps={interface_steps}
        initialStep={0}
        onExit={startIntroJS}
        options={introOptions}
      />
      <Steps
        enabled={flexNodeTutorialEnabled}
        steps={flexNodeTutorial}
        initialStep={0}
        onExit={endFlexNodeTutorial}
        options={ytVideoOptions}
      />
      <Steps
        enabled={semanticZoomTutorialEnabled}
        steps={semanticZoomTutorial}
        initialStep={0}
        onExit={endSemanticZoomTutorial}
        options={ytVideoOptions}
      />
      <Steps
        enabled={semanticDiveTutorialEnabled}
        steps={semanticDiveTutorial}
        initialStep={0}
        onExit={endSemanticDiveTutorial}
        options={ytVideoOptions}
      />
      <Steps
        enabled={groupNodeTutorialEnabled}
        steps={groupNodeTutorial}
        initialStep={0}
        onExit={endGroupNodeTutorial}
        options={ytVideoOptions}
      />
    </div>
  )
}

export default NodeToolkit; 