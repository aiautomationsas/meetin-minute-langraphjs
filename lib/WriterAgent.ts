import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { MeetingMinutes, MinutesOutput, MinutesInput, CritiqueOutput } from '../types/meetingMinutes';



export class WriterAgent {
  private llm: ChatFireworks;

  constructor(apiKey: string) {
    this.llm = new ChatFireworks({
      apiKey,
      modelName: "accounts/fireworks/models/mixtral-8x7b-instruct",
      temperature: 0,
      modelKwargs: { max_tokens: 32768 },
    });
  }

  async write({ transcript, wordCount = 100 }: MinutesInput): Promise<MinutesOutput> {
    const prompt = this.createPrompt('write');
    return this.generateMinutes(transcript, prompt, wordCount);
  }

  async revise({ transcript, critique, minutes }: MinutesInput): Promise<MinutesOutput> {
    const prompt = this.createPrompt('revise');
    return this.generateMinutes(transcript, prompt, undefined, critique?.critique, minutes);
  }

  private createPrompt(type: 'write' | 'revise'): ChatPromptTemplate {
    const formatInstructions = this.getFormatInstructions();
    const systemMessage = this.getSystemMessage(type, formatInstructions);
    return ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      new MessagesPlaceholder("messages"),
    ]);
  }

  private getFormatInstructions(): string {
    return `Respond with a valid JSON object with a single key 'minutes' containing the following fields: 'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message_to_critique'.`;
  }

  private getSystemMessage(type: 'write' | 'revise', formatInstructions: string): string {
    const baseMessage = `As an expert in ${type === 'write' ? 'minute meeting creation' : 'revising meeting minutes'}, you are a chatbot designed to ${type === 'write' ? 'facilitate the process of generating meeting minutes efficiently' : 'improve the minutes based on provided critique'}.\n
    ${formatInstructions}\n
    Explicación de los fields:
    -----
    "title": Title of the meeting,
    "date": Date of the meeting,
    "attendees": Array of objects representing the meeting attendees: Each object must contain the keys: "name", "position" and "role". The key "role" indicates the attendee's function in the meeting. If any of these values is unclear or not mentioned, the default value "none" should be assigned.,
    "summary": "succinctly summarize the minutes of the meeting in 3 clear and coherent paragraphs. Separate paragraphs using newline characters.",
    "takeaways": List of the takeaways of the meeting minute,
    "conclusions": List of conclusions and actions to be taken,
    "next_meeting": List of the commitments made at the meeting. Be sure to go through the entire content of the meeting before giving your answer,
    "tasks": List of dictionaries for the commitments acquired in the meeting. The dictionaries must have the following key values "responsible", "date" and "description". In the key-value  "description", it is advisable to mention specifically what the person in charge is expected to do instead of indicating general actions. Be sure to include all the items in the next_meeting list,
    "message_to_critique": Message to send to the critic in response to each of his comments,
    -----
    Respond in Spanish.
    Do not hallucinate. ${type === 'write' ? 'If you do not find information in the transcript simply answer "Information not provided" for each case.' : ''}
    Ensure that your responses are structured, concise, and provide a comprehensive overview of the meeting proceedings for effective record-keeping and follow-up actions.
    Respond only with the JSON object, no additional text.`;

    return baseMessage;
  }

  private async generateMinutes(
    transcript: string,
    prompt: ChatPromptTemplate,
    wordCount?: number,
    critique?: string,
    minutes?: MeetingMinutes
  ): Promise<MinutesOutput> {
    const chain_writer = prompt.pipe(this.llm);
    const content = this.createContent(transcript, wordCount, critique, minutes);
    const request_message = new HumanMessage({ content });

    try {
      const result = await chain_writer.invoke({ messages: [request_message] });
      const jsonStr = this.extractJSON(result.content as string);
      const parsedResult: MinutesOutput = JSON.parse(jsonStr);
      
      if (!parsedResult.minutes) {
        throw new Error("Invalid minutes structure in response");
      }

      this.ensureMessageToCritiqueIsString(parsedResult.minutes);
      return parsedResult;
    } catch (error) {
      console.error('Error in generateMinutes:', error);
      throw new Error('Failed to generate minutes');
    }
  }

  private createContent(transcript: string, wordCount?: number, critique?: string, minutes?: MeetingMinutes): string {
    const today = new Date().toLocaleDateString('en-GB');
    if (critique && minutes) {
      return `Today's date is ${today}. This is a critique of a meeting.\n
              -----\n
              ${critique}.\n
              -----\n
              Your task will be to write the corrected minutes of the meeting, 
              taking into account each of the comments of the critique and the minutes to be corrected. 
              Should be divided into paragraphs using newline characters.
              You will also have access to the meeting transcript.
      #####
      minutes to correct:
      ${JSON.stringify(minutes)}
      #####
      #####
      critique:
      ${critique}
      #####
      #####
      transcript:
      ${transcript}
      #####`;
    } else {
      return `Today's date is ${today}. This is a transcript of a meeting.\n
              -----\n
              ${transcript}.\n
              -----\n
              Your task is to write up for me the minutes of the meeting described above,
              including all the points of the meeting.
              The meeting minutes should be approximately ${wordCount} words
              and should be divided into paragraphs using newline characters.`;
    }
  }

  private extractJSON(str: string): string {
    const jsonStart = str.indexOf('{');
    const jsonEnd = str.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return str.slice(jsonStart, jsonEnd + 1);
    }
    throw new Error("No valid JSON object found in the string");
  }

  private ensureMessageToCritiqueIsString(minutes: MeetingMinutes): void {
    if (Array.isArray(minutes.message_to_critique)) {
      minutes.message_to_critique = minutes.message_to_critique.join(' ');
    }
  }
}