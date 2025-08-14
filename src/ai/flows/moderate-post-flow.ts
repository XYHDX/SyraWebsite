
'use server';
/**
 * @fileOverview A flow for moderating community post content.
 *
 * - moderatePost - A function that handles the post moderation process.
 * - ModeratePostInput - The input type for the moderatePost function.
 * - ModeratePostOutput - The return type for the moderatePost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModeratePostInputSchema = z.object({
  content: z.string().describe('The content of the community post to moderate.'),
});
export type ModeratePostInput = z.infer<typeof ModeratePostInputSchema>;

const ModeratePostOutputSchema = z.object({
  isHarmful: z.boolean().describe('Whether the content is deemed harmful or not.'),
  reason: z.string().describe('A brief explanation if the content is harmful.'),
});
export type ModeratePostOutput = z.infer<typeof ModeratePostOutputSchema>;


export async function moderatePost(input: ModeratePostInput): Promise<ModeratePostOutput> {
  return moderatePostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderatePostPrompt',
  input: {schema: ModeratePostInputSchema},
  output: {schema: ModeratePostOutputSchema},
  prompt: `You are a content moderator for a student-focused robotics community. Your job is to determine if a post contains any harmful content.

Harmful content includes:
- Hate speech
- Harassment
- Violence or threats
- Inappropriate or explicit material
- Spam or advertising

Review the following post content and determine if it violates the policy. If it does, set isHarmful to true and provide a brief, clear reason.

Post Content:
"{{{content}}}"
`,
});

const moderatePostFlow = ai.defineFlow(
  {
    name: 'moderatePostFlow',
    inputSchema: ModeratePostInputSchema,
    outputSchema: ModeratePostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
