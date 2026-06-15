import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DegreeLevel, FundingType } from '@prisma/client';

interface ScholarshipFilters {
  searchQuery: string;
  countries: string[];
  fundingTypes: FundingType[];
  degreeLevels: DegreeLevel[];
  gpaRange: [number, number];
  ieltsRange: [number, number];
  deadline: string; // '7', '30', '90', 'all'
  fieldsOfStudy: string[];
  sortOption: string; // 'best_match', 'newest', 'deadline', 'most_saved', 'most_viewed'
}

interface FilterStore extends ScholarshipFilters {
  setSearchQuery: (query: string) => void;
  toggleCountry: (country: string) => void;
  toggleFundingType: (type: FundingType) => void;
  toggleDegreeLevel: (level: DegreeLevel) => void;
  setGpaRange: (range: [number, number]) => void;
  setIeltsRange: (range: [number, number]) => void;
  setDeadline: (deadline: string) => void;
  toggleFieldOfStudy: (field: string) => void;
  setSortOption: (sort: string) => void;
  resetFilters: () => void;
}

const initialState: ScholarshipFilters = {
  searchQuery: '',
  countries: [],
  fundingTypes: [],
  degreeLevels: [],
  gpaRange: [0, 4.0],
  ieltsRange: [0, 9.0],
  deadline: 'all',
  fieldsOfStudy: [],
  sortOption: 'best_match',
};

export const useScholarshipFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleCountry: (country) => set((state) => ({
        countries: state.countries.includes(country)
          ? state.countries.filter(c => c !== country)
          : [...state.countries, country]
      })),
      toggleFundingType: (type) => set((state) => ({
        fundingTypes: state.fundingTypes.includes(type)
          ? state.fundingTypes.filter(t => t !== type)
          : [...state.fundingTypes, type]
      })),
      toggleDegreeLevel: (level) => set((state) => ({
        degreeLevels: state.degreeLevels.includes(level)
          ? state.degreeLevels.filter(l => l !== level)
          : [...state.degreeLevels, level]
      })),
      setGpaRange: (range) => set({ gpaRange: range }),
      setIeltsRange: (range) => set({ ieltsRange: range }),
      setDeadline: (deadline) => set({ deadline }),
      toggleFieldOfStudy: (field) => set((state) => ({
        fieldsOfStudy: state.fieldsOfStudy.includes(field)
          ? state.fieldsOfStudy.filter(f => f !== field)
          : [...state.fieldsOfStudy, field]
      })),
      setSortOption: (sortOption) => set({ sortOption }),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'scholarship-filters',
      // Optional: partialize if you don't want to save searchQuery across sessions
      partialize: (state) => ({
        countries: state.countries,
        fundingTypes: state.fundingTypes,
        degreeLevels: state.degreeLevels,
        gpaRange: state.gpaRange,
        ieltsRange: state.ieltsRange,
        deadline: state.deadline,
        fieldsOfStudy: state.fieldsOfStudy,
        sortOption: state.sortOption,
      })
    }
  )
);
