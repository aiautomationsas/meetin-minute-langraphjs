// state.ts
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { MeetingMinutes, CritiqueOutput } from "../types/meetingMinutes";

export const MinutesGraphState = Annotation.Root({
  audioFile: Annotation<string>(),
  transcript: Annotation<string>(),
  minutes: Annotation<MeetingMinutes>(),
  critique: Annotation<CritiqueOutput>(),
  outputFormatMeeting: Annotation<string>(),
  approved: Annotation<boolean>(),
  currentNode: Annotation<string>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => [],
  })
});