import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const MinutesGraphState = Annotation.Root({
  audioFile: Annotation<string>(),
  transcript: Annotation<string>(),
  minutes: Annotation<string>(),
  critique: Annotation<string>(),
  outputFormatMeeting: Annotation<string>(),
  approved: Annotation<boolean>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => [],
  })
});