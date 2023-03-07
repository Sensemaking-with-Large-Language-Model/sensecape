export {};

// import { Component, useState } from 'react';
// import { useCallback } from 'react';
// import { Handle, NodeProps, Position, ReactFlowInstance, useReactFlow } from 'reactflow';
// import { askGPT3Input } from '../../../openai-api';
// import './chat-node.scss';
// import { ReactComponent as DragHandle } from '../../../assets/drag-handle.svg';
// import { isHighlightable } from './highlighter';
// import HighlightTooltip from './highlight-tooplip/highlight-toolip';
// import { Tooltip, TooltipProvider, TooltipWrapper } from 'react-tooltip';
// import { createRoot } from 'react-dom/client';

// interface Chat {
//   text: string;
//   type: 'INPUT' | 'OUTPUT';
// }

// type ChatState = {
//   input: string,
//   chatHistory: Chat[], // TODO: instead of saving local history, save chathistory in global state
//   response: string, // Singular response. more follow ups/responses belong in another chatnode
//   responseIsLoading: boolean,
//   highlightIds: string[],
//   currentHighlightId: string,
//   reactFlowInstance: ReactFlowInstance,
// };

// // interface HighlightHoverPosition {
  
// // }

// class Highlight extends HTMLElement {
//   constructor() {
//     const curr = super();
//     // this.attachShadow({ mode: 'open' });
//     // console.log(curr)
//     // const ReactApp = () => {
//     //   return (
//     //     <span onMouseEnter={() => this.handleMouseEnter()}>
//     //       <TooltipWrapper content="This is a tooltip">
//     //         text
//     //       </TooltipWrapper>
//     //     </span>
//     //   );
//     // };
//     // createRoot(this.shadowRoot ?? new ShadowRoot).render(<ReactApp />);
//   }

//   handleMouseEnter() {
//     console.log('hovering in react!');
//   }
// }

// customElements.define("highlight-text", Highlight);

// export default class ChatNodeTemp extends Component<NodeProps, ChatState> {
//   constructor(props: any) {
//     super(props);
//     this.state = {
//       input: '',
//       chatHistory: [],
//       response: '',
//       responseIsLoading: false,
//       highlightIds: [],
//       currentHighlightId: '',
//       reactFlowInstance: useReactFlow(),
//     };

//     this.handleInputChange = this.handleInputChange.bind(this);
//     this.highlightSelection = this.highlightSelection.bind(this);
//   }

//   async generateResponse(prompt: string) {
//     if (!prompt) {
//       return;
//     }

//     this.setState({responseIsLoading: true});
//     const input: Chat = {
//       text: prompt,
//       type: 'INPUT',
//     };

//     const response = await askGPT3Input(
//       this.state.chatHistory.map(chat => chat.text), prompt
//     ) || 'Error: no response received';

//     this.setState({response: response});
//     this.state.chatHistory.push(input);
//     this.state.chatHistory.push({
//       text: response,
//       type: 'OUTPUT',
//     });
//     this.setState({responseIsLoading: false});

//     const e: any = new Event('create-chat-follow-up');
//     e.id = 'tello';
//     console.log('dispatched');
//     document.dispatchEvent(e);

//     console.log('instance', this.state.reactFlowInstance.getNodes());

//   }

//   handleInputChange(event: any) {
//     this.setState({input: event.target.value});
//   }

//   highlightSelection() {
//     const range: Range = document.getSelection()?.getRangeAt(0) ?? new Range;
//     const selectedText = range.toString();
//     if (isHighlightable(range)) {
//       const highlight = document.createElement('highlight-text', {is: selectedText});
//       highlight.draggable = true;
//       highlight.innerHTML = selectedText;
//       range.surroundContents(highlight);
//       highlight.classList.add('highlight-elm');
//       highlight.id = `highlight-${this.state.highlightIds.length}`;
//       this.state.highlightIds.push(highlight.id);
//       highlight.addEventListener('mouseenter', (event) => {
//         console.log('entering');
//         this.setState({
//           currentHighlightId: highlight.id,
//         });
//       })
//       highlight.addEventListener('mouseleave', (event) => {
//         console.log('leaving');
//         this.setState({
//           currentHighlightId: '',
//         });
//       })
//       highlight.addEventListener('dragstart', (event) => {
//         this.onDragStart(event, 'topic', selectedText);
//       })
//       window.getSelection()?.removeAllRanges();
//     }
//   }

//   onDragStart(event: any, nodeType: string, topicName: string) {
//     event.dataTransfer.setData('dragNodeType', nodeType);
//     event.dataTransfer.effectAllowed = 'move';
//     const data = JSON.stringify({
//       chatNodeId: this.props.id,
//       chatReference: {
//         input: this.state.input,
//         response: this.state.response,
//       },
//       topicName,
//     });
//     console.log(data);
//     event.dataTransfer.setData('dragNodeData', data);
//   };

//   render() {
//     return (
//       <div className='chat-node'>
//         <TooltipProvider>

//           {/* <TooltipWrapper content="drag"> */}
//             <DragHandle className='drag-handle' />
//           {/* </TooltipWrapper> */}

//           {
//             this.state.response ? (
//               <div className='chat-input'>
//                 {this.state.input}
//               </div>
//             ) : <form
//               className='chat-input'
//               onSubmit={(event) => {
//                 this.generateResponse(this.state.input.trim());
//                 event.preventDefault();
//               }}
//             >
//               <input
//                 id="text"
//                 className="text-input"
//                 name="text"
//                 type="text"
//                 placeholder='Ask GPT3'
//                 autoComplete='off'
//                 value={this.state.input}
//                 onChange={this.handleInputChange}
//               />
//               <button
//                 onClick={() => this.generateResponse(this.state.input.trim())}
//                 type="button"
//               >
//                 <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M7.58227 10.2376L10.2673 7.54512M5.54977 4.74012L11.9173 2.61762C14.7748 1.66512 16.3273 3.22512 15.3823 6.08262L13.2598 12.4501C11.8348 16.7326 9.49477 16.7326 8.06977 12.4501L7.43977 10.5601L5.54977 9.93012C1.26727 8.50512 1.26727 6.17262 5.54977 4.74012Z" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </button>
//             </form>
//           }
//           <div
//             id='highlight-box'
//             className='highlight-box'
//             onMouseUp={this.highlightSelection}
//           >
//             {!this.state.responseIsLoading || (<div>Loading...</div>)}
//             {this.state.response ? (
//               <div className='chat-response'>{this.state.response}</div>
//               ) : <></>}
//           </div>
//           <Handle type="source" position={Position.Bottom} id="a" />
//           <Tooltip
//             // anchorId={this.state.currentHighlightId}
//             place="bottom"
//           ></Tooltip>
//           {/* <div className="highlight-tooltip">tooltip?</div> */}
//           {/* <HighlightTooltip /> */}
//         </TooltipProvider>
//       </div>
//     )
//   }
// }
