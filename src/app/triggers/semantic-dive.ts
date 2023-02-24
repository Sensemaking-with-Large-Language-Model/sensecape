import { Dispatch, SetStateAction } from "react";
import { getRectOfNodes, ReactFlowInstance, ReactFlowJsonObject } from "reactflow";
import { TypeTopicNode } from "../nodes/topic-node/topic-node.model";
import { zoomLimits } from "../utils";


export interface Instance {
  name: string;
  originalName?: string; // If name of Instance has already been created
  parent: string;
  children: string[];
  topicNode: TypeTopicNode | null;
  instance: ReactFlowJsonObject | null;
  level: number;
};

export enum InstanceState {
  none = 'NONE',          // Never was an instance state
  current = 'CURRENT',    // Is currently the instance state
  was = 'WAS',            // Has been the instance state
}

/**
 * Dives into a topic node to open a new canvas for deeper exploration
 * @param nodeMouseOver 
 * @param similarInstances 
 * @param instanceMap 
 * @param currentTopic 
 * @param semanticRoute 
 * @param reactFlowInstance 
 */
export const semanticDiveIn = (
  nodeMouseOver: TypeTopicNode,
  similarInstances: Map<string, string[]>,
  [instanceMap, setInstanceMap]: [Map<string, Instance>, Dispatch<SetStateAction<Map<string, Instance>>>],
  [currentTopic, setCurrentTopic]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  // Save topic name
  let topicName = nodeMouseOver.data.topicName;

  // If topic node has never doven in before, create a new Instance
  if (nodeMouseOver.data.instanceState === InstanceState.none) {
    // If topic name already exists, update topic name and save
    if (similarInstances.has(topicName)) {
      // Edge case: this new string could also already be a topic name, but unlikely.
      topicName += ` (ver. ${similarInstances.get(topicName)?.length ?? 0 + 1})`;
      similarInstances.get(topicName)?.push(topicName);
    } else {
      similarInstances.set(topicName, [topicName]);
    }

    // Create New Instance
    const newInstance: Instance = {
      name: topicName,
      parent: currentTopic,
      children: [],
      topicNode: nodeMouseOver,
      instance: null,
      level: instanceMap.get(currentTopic)?.level ?? 0 + 1,
    }
  
    // Set original name
    if (topicName !== nodeMouseOver.data.topicName) {
      newInstance.originalName = nodeMouseOver.data.topicName;
    }
    setInstanceMap(instanceMap.set(topicName, newInstance));
  }

  // Save current instance state to the parent instance
  const currentInstance = instanceMap.get(currentTopic)!;
  currentInstance.instance = reactFlowInstance.toObject();

  // Set topic as current instance
  nodeMouseOver.data.instanceState = InstanceState.current;
  setCurrentTopic(topicName);
  setSemanticRoute(semanticRoute.concat(topicName));

  // Store all parent nodes and show new canvas
  reactFlowInstance.setNodes([nodeMouseOver]);
  reactFlowInstance.setEdges([]);

  // Transition into new canvas
  reactFlowInstance.zoomTo(0.8);
  reactFlowInstance.fitView({
    duration: 400,
    padding: 7,
    maxZoom: zoomLimits.max,
    minZoom: zoomLimits.min,
    nodes: [nodeMouseOver]
  });
}

/**
 * Dives out of current canvas to higher level
 * @param instanceMap 
 * @param currentTopic 
 * @param semanticRoute
 * @param reactFlowInstance 
 */
export const semanticDiveOut = (
  instanceMap: Map<string, Instance>,
  [currentTopic, setCurrentTopic]: [string, Dispatch<SetStateAction<string>>],
  [semanticRoute, setSemanticRoute]: [string[], Dispatch<SetStateAction<string[]>>],
  reactFlowInstance: ReactFlowInstance,
) => {
  const currentInstance = instanceMap.get(currentTopic)!;
  const parentInstance = instanceMap.get(currentInstance.parent);

  if (parentInstance) {
    // store current reactFlowInstance
    currentInstance.instance = reactFlowInstance.toObject();

    // Set topic as parent topic
    currentInstance.topicNode!.data.instanceState = InstanceState.was;
    setCurrentTopic(parentInstance.name);
    setSemanticRoute(semanticRoute.slice(0, -1));

    // recover parent reactFlowInstance
    reactFlowInstance.setNodes(parentInstance.instance!.nodes);
    reactFlowInstance.setEdges(parentInstance.instance!.edges);

    // Transition
    reactFlowInstance.zoomTo(2);
    reactFlowInstance.fitView({
      duration: 400,
      padding: 0,
      maxZoom: zoomLimits.max,
      minZoom: zoomLimits.min
    });
  }
}