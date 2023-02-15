import './button-generate-concept.scss';

const GenerateConceptButton = (props: any) => {
  return (
    <button onClick={props.generateConceptNode} className="generate-concept-button">
      Generate Concept
    </button>
  );
}

export default GenerateConceptButton;