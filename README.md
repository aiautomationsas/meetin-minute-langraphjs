# Meetin Minute LangraphJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Overview

Meetin Minute LangraphJS is a web application designed to assist in generating meeting minutes efficiently. It utilizes advanced AI capabilities to analyze transcripts and produce structured meeting summaries.

## Key Features

- Transcription Analysis: Utilizes natural language processing to extract key points from audio recordings.
- Structured Output: Generates meeting minutes in a standardized format, including attendees, actions items, and decisions.
- Revision Workflow: Allows for iterative refinement of meeting minutes through a collaborative process.
- Integration with Database: Stores meeting data in a SQLite database for easy retrieval and analysis.

## Setup Instructions

1. Clone the repository: git clone https://github.com/yourusername/meetin-minute-langraphjs.git cd meetin-minute-langraphjs


2. Install dependencies:
npm install


3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
DB_NAME=/path/to/your/database.sqlite


4. Start the development server:
npm run dev


5. Access the application at http://localhost:3000

## Important Notes

- Database Management: The application uses SQLite for local storage. Ensure proper setup of the database connection string in the `.env.local` file.
- Mejorar la variable transcript en el componente MinutesProcess.tsx en la función:
    const handleRevise = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/generate-minutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript: JSON.stringify(minutes?.summary),
                    critique: critique,
                    minutes: JSON.stringify(minutes)
                }),
- Error Handling: Be aware of potential errors during the generation process, such as "No valid JSON object found in the string". These errors typically occur when there's an issue with the input data or network connectivity.
  ----
 POST /api/generate-minutes 200 in 9402ms
Error in generateMinutes: Error: No valid JSON object found in the string
    at extractJSON (webpack-internal:///(rsc)/./lib/WriterAgent.ts:17:11)
    at WriterAgent.generateMinutes (webpack-internal:///(rsc)/./lib/WriterAgent.ts:131:27)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async RunnableLambda.reviseMinutes [as func] (webpack-internal:///(rsc)/./lib/nodes.ts:55:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/@langchain/core/dist/runnables/base.js:1554:34)
Error details: No valid JSON object found in the string
Error generating or revising minutes: Error: Failed to generate minutes
    at WriterAgent.generateMinutes (webpack-internal:///(rsc)/./lib/WriterAgent.ts:145:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async RunnableLambda.reviseMinutes [as func] (webpack-internal:///(rsc)/./lib/nodes.ts:55:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/@langchain/core/dist/runnables/base.js:1554:34)
- Continuous Improvement: The system is still under development and may encounter bugs or unexpected behavior. Regular updates and improvements are planned to enhance stability and functionality.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or issues on the GitHub repository.