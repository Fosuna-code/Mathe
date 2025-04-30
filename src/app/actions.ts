'use server';

import { chatWithCarmate, type ChatWithCarmateInput } from '@/ai/flows/chat-with-carmate';
import { summarizeUserFeedback, type SummarizeUserFeedbackInput } from '@/ai/flows/summarize-user-feedback';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function handleChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const input: ChatWithCarmateInput = { message, history };
  try {
    const { response } = await chatWithCarmate(input);
    return response;
  } catch (error) {
    console.error("Error in chatWithCarmate flow:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}

export async function handleFeedback(
    feedback: string,
    chatHistory: ChatMessage[]
): Promise<string> {
    // Combine chat history and explicit feedback for summarization
    const feedbackContext = `Chat History:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser Feedback: ${feedback}`;

    const input: SummarizeUserFeedbackInput = { feedback: feedbackContext };
    try {
        const { summary } = await summarizeUserFeedback(input);
        console.log("Feedback Summary:", summary); // Log summary for potential backend use/analysis
        // In a real application, you might store this summary, associate it with the user session,
        // or use it to fine-tune the model (Reinforcement Learning step).
        // For now, we just log it and return a confirmation message.
        return "Thank you for your feedback! It helps me learn and improve.";
    } catch (error) {
        console.error("Error in summarizeUserFeedback flow:", error);
        return "Sorry, I couldn't process your feedback at this time.";
    }
}
