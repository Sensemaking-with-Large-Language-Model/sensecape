import { ChatCompletionRequestMessage } from "openai";
import { Dispatch, SetStateAction } from "react";
import { ReactFlowInstance } from "reactflow";
import { TypeChatNode } from "../../nodes/chat-node/chat-node.model";
import { TypeMemoNode } from "../../nodes/memo-node/memo-node.model";
import { TopicNodeData } from "../../nodes/topic-node/topic-node.model";
import { InstanceState } from "../semantic-dive/semantic-dive";

// When a highlight is dragged out of text
export const onDragStart = (
  sourceNodeId: string,
  event: any,
  nodeType: string,
  context: ChatCompletionRequestMessage[],
  topicName: string,
  reactFlowInstance: ReactFlowInstance
) => {
  event.dataTransfer.setData('dragNodeType', nodeType);
  event.dataTransfer.effectAllowed = 'move';
  const currNode: TypeMemoNode | TypeChatNode | undefined = reactFlowInstance.getNode(sourceNodeId);
  if (currNode) {
    const data = JSON.stringify({
      parentId: sourceNodeId,
      chatHistory: [
        ...context,
        {
          role: 'user',
          content: topicName
        }
      ],
      instanceState: InstanceState.NONE,
      state: {
        topic: topicName
      }
    } as TopicNodeData);
    console.log(data);
    event.dataTransfer.setData('dragNodeData', data);
  }
};

export const highlightSelection = (
  sourceNodeId: string,
  context: ChatCompletionRequestMessage[],
  [highlightIds, setHighlightIds]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance
) => {
  const selection = document.getSelection();
  if ((selection?.rangeCount ?? 0) <= 0) {
    return;
  }
  const range: Range = selection?.getRangeAt(0) ?? new Range;
  const selectedText = range.toString();
  if (isHighlightable(range)) {
    const highlight = document.createElement('highlight-text', {is: selectedText});
    highlight.draggable = true;
    highlight.innerHTML = selectedText;
    range.surroundContents(highlight);
    highlight.classList.add('highlight-elm');
    highlight.id = `highlight-${highlightIds.length}`;
    setHighlightIds(highlightIds.concat([highlight.id]));

    highlight.addEventListener('click', (event) => {
      range.extractContents();
      range.insertNode(document.createTextNode(selectedText));
      range.commonAncestorContainer.normalize();
    })
    highlight.addEventListener('dragstart', (event) => {
      onDragStart(
        sourceNodeId,
        event,
        'topic',
        context,
        selectedText,
        reactFlowInstance
      );
    })
    window.getSelection()?.removeAllRanges();
  }
}

/**
 * Checks if highlight range is highlighting the same element, namely
 * innertext of parent element with nothing in between
 * @param highlightRange 
 * @returns 
*/
export const isHighlightable = (highlightRange: Range): boolean => {
  if (!highlightRange.toString()) {
    return false;
  }
  const parentNode = highlightRange.commonAncestorContainer;
  if (parentNode.nodeName !== '#text') {
    return false;
  }
  return true;
}
