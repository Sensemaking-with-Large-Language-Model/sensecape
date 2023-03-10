import { Instance, InstanceMap } from "../../triggers/semantic-dive/semantic-dive";
import { getInstanceName, SemanticRouteItem } from "../../triggers/semantic-dive/semantic-dive.helper";

/**
 * 
 * @param focusInstance - instance to focus on
 * @param instanceMap - map of instances
 * @returns the path from parent source to focus instance
 */
export const constructRoute = (
  focusInstance: Instance,
  instanceMap: InstanceMap,
) => {
  let path: SemanticRouteItem[] = [];
  while (focusInstance) {
    path.push({
      title: getInstanceName(focusInstance),
      topicId: focusInstance.topicNode.id,
      level: focusInstance.level,
    });
    focusInstance = instanceMap[focusInstance.parentId];
  }
  return path.reverse();
}