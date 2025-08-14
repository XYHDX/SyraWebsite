
'use server';
/**
 * @fileOverview A flow for generating images for community posts.
 *
 * - generateImageForPost - A function that handles the image generation.
 * - GenerateImageInput - The input type for the function.
 * - GenerateImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the image to generate for a community post.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
  hint: z.string().describe('A one or two word hint for the image, for alt text and searching.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


export async function generateImageForPost(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const hintPrompt = ai.definePrompt({
    name: 'generateImageHintPrompt',
    input: { schema: z.object({ prompt: z.string() }) },
    output: { schema: z.object({ hint: z.string() }) },
    prompt: 'Based on the following prompt, provide a one or two word hint that can be used for alt text or searching. Prompt: {{{prompt}}}'
});


const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    
    // Generate a hint in parallel
    const hintPromise = hintPrompt(input);
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A vibrant, photorealistic image for a student robotics community: ${input.prompt}. The image should be inspiring and high quality.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const { output: hintOutput } = await hintPromise;

    if (!media?.url) {
      throw new Error("Image generation failed to produce an image.");
    }
    
    return {
      imageUrl: media.url,
      hint: hintOutput?.hint || 'robotics image'
    };
  }
);

    