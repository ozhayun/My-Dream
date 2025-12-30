import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Proxy the streaming response from FastAPI
    const response = await fetch(`${BACKEND_URL}/dreams/${id}/roadmap`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
    }

    // Forward the stream
    return new Response(response.body, {
        headers: {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'chunked',
        },
    });
}
