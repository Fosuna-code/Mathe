'use server';

/**
 * @fileOverview Summarizes user feedback to identify common issues and areas for improvement.
 *
 * - summarizeUserFeedback - A function that summarizes user feedback.
 * - SummarizeUserFeedbackInput - The input type for the summarizeUserFeedback function.
 * - SummarizeUserFeedbackOutput - The return type for the summarizeUserFeedback function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeUserFeedbackInputSchema = z.object({
  feedback: z
    .string()
    .describe('The user feedback to summarize.  This could be multiple different comments from users.'),
});
export type SummarizeUserFeedbackInput = z.infer<typeof SummarizeUserFeedbackInputSchema>;

const SummarizeUserFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the user feedback.'),
});
export type SummarizeUserFeedbackOutput = z.infer<typeof SummarizeUserFeedbackOutputSchema>;

export async function summarizeUserFeedback(input: SummarizeUserFeedbackInput): Promise<SummarizeUserFeedbackOutput> {
  return summarizeUserFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUserFeedbackPrompt',
  input: {
    schema: z.object({
      feedback: z
        .string()
        .describe('The user feedback to summarize.  This could be multiple different comments from users.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the user feedback.'),
    }),
  },
  prompt: `You are a chatbot administrator. Summarize the following user feedback to identify common issues and areas for improvement in the chatbot's responses.\n\nUser Feedback:\n\n{{{feedback}}}`,
});

const summarizeUserFeedbackFlow = ai.defineFlow<
  typeof SummarizeUserFeedbackInputSchema,
  typeof SummarizeUserFeedbackOutputSchema
>({
  name: 'summarizeUserFeedbackFlow',
  inputSchema: SummarizeUserFeedbackInputSchema,
  outputSchema: SummarizeUserFeedbackOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

