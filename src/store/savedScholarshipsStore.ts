import { create } from "zustand";

interface SavedScholarshipItem {
  id: string;
  title: string;
  provider?: string | null;
  slug?: string | null;
}

interface SavedScholarshipsState {
  savedScholarships: SavedScholarshipItem[];
  toggleSaved: (scholarship: SavedScholarshipItem) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedScholarshipsStore = create<SavedScholarshipsState>((set, get) => ({
  savedScholarships: [],
  toggleSaved: (scholarship) => {
    const current = get().savedScholarships;
    const exists = current.some((item) => item.id === scholarship.id);

    set({
      savedScholarships: exists
        ? current.filter((item) => item.id !== scholarship.id)
        : [...current, scholarship],
    });
  },
  isSaved: (id) => get().savedScholarships.some((item) => item.id === id),
}));
