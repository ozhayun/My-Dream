export interface DreamInput {
    text: string;
    age?: number;
}

export type DreamCategory =
    | "Career & Business"
    | "Finance & Wealth"
    | "Health & Wellness"
    | "Relationships & Family"
    | "Travel & Adventure"
    | "Skills & Knowledge"
    | "Lifestyle & Hobbies"
    | "Other";

export interface DreamEntry {
    id: string;
    title: string;
    category: DreamCategory;
    suggested_target_year: number;
    completed: boolean;
}

export interface DreamCollection {
    dreams: DreamEntry[];
}
