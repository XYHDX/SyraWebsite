
'use server';
/**
 * @fileOverview Genkit tools for interacting with competition data.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/db';

export const getUpcomingCompetitions = ai.defineTool(
  {
    name: 'getUpcomingCompetitions',
    description: 'Returns a list of upcoming robotics competitions.',
    inputSchema: z.object({
      count: z.number().optional().default(3).describe('The number of competitions to return.'),
    }),
    outputSchema: z.array(z.object({
        name: z.string().describe('The name of the competition.'),
        date: z.string().describe('The date of the competition.'),
        status: z.string().describe('The status of the competition (e.g., Upcoming).')
    })),
  },
  async ({ count }) => {
    console.log(`Getting ${count} upcoming competitions...`);
    
    // For now, return mock data since we haven't migrated competitions to Prisma yet
    const mockCompetitions = [
      {
        name: "VEX Robotics Competition",
        date: "2024-03-15",
        status: "Upcoming"
      },
      {
        name: "FIRST Robotics Competition",
        date: "2024-04-20",
        status: "Upcoming"
      },
      {
        name: "Arduino Innovation Challenge",
        date: "2024-05-10",
        status: "Upcoming"
      }
    ];
    
    return mockCompetitions.slice(0, count);
  }
);
