import { DreamEntry, DreamCategory, DreamInput, DreamCollection } from "@/types/dream";

const API_BASE_URL = "http://127.0.0.1:8000";

export const api = {
    dreams: {
        list: async (): Promise<DreamEntry[]> => {
            try {
                console.log(`Fetching dreams from ${API_BASE_URL}/dreams`);
                const res = await fetch(`${API_BASE_URL}/dreams`, { cache: 'no-store' });
                if (!res.ok) {
                    const text = await res.text();
                    console.error(`Fetch failed: ${res.status} ${res.statusText}`, text);
                    throw new Error(`Failed to fetch dreams: ${res.status} ${res.statusText}`);
                }
                return res.json();
            } catch (error) {
                console.error("API List Error:", error);
                throw error;
            }
        },
        update: async (id: string, data: Partial<DreamEntry>): Promise<DreamEntry> => {
            const res = await fetch(`${API_BASE_URL}/dreams/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update dream");
            return res.json();
        },
        createBatch: async (dreams: DreamEntry[]): Promise<DreamEntry[]> => {
            const res = await fetch(`${API_BASE_URL}/dreams/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dreams),
            });
            if (!res.ok) throw new Error("Failed to save dreams");
            return res.json();
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/dreams/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete dream");
        }
    },
    analyze: async (text: string): Promise<DreamCollection> => {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Analysis failed");
        }
        return res.json();
    }
};
