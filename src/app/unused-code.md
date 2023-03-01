# Unused Code in flow.tsx:


// this drops node containing extended topic at location where dragging from handle stops
// currently disabled, however, to switch to interaction where users can simply click on handle to create extended topic
// extended topic is intelligently placed at right location (so that users do not have to manually do this)
```
  const onConnectEnd = useCallback(
    async (event: any) => {
      console.log('event', event);
      console.log('event.target', event.target);
      // console.log('onConnectEnd');
      // get bounding box to find exact location of cursor
      const reactFlowBounds = 
        reactFlowWrapper?.current?.getBoundingClientRect();
        

      if (reactFlowInstance) {
        // select concept node & get text box input value
        const nodeElement: any = document.querySelectorAll(
          `[data-id="${connectingNodeId.current}"]`
        )[0];
        const currentValue: any =
          nodeElement.getElementsByClassName("text-input")[0].value;

        // get (sub-, sup-, related-) topics from GPT
        const topics: any = await generateTopic("bottom", currentValue);

        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const id = "generated-topic-" + uuid();
        console.log(id);
        const newNode: any = {
          id,
          position,
          // data: { label: `Node ${id}` },
          data: { label: topics[Math.floor((Math.random() * 10) % 5)] },
        };

        const newEdge: Edge = {
          id: `edge-${uuid()}`,
          source: connectingNodeId.current,
          sourceHandle: "c",
          target: newNode.id,
          data: {},
        };

        reactFlowInstance.setNodes((nds) => nds.concat(newNode));
        reactFlowInstance.setEdges((eds) => eds.concat(newEdge));
      }
    },
    [reactFlowInstance]
  );
```

// this function is used for generating sub- or sup- topics 
// specifically, it determines prompt based on which handle is clicked
// and then it calls another function getTopics() to receive and return generated sub- or sup- topics
```
  const generateTopic = (pos: string, concept: string) => {
    let prompt = "";
    if (pos === "top") {
      prompt = "Give me 5 higher level topics of " + concept;
    } else if (pos === "bottom") {
      prompt = "Give me 5 lower level topics of " + concept;
    } else if (pos === "right" || pos === "left") {
      prompt =
        "Give me 5 related topics of " +
        concept +
        " at this level of abstraction";
    }
    const topics = getTopics(prompt, concept);

    return topics;
  };
```