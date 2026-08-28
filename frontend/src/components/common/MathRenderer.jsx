import React from "react";
import MathExplanationRenderer, { DerivationFlow } from "../math/MathExplanationRenderer";

/**
 * Universal LaTeX Math Renderer for PrepPilot
 * Distinctly styles mathematical expressions from normal prose with full KaTeX LaTeX support.
 */
export const MathRenderer = ({ 
  formula, 
  text, 
  block = false, 
  derivationSteps = null,
  title = null,
  conclusion = null,
  className = ""
}) => {
  return (
    <MathExplanationRenderer
      formula={formula}
      content={text}
      isBlock={block}
      derivationSteps={derivationSteps}
      title={title}
      conclusion={conclusion}
      className={className}
    />
  );
};

export { DerivationFlow };
export default MathRenderer;
