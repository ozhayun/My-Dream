import { DreamEntry, DreamCollection, DreamCategory } from "@/types/dream";
import { getDreams, saveDreamsBatchAction, updateDreamAction, deleteDreamAction, createDreamsAction } from "@/app/actions";

// This API layer now uses server actions instead of the old backend
// All data is stored in Supabase

export const api = {
    dreams: {
        list: async (): Promise<DreamEntry[]> => {
            try {
                return await getDreams();
            } catch (error) {
                console.error("API List Error:", error);
                throw error;
            }
        },
        get: async (id: string): Promise<DreamEntry> => {
            // Get all dreams and find by id
            const dreams = await getDreams();
            const dream = dreams.find(d => d.id === id);
            if (!dream) throw new Error("Dream not found");
            return dream;
        },
        update: async (id: string, data: Partial<DreamEntry>): Promise<DreamEntry> => {
            return await updateDreamAction(id, data);
        },
        createBatch: async (dreams: DreamEntry[]): Promise<DreamEntry[]> => {
            return await saveDreamsBatchAction(dreams);
        },
        delete: async (id: string): Promise<void> => {
            await deleteDreamAction(id);
        }
    },
    analyze: async (text: string): Promise<DreamCollection> => {
        const dreams = await createDreamsAction(text);
        return { dreams };
    }
};
