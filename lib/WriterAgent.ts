import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

interface Attendee {
  name: string;
  position: string;
  role: string;
}

interface Task {
  responsible: string;
  date: string;
  description: string;
}

interface MinutesOutput {
  minutes: {
    title: string;
    date: string;
    attendees: Attendee[];
    summary: string;
    takeaways: string[];
    conclusions: string[];
    next_meeting: string[];
    tasks: Task[];
    message_to_critique: string[];
  };
}

interface MinutesInput {
  transcript: string;
  wordCount?: number;
  critique?: string;
  minutes?: MinutesOutput;
}

function extractJSON(str: string): string {
  const jsonStart = str.indexOf('{');
  const jsonEnd = str.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return str.slice(jsonStart, jsonEnd + 1);
  }
  throw new Error("No valid JSON object found in the string");
}

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
    const formatInstructions = `Respond with a valid JSON object with a single key 'minutes' containing the following fields: 'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message_to_critique'.`;

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `As an expert in minute meeting creation, you are a chatbot designed to facilitate the process of generating meeting minutes efficiently.\n
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
          Do not hallucinate. If you do not find information in the transcript simply answer "Information not provided" for each case.
          Ensure that your responses are structured, concise, and provide a comprehensive overview of the meeting proceedings for effective record-keeping and follow-up actions.
          Respond only with the JSON object, no additional text.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);
    const response = this.generateMinutes(transcript, prompt, wordCount);
    console.log("writer response: ", response )
    return response
  }

  async revise({ transcript, critique, minutes }: MinutesInput): Promise<MinutesOutput> {
    const formatInstructions = `Respond with a valid JSON object with a single key 'minutes' containing the following fields: 'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message_to_critique'.`;

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `As an expert in revising meeting minutes, you are a chatbot designed to improve the minutes based on provided critique.\n
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
          Do not hallucinate. 
          Ensure that your responses are structured, concise, and provide a comprehensive overview of the meeting proceedings for effective record-keeping and follow-up actions.
          Respond only with the JSON object, no additional text.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    return this.generateMinutes(transcript, prompt, undefined, critique, minutes);
  }

  private async generateMinutes(
    transcript: string,
    prompt: ChatPromptTemplate,
    wordCount?: number,
    critique?: string,
    minutes?: MinutesOutput
  ): Promise<MinutesOutput> {
    const chain_writer = prompt.pipe(this.llm);

    const today = new Date().toLocaleDateString('en-GB');
    const content = critique
      ? `Today's date is ${today}. This is a critique of a meeting.\n
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
        #####
`
      : `Today's date is ${today}. This is a transcript of a meeting.\n
                    -----\n
                    ${transcript}.\n
                    -----\n
                    Your task is to write up for me the minutes of the meeting described above,
                    including all the points of the meeting.
                    The meeting minutes should be approximately ${wordCount} words
                    and should be divided into paragraphs using newline characters.`;

    const request_message = new HumanMessage({ content });

    try {
      const result = await chain_writer.invoke({
        messages: [request_message],
      });

      let jsonStr: string;
      if (typeof result.content === 'string') {
        jsonStr = extractJSON(result.content);
      } else {
        throw new Error("Unexpected response format from model");
      }

      const parsedResult: MinutesOutput = JSON.parse(jsonStr);
      
      if (!parsedResult.minutes) {
        throw new Error("Invalid minutes structure in response");
      }

      return parsedResult;
    } catch (error) {
      console.error('Error in generateMinutes:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw new Error('Failed to generate minutes');
    }
  }
}