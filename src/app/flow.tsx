import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Node,
  addEdge,
  ReactFlowProvider,
  Background,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  NodeTypes,
  XYPosition,
  OnSelectionChangeParams
} from "reactflow";
import { getTopics } from "../api/openai-api";

import "reactflow/dist/style.css";
import GenerateConceptButton from "./components/button-generate-concept/button-generate-concept";
import NodeToolkit from "./components/node-toolkit/node-toolkit";
import './flow.scss';
import ChatNode from "./nodes/chat-node/chat-node";
import { TypeChatNode } from "./nodes/chat-node/chat-node.model";
import ConceptNode from "./nodes/concept-node/concept-node";
import { createConceptNode } from "./nodes/concept-node/concept-node.helper";
import { TypeConceptNode } from "./nodes/concept-node/concept-node.model";
import MemoNode from "./nodes/memo-node/memo-node";
import { TypeMemoNode } from "./nodes/memo-node/memo-node.model";
import { CreativeNode } from "./nodes/node.model";
import TopicNode from "./nodes/topic-node/topic-node";
import { TypeTopicNode } from "./nodes/topic-node/topic-node.model";
// import WorkflowNode  from "./nodes/concept-node/WorkflowNode";
import useLayout from './hooks/useLayout';
import SubTopicNode from "./nodes/concept-node/subtopic-node/subtopic-node";

import edgeTypes from './edges';

const initialNodes: Node[] = [
  // {
  //   id: "chat-0",
  //   type: "chat",
  //   dragHandle: '.drag-handle',
  //   data: {
  //     parentChatId: '',
  //     chatReference: '',
  //     placeholder: 'Ask GPT-3'
  //   },
  //   position: { x: 250, y: 200 }
  // }
];

const initialEdges: Edge[] = [];

const proOptions = { account: 'paid-pro', hideAttribution: true };

const fitViewOptions = {
  padding: 0.95,
};

const nodeTypes: NodeTypes = {
  chat: ChatNode,
  topic: TopicNode,
  subtopic: SubTopicNode,
  // concept: WorkflowNode,
  concept: ConceptNode,
  memo: MemoNode,
};

let id = 0;
const getId = () => `${id++}`;

const ExploreFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<TypeTopicNode[]>([]);
  const connectingNodeId = useRef("");

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // 
  const onConnectStart = useCallback((_:any, { nodeId }:any) => {  
    // console.log('onConnectStart');
    connectingNodeId.current = nodeId;
  }, []);
  
  // this drops node containing extended topic at location where dragging from handle stops
  // currently disabled, however, to switch to interaction where users can simply click on handle to create extended topic
  // extended topic is intelligently placed at right location (so that users do not have to manually do this)
  const onConnectEnd = useCallback(
    async (event: any) => {
      // console.log('onConnectEnd');
      // get bounding box to find exact location of cursor
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();      
      
      if (reactFlowInstance) {

        // select concept node & get text box input value
        const nodeElement:any = document.querySelectorAll(`[data-id="${connectingNodeId.current}"]`)[0];
        const currentValue:any = nodeElement.getElementsByClassName('text-input')[0].value;

        // get (sub-, sup-, related-) topics from GPT
        const topics: any = await generateTopic('bottom', currentValue);
        
          const position: XYPosition = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
        const id = 'generated-topic-' + getId();
        console.log(id);
        const newNode:any = {
          id,
          position,
          // data: { label: `Node ${id}` },
          data: {label: topics[Math.floor(Math.random() * 10 % 5)] }
        };

        const newEdge: Edge =  {
          id: `edge-${reactFlowInstance.getEdges().length}`,
          source: connectingNodeId.current,
          sourceHandle: 'c',
          target: newNode.id,
        }

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
      }
    }, [reactFlowInstance]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('dragNodeType');
      const data = JSON.parse(event.dataTransfer.getData('dragNodeData'));

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowInstance) {
        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        let newNode: CreativeNode;
        if (type === 'chat' || type === 'topic') {
          newNode = {
            id: getId(),
            dragHandle: '.drag-handle',
            type,
            position,
            data,
          };
        } else if (type === 'concept') {
          newNode = {
            id: 'conccept-' + getId(),
            dragHandle: '.drag-handle',
            type,
            position,
            data,
          };
        } else if (type === 'memo') {
          newNode = {
            id: 'memo-' + getId(),
            dragHandle: '.drag-handle',
            type,
            position,
            data,
          };
        } else {
          return;
        }
        setNodes((nodes) => nodes.concat(newNode));
      }
    },
    [reactFlowInstance]
  );

  // const onSelectTopicNodes = useCallback(
  //   () => {
  //     const selectedTopicNodes: TypeTopicNode[] = reactFlowInstance?.getNodes()
  //       .filter(node => node.type === 'topic' && node.selected) ?? [];

  //     if (selectedTopicNodes.length <= 0) {
  //       return;
  //     }

  //     console.log('topic', selectedTopicNodes);
  //     setShowSelectedTopicMenu(true);
  //   },
  //   [reactFlowInstance]
  // )

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedTopicNodes: TypeTopicNode[] = params.nodes
        .filter(node => node.type === 'topic' && node.selected);

      if (selectedTopicNodes.length === 0) {
        return;
      }

      console.log('topic', selectedTopicNodes);
      setSelectedTopics(selectedTopicNodes);
    },
    [reactFlowInstance]
  )

  const generateTopic = (pos: string, concept: string) => {
    let prompt = "";

    if (pos === 'top') {
      prompt = "Give me 5 higher level topics of " + concept;
    } else if (pos === 'bottom') {
      prompt = "Give me 5 lower level topics of " + concept;
    } else if (pos === 'right' || pos === 'left') {
      prompt = "Give me 5 related topics of " + concept + " at this level of abstraction";
    }
    const topics = getTopics(prompt, concept);
    
    return topics;
  }

  const generateConceptNode = useCallback(
    () => {
      console.log('generating concept from ', selectedTopics);
      if (reactFlowInstance) createConceptNode(reactFlowInstance, selectedTopics);
    },
    [reactFlowInstance, selectedTopics]
  );

  return (
    <div className="explore-flow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            proOptions={proOptions}
            nodes={nodes}
            edges={edges}
            // fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            // fitViewOptions={fitViewOptions}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onConnectStart={onConnectStart}
            // onConnectEnd={onConnectEnd}
            onSelectionChange={onSelectionChange}
            // onSelectionEnd={onSelectTopicNodes}
            // onSelectionContextMenu={onSelectTopicNodes}
            panOnScroll={true}
            panOnDrag={false}
          >
            <Background />
          </ReactFlow>
          {selectedTopics.length > 0 ? 
            <GenerateConceptButton
              generateConceptNode={generateConceptNode}
            /> : <></>
          }
          <NodeToolkit />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ExploreFlow;
