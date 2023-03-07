import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useStore,
  Node,
  Edge,
} from "reactflow";
import { ReactComponent as DragHandle } from "../../../assets/drag-handle.svg";
import { extendConcept } from "../../../../api/openai-api";
import "./subtopic-node.scss";
// import cx from 'classnames';
// import styles from 'subtopic-node.module.scss';
import { ZoomState } from "../../node.model";
import { stratify, tree } from "d3-hierarchy";

const verbose: boolean = false; // flag for console.log() messages during devMode
const zoomSelector = (s: any) => s.transform[2];
const use_dagre: boolean = false;

// ===========================

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([200, 150])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const options = { duration: 300 };

// the layouting function
// accepts current nodes and edges and returns the layouted nodes with their updated positions
function layoutNodes(rootNode: Node, nodes: Node[], edges: Edge[]): Node[] {
  // convert nodes and edges into a hierarchical object for using it with the layout function
  if (verbose) {
    console.log("===========");
    console.log("before running hierarchy");
    console.log("nodes", nodes);
    console.log("edges", edges);
  }
  const root_position = rootNode.position;
  if (verbose) {
    console.log("rootNode", rootNode);
    console.log("root_position", root_position);
  }

  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // get the id of each node by searching through the edges
    // this only works if every node has one connection
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes
    );
    
    // run the layout algorithm with the hierarchy data structure
    const root = layout(hierarchy);
  
  if (verbose) {
    console.log("hierarchy", hierarchy);
    console.log("root", root);
    console.log("===========");
  }

  root.x = root_position["x"];
  root.y = root_position["y"];

  // convert the hierarchy back to react flow nodes (the original node is stored as d.data)
  // we only extract the position from the d3 function
  return root
    .descendants()
    .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

// ===========================

const SubTopicNode = (props: NodeProps) => {
  const reactFlowInstance = useReactFlow();
  const zoom: number = useStore(zoomSelector);

  const layout_ = async () => {
    const direction = "TB";
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    // get nodes we want to rearrange
    if (verbose) { console.log("========="); };
    // const targetNodes = nodes.filter((node) => node.type === "subtopic");

    const clickedNode = reactFlowInstance.getNode(props.id);
    if (!clickedNode) {
      return;
    }
    const rootId_ = clickedNode?.data.rootId;
    const rootNode = reactFlowInstance.getNode(rootId_);
    if (!rootNode) {
      return;
    }

    
    const targetNodes = nodes.filter((node) => node.data.rootId === rootId_);
    const targetEdges = edges.filter((edge) => edge.data.rootId === rootId_);
    const otherNodes = nodes.filter((node) => node.data.rootId !== rootId_);
    const otherEdges = edges.filter((edge) => edge.data.rootId !== rootId_);
    // const targetEdges = edges.filter((edge) => edge.type === "step");
    // const targetEdges = edges.filter((edge) => edge.type === "default");
    if (verbose) {
      console.log("rootId_", rootId_);
      console.log("targetNodes", targetNodes);
      console.log("targetEdges", targetEdges);
      console.log("otherNodes", otherNodes);
      console.log("otherEdges", otherEdges);
      console.log("=========");
    }

    // dagre approach
    // get new coordinates for nodes we want to rearrange

    if (verbose) {
      console.log("===========");
      console.log("d3 approach");
    }
    // d3 approach
    const targetNodes_ = layoutNodes(
      rootNode,
      [rootNode, ...targetNodes],
      targetEdges
    );
    await reactFlowInstance.setNodes([...targetNodes_, ...otherNodes]);
    await reactFlowInstance.setEdges([...targetEdges, ...otherEdges]);
  };

  // Depending on Zoom level, vary subtopic font size
  const currentZoomState = () => {
    if (zoom > ZoomState.ALL) {
      return "subtopic-node all";
    } else if (zoom > ZoomState.SUMMARY) {
      return "subtopic-node summary";
    } else {
      return "subtopic-node keywords";
    }
  };

  const handleSubTopicClick = async () => {
    extendConcept(
      reactFlowInstance,
      props.id,
      "bottom",
      props.data.label,
      true
    ).then((data) => {
      if (verbose) {console.log("data", data);}
      setTimeout(layout_, 100);
    });
  };

  return (
    // <div className="subtopic-node" title="click to add a child node">
    <div className={`${currentZoomState()}`} title="click to add a child node">
      <Handle
        id="a"
        className="handle"
        type="target"
        position={Position.Top}
        isConnectable={true}
      />
      {props.data.label}
      <Handle
        id="b"
        className="handle"
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        onClick={handleSubTopicClick}
        // onClick={() =>
        //   extendConcept(
        //     reactFlowInstance,
        //     props.id,
        //     "bottom",
        //     props.data.label,
        //     false
        //   )
        // }
      />
    </div>
  );
};

export default SubTopicNode;
