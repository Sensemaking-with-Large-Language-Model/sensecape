
/**
 * Checks if highlight range is highlighting the same element, namely
 * innertext of parent element with nothing in between
 * @param highlightRange 
 * @returns 
*/
const isHighlightable = (highlightRange: Range): boolean => {
  if (!highlightRange.toString()) {
    return false;
  }
  const parentNode = highlightRange.commonAncestorContainer;
  if (parentNode.nodeName !== '#text') {
    return false;
  }
  return true;
}

export { isHighlightable };