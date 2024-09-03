import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { MeetingMinutes, CritiqueInput, CritiqueOutput } from "../types/meetingMinutes";

export class CritiqueAgent {
  private llm: ChatFireworks;
  private prompt: ChatPromptTemplate;

  constructor(apiKey: string) {
    this.llm = new ChatFireworks({
      apiKey,
      modelName: "accounts/fireworks/models/mixtral-8x7b-instruct",
      temperature: 0,
      modelKwargs: { max_tokens: 32768 },
    });

    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", this.getSystemPrompt()],
      new MessagesPlaceholder("messages"),
    ]);
  }

  private getSystemPrompt(): string {
    return `You are critical of meeting minutes. Your sole purpose is to provide brief feedback on meeting minutes so the writer knows what to fix.

    Respond in Spanish.
    If you think the meeting minutes are good, please return only the word 'None' without any additional text.`;
  }

  private getContent(minutes: MeetingMinutes, transcript: string): string {
    const today = new Date().toLocaleDateString('en-GB');
    return `Today's date is ${today}. This is the minute meeting:
    -----
    ${JSON.stringify(minutes, null, 2)}
    -----

    Your task is to provide feedback on the meeting minutes only if necessary.
    Be sure that names are given for split votes and for debate.
    The maker of each motion should be named.
    
    This is the transcript of the meeting:
    -----
    Transcription:
    ${transcript}
    -----
    `;
  }


  private processCritiqueResult(result: any): string {
    if (typeof result === 'string') {
      return result;
    } else if (result && typeof result === 'object' && 'text' in result) {
      return (result.text as string).trim();
    }
    return "None";
  }

  async createCritique({ transcript, minutes }: CritiqueInput): Promise<CritiqueOutput> {
    const chain_critique = this.prompt.pipe(this.llm);
    const content = this.getContent(minutes, transcript);
    const request_message = new HumanMessage({ content: content });

    try {
      const result = await chain_critique.invoke({ messages: [request_message] });
      console.log("Raw response from model:", result);
      const critique = this.processCritiqueResult(result);
      return { critique };
    } catch (error) {
      console.error('Error in createCritique:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw new Error('Failed to generate critique');
    }
  }
}