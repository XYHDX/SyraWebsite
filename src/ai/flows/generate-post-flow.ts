
'use server';
/**
 * @fileOverview A flow for generating community post content.
 *
 * - generatePost - A function that handles the post generation process.
 * - GeneratePostInput - The input type for the generatePost function.
 * - GeneratePostOutput - The return type for the generatePost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostInputSchema = z.object({
  topic: z.string().describe('The topic for the community post.'),
});
export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>;

const GeneratePostOutputSchema = z.object({
  postTitle: z.string().describe('A catchy and relevant title for the post.'),
  postContent: z.string().describe('The generated content for the community post, written in markdown format.'),
});
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;


export async function generatePost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  return generatePostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: {schema: GeneratePostInputSchema},
  output: {schema: GeneratePostOutputSchema},
  prompt: `You are an expert in robotics and community engagement for the Syrian Robotic Academy. Your task is to generate an engaging and informative community post based on a given topic. The post should be encouraging and suitable for students interested in robotics.

The output should be in markdown format.

Topic: {{{topic}}}

Generate a title and the post content.
`,
});

const generatePostFlow = ai.defineFlow(
  {
    name: 'generatePostFlow',
    inputSchema: GeneratePostInputSchema,
    outputSchema: GeneratePostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
