
'use server';
/**
 * @fileOverview A flow for handling the AI Coach chat functionality.
 *
 * - coachChat - The main flow function for the AI coach.
 * - CoachChatInput - The input type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Message } from 'ai';

const CoachChatInputSchema = z.object({
  messages: z.array(z.custom<Message>()).describe('The conversation history.'),
  userName: z.string().optional().describe("The user's display name."),
});

export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

export async function coachChat(input: CoachChatInput) {
    return coachChatFlow(input);
}

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: z.string(),
    stream: true,
  },
  async ({ messages, userName }) => {

    const systemPrompt = `You are an expert robotics coach and mentor for the Syrian Robotic Academy. Your role is to assist other coaches with their questions about coaching robotics teams. Provide expert advice on topics like team management, fundraising, competition strategy, student motivation, conflict resolution, and technical guidance (VEX, Arduino, programming).

Your tone should be professional, encouraging, and highly knowledgeable. You are a coach's coach.

When a user asks a question, provide a comprehensive, actionable, and well-structured answer. If you don't know the answer, say so honestly. Do not make up information.

The user you are chatting with is named ${userName || 'Coach'}. Address them by their name when appropriate to make the conversation more personal.
`;
    
    // Defensive filtering: Ensure messages are valid before sending to the model.
    // This is the definitive fix for the "Cannot read properties of undefined (reading 'content')" error.
    const filteredMessages = messages.filter(m => m && m.content);

    const { stream } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: systemPrompt,
        history: filteredMessages,
        config: {
          temperature: 0.5,
        }
    });

    return stream;
  }
);
