import React, { Component } from 'react';
import ReactFlow, { Background, NodeTypes, ReactFlowProvider } from 'reactflow';
import './App.scss';
import ChatNode from './nodes/chat-node/chat-node';
import ConceptNode from './nodes/concept-node/concept-node';
import TopicNode from './nodes/topic-node/topic-node';
// import { ChatNode } from './nodes/chat-node/chat-node.types';

const proOptions = { account: 'paid-pro', hideAttribution: true };

const nodeTypes: NodeTypes = {
  chat: ChatNode,
  topic: TopicNode,
  concept: ConceptNode,
};

export default class App extends Component {


  render() {
    return (
      <div className='App'>
        <ReactFlowProvider>
          <ReactFlow
            proOptions={proOptions}
            nodeTypes={nodeTypes}
            panOnScroll={true}
          >
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    )
  }
}
