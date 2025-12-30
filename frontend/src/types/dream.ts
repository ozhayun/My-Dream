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

export interface Milestone {
    id: string;
    title: string;
    target_year: number;
    completed: boolean;
}

export interface SMARTGoal {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    time_bound: string;
    polished_title: string;
}

export interface JournalEntry {
    id: string;
    content: string;
    created_at: string;
    updated_at?: string;
}

export interface DreamEntry {
    id: string;
    title: string;
    category: DreamCategory;
    suggested_target_year: number;
    completed: boolean;
    is_polished?: boolean;
    smart_data?: SMARTGoal;
    milestones?: Milestone[];
    journal_entries?: JournalEntry[];
    notes?: string;
}

export interface DreamCollection {
    dreams: DreamEntry[];
}

