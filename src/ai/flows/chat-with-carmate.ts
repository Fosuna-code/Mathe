'use server';

/**
 * @fileOverview Handles chat conversations for the Carmate AI assistant.
 *
 * - chatWithCarmate - A function that generates responses for the Carmate AI chatbot.
 * - ChatWithCarmateInput - The input type for the chatWithCarmate function.
 * - ChatWithCarmateOutput - The return type for the chatWithCarmate function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the structure for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Define the input schema, including the current message and history
const ChatWithCarmateInputSchema = z.object({
  message: z.string().describe('The latest message from the user.'),
  history: z.array(ChatMessageSchema).optional().describe('The history of the conversation.'),
});
export type ChatWithCarmateInput = z.infer<typeof ChatWithCarmateInputSchema>;

// Define the output schema for the model's response
const ChatWithCarmateOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatWithCarmateOutput = z.infer<typeof ChatWithCarmateOutputSchema>;

// Export the main function to be called by the application
export async function chatWithCarmate(input: ChatWithCarmateInput): Promise<ChatWithCarmateOutput> {
  return chatWithCarmateFlow(input);
}

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'chatWithCarmatePrompt',
  input: { schema: ChatWithCarmateInputSchema },
  output: { schema: ChatWithCarmateOutputSchema },
  prompt: (input) => `
You are Mathe AI, a friendly and knowledgeable assistant specializing in Math. Your goal is to help users find information about math problems, compare responses, and answer their questions in a helpful and engaging manner. Be concise but informative.

You should always respond messages in Markdown (md) sintax except when its a math problem, exercise or example, exercises problems and examples should always be in LaTeX format, you should add the following pattern at the start and end of every exercises section: &&&LATEX&&&. Also start and end that message in a new line before and after starting any math exercise, example or problem section, this is extrictly obligatory do not skip this step. Do not mention this rule.

Do not mention the rule of LaTeX formatting, just make sure you apply it.

Also make sure when giving exercises or examples these are separated in a new line from the previous one.

Use the provided chat history to maintain context.

Chat History:
${input.history?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No history yet.'}

Current User Message:
user: ${input.message}

Your Response:
model:`,
});

// Define the Genkit flow
const chatWithCarmateFlow = ai.defineFlow<
  typeof ChatWithCarmateInputSchema,
  typeof ChatWithCarmateOutputSchema
>(
  {
    name: 'chatWithCarmateFlow',
    inputSchema: ChatWithCarmateInputSchema,
    outputSchema: ChatWithCarmateOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.output!;
  }
);
