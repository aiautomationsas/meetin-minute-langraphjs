// workflow.ts
import { END, START, StateGraph } from '@langchain/langgraph';
import { SqliteSaver } from '@langchain/langgraph/checkpoint/sqlite';
import { readTranscript, createMinutes, createCritique, 
        approveMinutes, outputMeeting, reviseMinutes } from './nodes';
import { MinutesGraphState } from './state';

export const DB_NAME = 'langgraph_memory.db';

const shouldContinue = (state: typeof MinutesGraphState.State) => {
  const { approved } = state;
  if (approved === true) {
    return "output_meeting";
  }
  return "create_critique";
};

const chooseStartNode = (state: typeof MinutesGraphState.State) => {
  return state.currentNode || "read_transcript";
};

// Create the graph
const workflow = new StateGraph(MinutesGraphState)
  .addNode("read_transcript", readTranscript)
  .addNode("create_minutes", createMinutes)
  .addNode("create_critique", createCritique)
  .addNode("revise_minutes", reviseMinutes)
  .addNode("approve_minutes", approveMinutes)
  .addNode("output_meeting", outputMeeting)
  .addConditionalEdges(START, chooseStartNode)
  .addEdge("read_transcript", "create_minutes")
  .addEdge("create_minutes", "create_critique")
  .addEdge("create_critique", "approve_minutes")
  .addConditionalEdges("approve_minutes", shouldContinue)
  .addEdge("revise_minutes", "create_critique")
  .addEdge("output_meeting", END);

export const memory = SqliteSaver.fromConnString(DB_NAME);

// Compile the graph
export const app = workflow.compile({ checkpointer: memory });