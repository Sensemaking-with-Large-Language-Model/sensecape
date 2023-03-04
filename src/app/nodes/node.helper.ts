import { Node } from "reactflow";
import { uuid } from "../utils";

export const duplicateNode = (node: Node) => {
  const copy: Node = JSON.parse(JSON.stringify(node));
  copy.id = `${node.type}-${uuid()}`;
  copy.parentNode = '';
  return copy;
}