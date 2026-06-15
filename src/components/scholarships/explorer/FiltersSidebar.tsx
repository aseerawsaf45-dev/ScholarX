"use client";

import { useScholarshipFilterStore } from "@/store/scholarshipFilterStore";
import { DegreeLevel, FundingType } from "@prisma/client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const COUNTRIES = ["Germany", "Canada", "USA", "UK", "Australia", "Sweden", "Netherlands", "Japan", "South Korea", "China"];
const FIELDS = ["Computer Science", "Engineering", "Business", "Medicine", "Architecture", "Arts", "Data Science", "Law", "Public Health", "Environmental Science"];

export function FiltersSidebar() {
  const filters = useScholarshipFilterStore();

  const handleFundingToggle = (type: FundingType) => {
    filters.toggleFundingType(type);
  };

  const handleDegreeToggle = (level: DegreeLevel) => {
    filters.toggleDegreeLevel(level);
  };

  return (
    <div className="w-full space-y-8 pr-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={filters.resetFilters} className="text-xs h-8 text-muted-foreground hover:text-foreground">
          Clear all
        </Button>
      </div>

      {/* Country Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Target Country</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {COUNTRIES.map(country => (
            <label key={country} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.countries.includes(country)}
                onChange={() => filters.toggleCountry(country)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{country}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Degree Level */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Degree Level</h4>
        <div className="space-y-2">
          {Object.values(DegreeLevel).map(level => (
            <label key={level} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.degreeLevels.includes(level)}
                onChange={() => handleDegreeToggle(level)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                {level.toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Funding Type */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Funding Type</h4>
        <div className="space-y-2">
          {Object.values(FundingType).map(type => (
            <label key={type} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.fundingTypes.includes(type)}
                onChange={() => handleFundingToggle(type)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                {type.replace(/_/g, " ").toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* GPA Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Minimum GPA</h4>
          <span className="text-xs font-semibold text-primary">{filters.gpaRange[0].toFixed(1)}</span>
        </div>
        <input 
          type="range" 
          min="2.0" 
          max="4.0" 
          step="0.1" 
          value={filters.gpaRange[0]}
          onChange={(e) => filters.setGpaRange([parseFloat(e.target.value), 4.0])}
          className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* IELTS Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Minimum IELTS</h4>
          <span className="text-xs font-semibold text-primary">{filters.ieltsRange[0].toFixed(1)}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="9.0" 
          step="0.5" 
          value={filters.ieltsRange[0]}
          onChange={(e) => filters.setIeltsRange([parseFloat(e.target.value), 9.0])}
          className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Deadline</h4>
        <div className="space-y-2">
          {[
            { label: 'All Time', value: 'all' },
            { label: 'Next 7 Days', value: '7' },
            { label: 'Next 30 Days', value: '30' },
            { label: 'Next 90 Days', value: '90' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="deadline"
                checked={filters.deadline === opt.value}
                onChange={() => filters.setDeadline(opt.value)}
                className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary/20 transition-colors cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fields of Study */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Fields of Study</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {FIELDS.map(field => (
            <label key={field} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.fieldsOfStudy.includes(field)}
                onChange={() => filters.toggleFieldOfStudy(field)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{field}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
