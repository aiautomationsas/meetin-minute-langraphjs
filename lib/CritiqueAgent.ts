import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

interface CritiqueInput {
  transcript: string;
  minutes: string;
}

interface CritiqueOutput {
  critique: string;
}

export class CritiqueAgent {
  private llm: ChatFireworks;

  constructor(apiKey: string) {
    this.llm = new ChatFireworks({
      apiKey,
      modelName: "accounts/fireworks/models/mixtral-8x7b-instruct",
      temperature: 0,
      modelKwargs: { max_tokens: 32768 },
    });
  }

  async createCritique({ transcript, minutes }: CritiqueInput): Promise<CritiqueOutput> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are critical of meeting minutes. Your sole purpose is to provide brief feedback on meeting minutes so the writer knows what to fix.

        Respond in Spanish.
        If you think the meeting minutes are good, please return only the word 'None' without any additional text.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    const chain_critique = prompt.pipe(this.llm);

    const today = new Date().toLocaleDateString('en-GB');
    const content = `Today's date is ${today}. This is the minute meeting:
    -----
    ${minutes}
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

    const request_message = new HumanMessage({ content });

    try {
      const result = await chain_critique.invoke({
        messages: [request_message],
      });
      
      console.log("Raw response from model:", result);  

      let critique: string;
      if (typeof result === 'string') {
        critique = result;
      } else if (result && typeof result === 'object' && 'text' in result) {
        critique = (result.text as string).trim();
      } else {
        critique = "None";
      }

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