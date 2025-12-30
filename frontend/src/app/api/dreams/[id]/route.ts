import { NextResponse } from "next/server";
import { api } from "@/services/api";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const updates = await request.json();
        const updatedDream = await api.dreams.update(id, updates);
        return NextResponse.json(updatedDream);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
