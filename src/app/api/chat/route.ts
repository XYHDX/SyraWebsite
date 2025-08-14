import { NextRequest, NextResponse } from 'next/server';
import { coachChat } from '@/ai/flows/coach-chat-flow';
import type { Message } from 'ai';
import { StreamingTextResponse } from 'ai';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userName } = body;
    
    // Explicit validation based on user feedback
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing or invalid `messages` array in request body' }, { status: 400 });
    }

    // Filter out any messages that are null, undefined, or lack content.
    const filteredMessages = messages.filter(m => m && m.content);

    if (filteredMessages.length === 0) {
        return NextResponse.json({ error: 'No valid messages with content found' }, { status: 400 });
    }

    const input = {
        messages: filteredMessages as Message[],
        userName: userName || 'Coach',
    };

    const stream = await coachChat(input);
    return new StreamingTextResponse(stream);
    
  } catch (error: any) {
    console.error(`Error in chat route:`, error);
    // Provide a more specific error message if available
    const errorMessage = error.message || 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
