import { useEffect, useState } from "react";
import { NodeProps } from "reactflow";
import { getGPT3Term } from "../../../api/openai-api";
import { ResponseState } from "../../components/gpt-input/gpt-input.model";
import { TypeTopicNode } from "../topic-node/topic-node.model";

const ConceptNode = (props: NodeProps) => {
  const [responseState, setResponseState] = useState(ResponseState.INPUT);
  const [concept, setConcept] = useState('');

  const generateConceptFromTopics = async (context: string, prompt: string) => {
    if (!prompt) return;

    setResponseState(ResponseState.LOADING);

    const response = await getGPT3Term(
      context, prompt
    ) || 'Error: no response received';

    setConcept(response);
    setResponseState(ResponseState.COMPLETE);
  }

  // When concept node renders, gpt3 is called
  useEffect(() => {
    if (!concept && props.data.topicNodes.length > 0) {
      // TODO: Too much duplicate strings. Make this a linear timeline
      const conceptContext = '';
      // const conceptContext = props.data.topicNodes.join('\n\n')
      const prompt = `${props.data.topicNodes
        .map((node: TypeTopicNode) => node.data.topicName).join(', ')}\n\n
        What is the overarching concept? (1-3 words)`;
      generateConceptFromTopics(conceptContext, prompt);
    }
  }, []);

  if (responseState === ResponseState.INPUT) {
    return (
      <div className="concept-node"
        onBlur={() => setResponseState(ResponseState.COMPLETE)}
      >
        <form
          onSubmit={(event) => {
            setResponseState(ResponseState.COMPLETE);
            event.preventDefault();
          }}
        >
          <input 
            name="text"
            type="text"
            placeholder="Enter concept"
            autoFocus
            autoComplete='off'
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
          />
        </form>
      </div>
    )
  } else if (responseState === ResponseState.LOADING) {
    return (
      <div className="concept-node">Generating concept...</div>
    )
  } else {
    return (
      <div
        className="concept-node"
        onClick={() => setResponseState(ResponseState.INPUT)}
      >{concept || 'Enter concept'}</div>
    )
  }
}

export default ConceptNode;