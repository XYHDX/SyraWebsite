
'use server';
/**
 * @fileOverview Genkit tools for interacting with competition data.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Using client SDK is fine here for reads

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
    const competitionsCol = collection(db, "competitions");
    const q = query(
        competitionsCol, 
        where("status", "==", "Upcoming"), 
        orderBy("date", "asc"), 
        limit(count)
    );

    const competitionSnapshot = await getDocs(q);
    const competitionsList = competitionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            date: data.date.toDate().toLocaleDateString(),
            status: data.status
        };
    });
    
    return competitionsList;
  }
);
