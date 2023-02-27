import { useEffect, useRef } from 'react';
import { useReactFlow, useStore, Node, Edge, ReactFlowState } from 'reactflow';
import { stratify, tree } from 'd3-hierarchy';
import { timer } from 'd3-timer';

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([200, 150])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const options = { duration: 300 };

// the layouting function
// accepts current nodes and edges and returns the layouted nodes with their updated positions
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  // convert nodes and edges into a hierarchical object for using it with the layout function
  console.log('enter1');
  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // get the id of each node by searching through the edges
    // this only works if every node has one connection
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(nodes);
  
  console.log('hierarchy', hierarchy);
  console.log('enter2');
  // run the layout algorithm with the hierarchy data structure
  const root = layout(hierarchy);

  // convert the hierarchy back to react flow nodes (the original node is stored as d.data)
  // we only extract the position from the d3 function
  console.log('root', root);
  console.log('enter3');
  return root.descendants().map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

// this is the store selector that is used for triggering the layout, this returns the number of nodes once they change
const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size;
// console.log('nodeCountSelector', nodeCountSelector);
// console.log('nodeInternals', nodeInternals);
// console.log('state.nodeInternals.size', (state: ReactFlowState) => state.nodeInternals.size);
// console.log('state.nodeInternals', (state: ReactFlowState) => state.nodeInternals);

function useLayout() {
  // this ref is used to fit the nodes in the first run
  // after first run, this is set to false
  const initial = useRef(true);

  // we are using nodeCount as the trigger for the re-layouting
  // whenever the nodes length changes, we calculate the new layout
  const nodeCount = useStore(nodeCountSelector);
  // console.log('nodeCount', nodeCount);

  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } = useReactFlow();



  useEffect(() => {
    console.log('useEffect in useLayout');
    // get the current nodes and edges
    const nodes = getNodes();
    const edges = getEdges();

    // const targetNodes_ = nodes.filter((node) => node.type === 'workflow' || node.type === 'placeholder');
    // const targetEdges_ = edges.filter((edge) => edge.type === 'workflow' || edge.type === 'placeholder');

    // const targetNodes_ = nodes.filter((node) => node.type === 'concept' || node.type === 'subtopic' || node.type === 'suptopic');
    // console.log('1');
    // const targetEdges_ = edges.filter((edge) => edge.type === 'step');
    // console.log('2');
    // const nonTargetNodes_ = nodes.filter((node) => (node.type !== 'concept' || 'subtopic' || 'suptopic'));
    // console.log('3');
    // const nonTargetEdges_ = edges.filter((edge) => edge.type !== 'step');
    // console.log('4');

    // const targetNodes_ = nodes.filter((node) => node.type === 'concept');
    // const targetEdges_ = edges.filter((edge) => edge.type === 'default');

    const targetNodes_ = nodes.filter((node) => node.type === 'default');
    const targetEdges_ = edges.filter((edge) => edge.type === 'default');

    // const targetNodes_ = nodes.filter((node) => node.type === 'chat');
    // const targetEdges_ = edges.filter((edge) => edge.type === 'default');
    console.log('targetNodes_', targetNodes_);
    console.log('targetEdges_', targetEdges_);

    // run the layout and get back the nodes with their updated positions
    // const targetNodes = layoutNodes(nodes, edges);

    // if (targetNodes_.length === 0) {
    //   return;
    // }

    if (targetNodes_.length === 0 || targetEdges_.length === 0) {
      console.log('exit');
      return;
    }
    const targetNodes = layoutNodes(targetNodes_, targetEdges_);
    console.log('targetNodes (after layoutNodes())', targetNodes);
    // const targetNodes = layoutNodes(targetNodes, targetEdges);

    // const allNodes = [...targetNodes, ...nonTargetNodes_];
    // console.log('allNodes', allNodes);
    // return setNodes(allNodes);

    // if you do not want to animate the nodes, you can uncomment the following line
    // return setNodes(targetNoders);

    // to interpolate and animate the new positions, we create objects that contain the current and target position of each node
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        // this is where the node currently is placed
        from: getNode(node.id)?.position || node.position,
        // this is where we want the node to be placed
        to: node.position,
        node,
      };
    });

    // create a timer to animate the nodes to their new positions
    const t = timer((elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          id: node.id,
          position: {
            // simple linear interpolation
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
          data: { ...node.data },
          type: node.type,
        };
      });

      setNodes(currNodes);

      // this is the final step of the animation
      if (elapsed > options.duration) {
        // we are moving the nodes to their destination
        // this needs to happen to avoid glitches
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            id: node.id,
            position: {
              x: to.x,
              y: to.y,
            },
            data: { ...node.data },
            type: node.type,
          };
        });

        setNodes(finalNodes);

        // stop the animation
        t.stop();

        // in the first run, fit the view
        if (!initial.current) {
          // commented out so that fitView does not zoom into concept hierarchy
          // fitView({ duration: 200, padding: 0.2 }); 
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [nodeCount, getEdges, getNodes, getNode, setNodes, fitView, setEdges]);
}

export default useLayout;
