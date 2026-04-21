'use client';

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
        {/* Ô tìm kiếm */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Tìm kiếm</Label>
          <Input
            id="search"
            placeholder="Tìm kiếm nội dung..."
            value={filters.search}
            onChange={(e) => {
              if (filters.search !== e.target.value) {
                setFilters({ ...filters, search: e.target.value })
              }
            }}
            aria-label="Ô nhập tìm kiếm"
          />
        </div>

        {/* Lọc theo danh mục */}
        <div className="w-[200px]">
          <Label htmlFor="category">Danh mục</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              if (filters.category !== value) {
                setFilters({ ...filters, category: value })
              }
            }}
          >
            <SelectTrigger id="category" aria-label="Chọn danh mục">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>Không có danh mục nào</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Khoảng ngày */}
        {showDateRange && (
          <>
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => {
                  if (filters.startDate !== e.target.value) {
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                }}
                aria-label="Ô nhập ngày bắt đầu"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => {
                  if (filters.endDate !== e.target.value) {
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                }}
                aria-label="Ô nhập ngày kết thúc"
              />
            </div>
          </>
        )}

        {/* Kỳ hạn (Tháng/Năm) */}
        {showPeriod && (
          <div>
            <Label htmlFor="period">Kỳ hạn</Label>
            <Input
              id="period"
              type="month"
              value={filters.period || ""}
              onChange={(e) => {
                if (filters.period !== e.target.value) {
                  setFilters({ ...filters, period: e.target.value })
                }
              }}
              aria-label="Ô nhập kỳ hạn tháng"
            />
          </div>
        )}
      </div>
    </div>
  )
}