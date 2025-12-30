import { NextResponse } from "next/server";
import { api } from "@/services/api";

export async function GET() {
    try {
        const dreams = await api.dreams.list();
        return NextResponse.json(dreams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Typically POST to /dreams is for single creation, but we have batch at /batch
        // If we want to support single dream creation if needed in future, we can add it.
        // For now, let's allow proxying the batch creation if needed, or assume this is generic.
        // But per requirements, we mainly use /api/dreams for list fetching client-side if needed.
        return NextResponse.json({ message: "Not implemented" }, { status: 501 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
