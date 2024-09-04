It is often useful to have a model return output that matches some specific schema. One common use-case is extracting data from arbitrary text to insert into a traditional database or use with some other downstrem system. This guide will show you a few different strategies you can use to do this.

Prerequisites

This guide assumes familiarity with the following concepts:

-   [Chat models](https://js.langchain.com/v0.2/docs/concepts/#chat-models)

## The `.withStructuredOutput()` method[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#the-.withstructuredoutput-method "Direct link to the-.withstructuredoutput-method")

There are several strategies that models can use under the hood. For some of the most popular model providers, including [Anthropic](https://js.langchain.com/v0.2/docs/integrations/platforms/anthropic/), [Google VertexAI](https://js.langchain.com/v0.2/docs/integrations/platforms/google/), [Mistral](https://js.langchain.com/v0.2/docs/integrations/chat/mistral/), and [OpenAI](https://js.langchain.com/v0.2/docs/integrations/platforms/openai/) LangChain implements a common interface that abstracts away these strategies called `.withStructuredOutput`.

By invoking this method (and passing in [JSON schema](https://json-schema.org/) or a [Zod schema](https://zod.dev/)) the model will add whatever model parameters + output parsers are necessary to get back structured output matching the requested schema. If the model supports more than one way to do this (e.g., function calling vs JSON mode) - you can configure which method to use by passing into that method.

Let’s look at some examples of this in action! We’ll use Zod to create a simple response schema.

### Pick your chat model:

-   OpenAI
-   Anthropic
-   MistralAI
-   Groq
-   VertexAI

#### Install dependencies

-   npm
-   yarn
-   pnpm

#### Add environment variables

```
<span><span>GROQ_API_KEY</span><span>=</span><span>your-api-key</span><br></span>
```

#### Instantiate the model

```
<span><span>import</span><span> </span><span>{</span><span> ChatGroq </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/groq"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> model </span><span>=</span><span> </span><span>new</span><span> </span><span>ChatGroq</span><span>(</span><span>{</span><span></span><br></span><span><span>  model</span><span>:</span><span> </span><span>"mixtral-8x7b-32768"</span><span>,</span><span></span><br></span><span><span>  temperature</span><span>:</span><span> </span><span>0</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><br></span>
```

```
<span><span>import</span><span> </span><span>{</span><span> z </span><span>}</span><span> </span><span>from</span><span> </span><span>"zod"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> joke </span><span>=</span><span> z</span><span>.</span><span>object</span><span>(</span><span>{</span><span></span><br></span><span><span>  setup</span><span>:</span><span> z</span><span>.</span><span>string</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"The setup of the joke"</span><span>)</span><span>,</span><span></span><br></span><span><span>  punchline</span><span>:</span><span> z</span><span>.</span><span>string</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"The punchline to the joke"</span><span>)</span><span>,</span><span></span><br></span><span><span>  rating</span><span>:</span><span> z</span><span>.</span><span>number</span><span>(</span><span>)</span><span>.</span><span>optional</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"How funny the joke is, from 1 to 10"</span><span>)</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> structuredLlm </span><span>=</span><span> model</span><span>.</span><span>withStructuredOutput</span><span>(</span><span>joke</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> structuredLlm</span><span>.</span><span>invoke</span><span>(</span><span>"Tell me a joke about cats"</span><span>)</span><span>;</span><br></span>
```

```
<span><span>{</span><br></span><span><span>  setup: "Why don't cats play poker in the wild?",</span><br></span><span><span>  punchline: "Too many cheetahs.",</span><br></span><span><span>  rating: 7</span><br></span><span><span>}</span><br></span>
```

One key point is that though we set our Zod schema as a variable named `joke`, Zod is not able to access that variable name, and therefore cannot pass it to the model. Though it is not required, we can pass a name for our schema in order to give the model additional context as to what our schema represents, improving performance:

```
<span><span>const</span><span> structuredLlm </span><span>=</span><span> model</span><span>.</span><span>withStructuredOutput</span><span>(</span><span>joke</span><span>,</span><span> </span><span>{</span><span> name</span><span>:</span><span> </span><span>"joke"</span><span> </span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> structuredLlm</span><span>.</span><span>invoke</span><span>(</span><span>"Tell me a joke about cats"</span><span>)</span><span>;</span><br></span>
```

```
<span><span>{</span><br></span><span><span>  setup: "Why don't cats play poker in the wild?",</span><br></span><span><span>  punchline: "Too many cheetahs!",</span><br></span><span><span>  rating: 7</span><br></span><span><span>}</span><br></span>
```

The result is a JSON object.

We can also pass in an OpenAI-style JSON schema dict if you prefer not to use Zod. This object should contain three properties:

-   `name`: The name of the schema to output.
-   `description`: A high level description of the schema to output.
-   `parameters`: The nested details of the schema you want to extract, formatted as a [JSON schema](https://json-schema.org/) dict.

In this case, the response is also a dict:

```
<span><span>const</span><span> structuredLlm </span><span>=</span><span> model</span><span>.</span><span>withStructuredOutput</span><span>(</span><span>{</span><span></span><br></span><span><span>  name</span><span>:</span><span> </span><span>"joke"</span><span>,</span><span></span><br></span><span><span>  description</span><span>:</span><span> </span><span>"Joke to tell user."</span><span>,</span><span></span><br></span><span><span>  parameters</span><span>:</span><span> </span><span>{</span><span></span><br></span><span><span>    title</span><span>:</span><span> </span><span>"Joke"</span><span>,</span><span></span><br></span><span><span>    type</span><span>:</span><span> </span><span>"object"</span><span>,</span><span></span><br></span><span><span>    properties</span><span>:</span><span> </span><span>{</span><span></span><br></span><span><span>      setup</span><span>:</span><span> </span><span>{</span><span> type</span><span>:</span><span> </span><span>"string"</span><span>,</span><span> description</span><span>:</span><span> </span><span>"The setup for the joke"</span><span> </span><span>}</span><span>,</span><span></span><br></span><span><span>      punchline</span><span>:</span><span> </span><span>{</span><span> type</span><span>:</span><span> </span><span>"string"</span><span>,</span><span> description</span><span>:</span><span> </span><span>"The joke's punchline"</span><span> </span><span>}</span><span>,</span><span></span><br></span><span><span>    </span><span>}</span><span>,</span><span></span><br></span><span><span>    required</span><span>:</span><span> </span><span>[</span><span>"setup"</span><span>,</span><span> </span><span>"punchline"</span><span>]</span><span>,</span><span></span><br></span><span><span>  </span><span>}</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> structuredLlm</span><span>.</span><span>invoke</span><span>(</span><span>"Tell me a joke about cats"</span><span>,</span><span> </span><span>{</span><span> name</span><span>:</span><span> </span><span>"joke"</span><span> </span><span>}</span><span>)</span><span>;</span><br></span>
```

```
<span><span>{</span><br></span><span><span>  setup: "Why was the cat sitting on the computer?",</span><br></span><span><span>  punchline: "Because it wanted to keep an eye on the mouse!"</span><br></span><span><span>}</span><br></span>
```

If you are using JSON Schema, you can take advantage of other more complex schema descriptions to create a similar effect.

You can also use tool calling directly to allow the model to choose between options, if your chosen model supports it. This involves a bit more parsing and setup. See [this how-to guide](https://js.langchain.com/v0.2/docs/how_to/tool_calling/) for more details.

### Specifying the output method (Advanced)[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#specifying-the-output-method-advanced "Direct link to Specifying the output method (Advanced)")

For models that support more than one means of outputting data, you can specify the preferred one like this:

```
<span><span>const</span><span> structuredLlm </span><span>=</span><span> model</span><span>.</span><span>withStructuredOutput</span><span>(</span><span>joke</span><span>,</span><span> </span><span>{</span><span></span><br></span><span><span>  method</span><span>:</span><span> </span><span>"json_mode"</span><span>,</span><span></span><br></span><span><span>  name</span><span>:</span><span> </span><span>"joke"</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> structuredLlm</span><span>.</span><span>invoke</span><span>(</span><span></span><br></span><span><span>  </span><span>"Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"</span><span></span><br></span><span><span></span><span>)</span><span>;</span><br></span>
```

```
<span><span>{</span><br></span><span><span>  setup: "Why don't cats play poker in the jungle?",</span><br></span><span><span>  punchline: "Too many cheetahs!"</span><br></span><span><span>}</span><br></span>
```

In the above example, we use OpenAI’s alternate JSON mode capability along with a more specific prompt.

For specifics about the model you choose, peruse its entry in the [API reference pages](https://api.js.langchain.com/).

### (Advanced) Raw outputs[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#advanced-raw-outputs "Direct link to (Advanced) Raw outputs")

LLMs aren’t perfect at generating structured output, especially as schemas become complex. You can avoid raising exceptions and handle the raw output yourself by passing `includeRaw: true`. This changes the output format to contain the raw message output and the `parsed` value (if successful):

```
<span><span>const</span><span> joke </span><span>=</span><span> z</span><span>.</span><span>object</span><span>(</span><span>{</span><span></span><br></span><span><span>  setup</span><span>:</span><span> z</span><span>.</span><span>string</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"The setup of the joke"</span><span>)</span><span>,</span><span></span><br></span><span><span>  punchline</span><span>:</span><span> z</span><span>.</span><span>string</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"The punchline to the joke"</span><span>)</span><span>,</span><span></span><br></span><span><span>  rating</span><span>:</span><span> z</span><span>.</span><span>number</span><span>(</span><span>)</span><span>.</span><span>optional</span><span>(</span><span>)</span><span>.</span><span>describe</span><span>(</span><span>"How funny the joke is, from 1 to 10"</span><span>)</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> structuredLlm </span><span>=</span><span> model</span><span>.</span><span>withStructuredOutput</span><span>(</span><span>joke</span><span>,</span><span> </span><span>{</span><span></span><br></span><span><span>  includeRaw</span><span>:</span><span> </span><span>true</span><span>,</span><span></span><br></span><span><span>  name</span><span>:</span><span> </span><span>"joke"</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> structuredLlm</span><span>.</span><span>invoke</span><span>(</span><span>"Tell me a joke about cats"</span><span>)</span><span>;</span><br></span>
```

```
<span><span>{</span><br></span><span><span>  raw: AIMessage {</span><br></span><span><span>    lc_serializable: true,</span><br></span><span><span>    lc_kwargs: {</span><br></span><span><span>      content: "",</span><br></span><span><span>      tool_calls: [</span><br></span><span><span>        {</span><br></span><span><span>          name: "joke",</span><br></span><span><span>          args: [Object],</span><br></span><span><span>          id: "call_0pEdltlfSXjq20RaBFKSQOeF"</span><br></span><span><span>        }</span><br></span><span><span>      ],</span><br></span><span><span>      invalid_tool_calls: [],</span><br></span><span><span>      additional_kwargs: { function_call: undefined, tool_calls: [ [Object] ] },</span><br></span><span><span>      response_metadata: {}</span><br></span><span><span>    },</span><br></span><span><span>    lc_namespace: [ "langchain_core", "messages" ],</span><br></span><span><span>    content: "",</span><br></span><span><span>    name: undefined,</span><br></span><span><span>    additional_kwargs: {</span><br></span><span><span>      function_call: undefined,</span><br></span><span><span>      tool_calls: [</span><br></span><span><span>        {</span><br></span><span><span>          id: "call_0pEdltlfSXjq20RaBFKSQOeF",</span><br></span><span><span>          type: "function",</span><br></span><span><span>          function: [Object]</span><br></span><span><span>        }</span><br></span><span><span>      ]</span><br></span><span><span>    },</span><br></span><span><span>    response_metadata: {</span><br></span><span><span>      tokenUsage: { completionTokens: 33, promptTokens: 88, totalTokens: 121 },</span><br></span><span><span>      finish_reason: "stop"</span><br></span><span><span>    },</span><br></span><span><span>    tool_calls: [</span><br></span><span><span>      {</span><br></span><span><span>        name: "joke",</span><br></span><span><span>        args: {</span><br></span><span><span>          setup: "Why was the cat sitting on the computer?",</span><br></span><span><span>          punchline: "Because it wanted to keep an eye on the mouse!",</span><br></span><span><span>          rating: 7</span><br></span><span><span>        },</span><br></span><span><span>        id: "call_0pEdltlfSXjq20RaBFKSQOeF"</span><br></span><span><span>      }</span><br></span><span><span>    ],</span><br></span><span><span>    invalid_tool_calls: [],</span><br></span><span><span>    usage_metadata: { input_tokens: 88, output_tokens: 33, total_tokens: 121 }</span><br></span><span><span>  },</span><br></span><span><span>  parsed: {</span><br></span><span><span>    setup: "Why was the cat sitting on the computer?",</span><br></span><span><span>    punchline: "Because it wanted to keep an eye on the mouse!",</span><br></span><span><span>    rating: 7</span><br></span><span><span>  }</span><br></span><span><span>}</span><br></span>
```

## Prompting techniques[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#prompting-techniques "Direct link to Prompting techniques")

You can also prompt models to outputting information in a given format. This approach relies on designing good prompts and then parsing the output of the models. This is the only option for models that don’t support `.with_structured_output()` or other built-in approaches.

### Using `JsonOutputParser`[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#using-jsonoutputparser "Direct link to using-jsonoutputparser")

The following example uses the built-in [`JsonOutputParser`](https://v02.api.js.langchain.com/classes/langchain_core.output_parsers.JsonOutputParser.html) to parse the output of a chat model prompted to match a the given JSON schema. Note that we are adding `format_instructions` directly to the prompt from a method on the parser:

```
<span><span>import</span><span> </span><span>{</span><span> JsonOutputParser </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/core/output_parsers"</span><span>;</span><span></span><br></span><span><span></span><span>import</span><span> </span><span>{</span><span> ChatPromptTemplate </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/core/prompts"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>type</span><span> </span><span>Person</span><span> </span><span>=</span><span> </span><span>{</span><span></span><br></span><span><span>  name</span><span>:</span><span> </span><span>string</span><span>;</span><span></span><br></span><span><span>  height_in_meters</span><span>:</span><span> </span><span>number</span><span>;</span><span></span><br></span><span><span></span><span>}</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>type</span><span> </span><span>People</span><span> </span><span>=</span><span> </span><span>{</span><span></span><br></span><span><span>  people</span><span>:</span><span> Person</span><span>[</span><span>]</span><span>;</span><span></span><br></span><span><span></span><span>}</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> formatInstructions </span><span>=</span><span> </span><span>`</span><span>Respond only in valid JSON. The JSON object you return should match the following schema:</span><br></span><span><span>{{ people: [{{ name: "string", height_in_meters: "number" }}] }}</span><br></span><span><span></span><br></span><span><span>Where people is an array of objects, each with a name and height_in_meters field.</span><br></span><span><span></span><span>`</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>// Set up a parser</span><span></span><br></span><span><span></span><span>const</span><span> parser </span><span>=</span><span> </span><span>new</span><span> </span><span>JsonOutputParser</span><span>&lt;</span><span>People</span><span>&gt;</span><span>(</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>// Prompt</span><span></span><br></span><span><span></span><span>const</span><span> prompt </span><span>=</span><span> </span><span>await</span><span> ChatPromptTemplate</span><span>.</span><span>fromMessages</span><span>(</span><span>[</span><span></span><br></span><span><span>  </span><span>[</span><span></span><br></span><span><span>    </span><span>"system"</span><span>,</span><span></span><br></span><span><span>    </span><span>"Answer the user query. Wrap the output in `json` tags\n{format_instructions}"</span><span>,</span><span></span><br></span><span><span>  </span><span>]</span><span>,</span><span></span><br></span><span><span>  </span><span>[</span><span>"human"</span><span>,</span><span> </span><span>"{query}"</span><span>]</span><span>,</span><span></span><br></span><span><span></span><span>]</span><span>)</span><span>.</span><span>partial</span><span>(</span><span>{</span><span></span><br></span><span><span>  format_instructions</span><span>:</span><span> formatInstructions</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><br></span>
```

Let’s take a look at what information is sent to the model:

```
<span><span>const</span><span> query </span><span>=</span><span> </span><span>"Anna is 23 years old and she is 6 feet tall"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>console</span><span>.</span><span>log</span><span>(</span><span>(</span><span>await</span><span> prompt</span><span>.</span><span>format</span><span>(</span><span>{</span><span> query </span><span>}</span><span>)</span><span>)</span><span>.</span><span>toString</span><span>(</span><span>)</span><span>)</span><span>;</span><br></span>
```

```
<span><span>System: Answer the user query. Wrap the output in `json` tags</span><br></span><span><span>Respond only in valid JSON. The JSON object you return should match the following schema:</span><br></span><span><span>{{ people: [{{ name: "string", height_in_meters: "number" }}] }}</span><br></span><span><span></span><br></span><span><span>Where people is an array of objects, each with a name and height_in_meters field.</span><br></span><span><span></span><br></span><span><span>Human: Anna is 23 years old and she is 6 feet tall</span><br></span>
```

And now let’s invoke it:

```
<span><span>const</span><span> chain </span><span>=</span><span> prompt</span><span>.</span><span>pipe</span><span>(</span><span>model</span><span>)</span><span>.</span><span>pipe</span><span>(</span><span>parser</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> chain</span><span>.</span><span>invoke</span><span>(</span><span>{</span><span> query </span><span>}</span><span>)</span><span>;</span><br></span>
```

```
<span><span>{ people: [ { name: "Anna", height_in_meters: 1.83 } ] }</span><br></span>
```

For a deeper dive into using output parsers with prompting techniques for structured output, see [this guide](https://js.langchain.com/v0.2/docs/how_to/output_parser_structured).

### Custom Parsing[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#custom-parsing "Direct link to Custom Parsing")

You can also create a custom prompt and parser with [LangChain Expression Language (LCEL)](https://js.langchain.com/v0.2/docs/concepts/#langchain-expression-language), using a plain function to parse the output from the model:

```
<span><span>import</span><span> </span><span>{</span><span> AIMessage </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/core/messages"</span><span>;</span><span></span><br></span><span><span></span><span>import</span><span> </span><span>{</span><span> ChatPromptTemplate </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/core/prompts"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>type</span><span> </span><span>Person</span><span> </span><span>=</span><span> </span><span>{</span><span></span><br></span><span><span>  name</span><span>:</span><span> </span><span>string</span><span>;</span><span></span><br></span><span><span>  height_in_meters</span><span>:</span><span> </span><span>number</span><span>;</span><span></span><br></span><span><span></span><span>}</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>type</span><span> </span><span>People</span><span> </span><span>=</span><span> </span><span>{</span><span></span><br></span><span><span>  people</span><span>:</span><span> Person</span><span>[</span><span>]</span><span>;</span><span></span><br></span><span><span></span><span>}</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> schema </span><span>=</span><span> </span><span>`</span><span>{{ people: [{{ name: "string", height_in_meters: "number" }}] }}</span><span>`</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>// Prompt</span><span></span><br></span><span><span></span><span>const</span><span> prompt </span><span>=</span><span> </span><span>await</span><span> ChatPromptTemplate</span><span>.</span><span>fromMessages</span><span>(</span><span>[</span><span></span><br></span><span><span>  </span><span>[</span><span></span><br></span><span><span>    </span><span>"system"</span><span>,</span><span></span><br></span><span><span>    </span><span>`</span><span>Answer the user query. Output your answer as JSON that</span><br></span><span><span>matches the given schema: \`\`\`json\n{schema}\n\`\`\`.</span><br></span><span><span>Make sure to wrap the answer in \`\`\`json and \`\`\` tags</span><span>`</span><span>,</span><span></span><br></span><span><span>  </span><span>]</span><span>,</span><span></span><br></span><span><span>  </span><span>[</span><span>"human"</span><span>,</span><span> </span><span>"{query}"</span><span>]</span><span>,</span><span></span><br></span><span><span></span><span>]</span><span>)</span><span>.</span><span>partial</span><span>(</span><span>{</span><span></span><br></span><span><span>  schema</span><span>,</span><span></span><br></span><span><span></span><span>}</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>/**</span><br></span><span><span> * Custom extractor</span><br></span><span><span> *</span><br></span><span><span> * Extracts JSON content from a string where</span><br></span><span><span> * JSON is embedded between ```json and ``` tags.</span><br></span><span><span> */</span><span></span><br></span><span><span></span><span>const</span><span> extractJson </span><span>=</span><span> </span><span>(</span><span>output</span><span>:</span><span> AIMessage</span><span>)</span><span>:</span><span> </span><span>Array</span><span>&lt;</span><span>People</span><span>&gt;</span><span> </span><span>=&gt;</span><span> </span><span>{</span><span></span><br></span><span><span>  </span><span>const</span><span> text </span><span>=</span><span> output</span><span>.</span><span>content </span><span>as</span><span> </span><span>string</span><span>;</span><span></span><br></span><span><span>  </span><span>// Define the regular expression pattern to match JSON blocks</span><span></span><br></span><span><span>  </span><span>const</span><span> pattern </span><span>=</span><span> </span><span>/</span><span id="code-lang-regex">```json(.*?)```</span><span>/</span><span>gs</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span>  </span><span>// Find all non-overlapping matches of the pattern in the string</span><span></span><br></span><span><span>  </span><span>const</span><span> matches </span><span>=</span><span> text</span><span>.</span><span>match</span><span>(</span><span>pattern</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span>  </span><span>// Process each match, attempting to parse it as JSON</span><span></span><br></span><span><span>  </span><span>try</span><span> </span><span>{</span><span></span><br></span><span><span>    </span><span>return</span><span> </span><span>(</span><span></span><br></span><span><span>      matches</span><span>?.</span><span>map</span><span>(</span><span>(</span><span>match</span><span>)</span><span> </span><span>=&gt;</span><span> </span><span>{</span><span></span><br></span><span><span>        </span><span>// Remove the markdown code block syntax to isolate the JSON string</span><span></span><br></span><span><span>        </span><span>const</span><span> jsonStr </span><span>=</span><span> match</span><span>.</span><span>replace</span><span>(</span><span>/</span><span id="code-lang-regex">```json|```</span><span>/</span><span>g</span><span>,</span><span> </span><span>""</span><span>)</span><span>.</span><span>trim</span><span>(</span><span>)</span><span>;</span><span></span><br></span><span><span>        </span><span>return</span><span> </span><span>JSON</span><span>.</span><span>parse</span><span>(</span><span>jsonStr</span><span>)</span><span>;</span><span></span><br></span><span><span>      </span><span>}</span><span>)</span><span> </span><span>??</span><span> </span><span>[</span><span>]</span><span></span><br></span><span><span>    </span><span>)</span><span>;</span><span></span><br></span><span><span>  </span><span>}</span><span> </span><span>catch</span><span> </span><span>(</span><span>error</span><span>)</span><span> </span><span>{</span><span></span><br></span><span><span>    </span><span>throw</span><span> </span><span>new</span><span> </span><span>Error</span><span>(</span><span>`</span><span>Failed to parse: </span><span>${</span><span>output</span><span>}</span><span>`</span><span>)</span><span>;</span><span></span><br></span><span><span>  </span><span>}</span><span></span><br></span><span><span></span><span>}</span><span>;</span><br></span>
```

Here is the prompt sent to the model:

```
<span><span>const</span><span> query </span><span>=</span><span> </span><span>"Anna is 23 years old and she is 6 feet tall"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>console</span><span>.</span><span>log</span><span>(</span><span>(</span><span>await</span><span> prompt</span><span>.</span><span>format</span><span>(</span><span>{</span><span> query </span><span>}</span><span>)</span><span>)</span><span>.</span><span>toString</span><span>(</span><span>)</span><span>)</span><span>;</span><br></span>
```

```
<span><span>System: Answer the user query. Output your answer as JSON that</span><br></span><span><span>matches the given schema: ```json</span><br></span><span><span>{{ people: [{{ name: "string", height_in_meters: "number" }}] }}</span><br></span><span><span>```.</span><br></span><span><span>Make sure to wrap the answer in ```json and ``` tags</span><br></span><span><span>Human: Anna is 23 years old and she is 6 feet tall</span><br></span>
```

And here’s what it looks like when we invoke it:

```
<span><span>import</span><span> </span><span>{</span><span> RunnableLambda </span><span>}</span><span> </span><span>from</span><span> </span><span>"@langchain/core/runnables"</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>const</span><span> chain </span><span>=</span><span> prompt</span><br></span><span><span>  </span><span>.</span><span>pipe</span><span>(</span><span>model</span><span>)</span><span></span><br></span><span><span>  </span><span>.</span><span>pipe</span><span>(</span><span>new</span><span> </span><span>RunnableLambda</span><span>(</span><span>{</span><span> func</span><span>:</span><span> extractJson </span><span>}</span><span>)</span><span>)</span><span>;</span><span></span><br></span><span><span></span><br></span><span><span></span><span>await</span><span> chain</span><span>.</span><span>invoke</span><span>(</span><span>{</span><span> query </span><span>}</span><span>)</span><span>;</span><br></span>
```

```
<span><span>[</span><br></span><span><span>  { people: [ { name: "Anna", height_in_meters: 1.83 } ] }</span><br></span><span><span>]</span><br></span>
```

## Next steps[](https://js.langchain.com/v0.2/docs/how_to/structured_output/#next-steps "Direct link to Next steps")

Now you’ve learned a few methods to make a model output structured data.

To learn more, check out the other how-to guides in this section, or the conceptual guide on tool calling.