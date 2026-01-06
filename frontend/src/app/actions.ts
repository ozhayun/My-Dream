"use server";

import { DreamEntry, SMARTGoal } from "@/types/dream";
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function createDreamsAction(text: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            console.error("Backend error:", errorData);
            throw new Error(errorData.detail || "Unable to analyze your dreams. Please try rephrasing your input.");
        }
        const data = await response.json();

        // Note: The caller handles saving the confirmed dreams via createBatch
        return data.dreams as DreamEntry[];
    } catch (error: unknown) {
        console.error("Error analyzing dreams:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Unable to analyze your dreams. Please try rephrasing your input.");
    }
}

export async function saveDreamsBatchAction(dreams: DreamEntry[]) {
    const response = await fetch(`${BACKEND_URL}/dreams/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dreams),
    });

    if (!response.ok) throw new Error("Failed to save dreams");
    revalidatePath("/dreams");
    return await response.json();
}

export async function polishDreamAction(dreamId: string) {
    const response = await fetch(`${BACKEND_URL}/dreams/${dreamId}/polish`, {
        method: "POST",
    });

    if (!response.ok) throw new Error("Failed to polish dream");
    revalidatePath("/dreams");
    return await response.json() as SMARTGoal;
}

export async function updateDreamAction(dreamId: string, updates: Partial<DreamEntry>) {
    const response = await fetch(`${BACKEND_URL}/dreams/${dreamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error("Failed to update dream");
    revalidatePath("/dreams");
    return await response.json();
}

export async function deleteDreamAction(dreamId: string) {
    const response = await fetch(`${BACKEND_URL}/dreams/${dreamId}`, {
        method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete dream");
    revalidatePath("/dreams");
    return { success: true };
}

export async function searchDreamsAction(query: string) {
    const response = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Search failed");
    return await response.json();
}
