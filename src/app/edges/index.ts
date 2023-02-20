import TravellerEdge from './traveller-edge/traveller-edge';
import PlaceholderEdge from './PlaceholderEdge';
import WorkflowEdge from './WorkflowEdge';

export const edgeTypes = {
  placeholder: PlaceholderEdge,
  workflow: WorkflowEdge,
  traveller: TravellerEdge,
  // subtopic: SubTopicEdge,
  // suptopic: SupTopicEdge,
};

export default edgeTypes;
