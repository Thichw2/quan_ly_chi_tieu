import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Filters {
  search: string
  category: string
  startDate?: string
  endDate?: string
  period?: string
}

interface SearchAndFilterProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  categories: string[]
  showDateRange?: boolean
  showPeriod?: boolean
}

export default function SearchAndFilter({
  filters,
  setFilters,
  categories,
  showDateRange = false,
  showPeriod = false,
}: SearchAndFilterProps) {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-wrap gap-4">
        {/* Search Field */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => {
              if (filters.search !== e.target.value) {
                setFilters({ ...filters, search: e.target.value })
              }
            }}
            aria-label="Search input"
          />
        </div>

        {/* Category Select */}
        <div className="w-[200px]">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              if (filters.category !== value) {
                setFilters({ ...filters, category: value })
              }
            }}
          >
            <SelectTrigger id="category" aria-label="Category select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        {showDateRange && (
          <>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => {
                  if (filters.startDate !== e.target.value) {
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                }}
                aria-label="Start date input"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => {
                  if (filters.endDate !== e.target.value) {
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                }}
                aria-label="End date input"
              />
            </div>
          </>
        )}

        {/* Period */}
        {showPeriod && (
          <div>
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              type="month"
              value={filters.period || ""}
              onChange={(e) => {
                if (filters.period !== e.target.value) {
                  setFilters({ ...filters, period: e.target.value })
                }
              }}
              aria-label="Period input"
            />
          </div>
        )}
      </div>
    </div>
  )
}
