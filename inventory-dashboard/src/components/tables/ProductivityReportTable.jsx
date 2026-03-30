import React, { useState, useEffect, useMemo } from 'react'
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender 
} from '@tanstack/react-table'
import { 
  ChevronDown, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Download, 
  MoreVertical,
  ClipboardList,
  Clock,
  X
} from 'lucide-react'
import { getProductivityReportData } from '../../utils/computeProductivity'

const ProductivityReportTable = ({ scans, employees, showHourlyDetail, onToggleHourlyDetail, onDateRangeChange, onEmployeeFilterChange = () => {} }) => {
  const [filters, setFilters] = useState({
    employees: ['All Employees'],
    hourFrom: '',
    hourTo: '',
    dateFrom: '',
    dateTo: ''
  })
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    setIsDebouncing(true)
    const handler = setTimeout(() => {
      setDebouncedFilters(filters)
      setIsDebouncing(false)
    }, 500)
    return () => clearTimeout(handler)
  }, [filters])


  useEffect(() => {
    onDateRangeChange?.(debouncedFilters.dateFrom, debouncedFilters.dateTo)
  }, [debouncedFilters.dateFrom, debouncedFilters.dateTo, onDateRangeChange])

  // Notify parent when employee filter changes
  useEffect(() => {
    if (onEmployeeFilterChange) {
      onEmployeeFilterChange(debouncedFilters.employees)
    }
  }, [debouncedFilters.employees, onEmployeeFilterChange])

  const handleClearFilters = () => {
    setFilters({
      employees: ['All Employees'],
      hourFrom: '',
      hourTo: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const toggleEmployee = (emp) => {
    if (emp === 'All Employees') {
      setFilters(prev => ({ ...prev, employees: ['All Employees'] }))
    } else {
      setFilters(prev => {
        let newEmps = prev.employees.filter(e => e !== 'All Employees')
        if (newEmps.includes(emp)) {
          newEmps = newEmps.filter(e => e !== emp)
          if (newEmps.length === 0) newEmps = ['All Employees']
        } else {
          newEmps = [...newEmps, emp]
        }
        return { ...prev, employees: newEmps }
      })
    }
  }

  const columns = useMemo(() => [
    { header: 'DATE', accessorKey: 'date' },
    { 
      header: 'HOUR', 
      accessorKey: 'hour',
      cell: ({ getValue }) => {
        const h = getValue()
        if (h === 'Unknown') return 'Unknown'
        if (h === 'All Day') return 'All Day'
        const hour = parseInt(h)
        if (isNaN(hour)) return String(h)
        // Display hour "bins" starting from 1:
        // 00:00-01:00 => 01.00.00 (hour=0 shown as 1)
        const displayHour = hour + 1
        return `${displayHour.toString().padStart(2, '0')}.00.00`
      }
    },
    { header: 'EMPLOYEE', accessorKey: 'employee' },
    { header: 'TOTAL LOCATIONS', accessorKey: 'totalLocations' },
    { header: 'TOTAL QTY', accessorKey: 'totalQty' },
    { header: 'TOTAL ITEMS', accessorKey: 'totalScans' },
    { header: 'MATCHES', accessorKey: 'matches' },
    { header: 'HUMAN ERROR', accessorKey: 'errors' },
    { 
      header: 'ACCURACY RATE', 
      accessorKey: 'accuracyRate',
      cell: ({ getValue }) => {
        const val = getValue()
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
              <div 
                className={`h-full transition-all duration-500 ${
                  val >= 95 ? 'bg-green-500' : val >= 85 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${val}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${
              val >= 95 ? 'text-green-600' : val >= 85 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {val}%
            </span>
          </div>
        )
      }
    }
  ], [])

  const filteredData = useMemo(() => {
    if (!scans || !Array.isArray(scans)) return []
    
    // Initial grouping and filtering from shared logic
    let report = getProductivityReportData(scans, debouncedFilters)
    
    // Filter by Employee
    if (debouncedFilters.employees.length > 0 && !debouncedFilters.employees.includes('All Employees')) {
      report = report.filter(r => debouncedFilters.employees.includes(r.employee))
    }
    
    // Filter by Hour
    if (debouncedFilters.hourFrom !== '' || debouncedFilters.hourTo !== '') {
      report = report.filter(r => {
        if (r.hour === 'Unknown') return true
        const h = parseInt(r.hour)
        // UI hour bins are 1..24, while DB hour values are 0..23
        const fromBin = debouncedFilters.hourFrom !== '' ? parseInt(debouncedFilters.hourFrom) : 1
        const toBin = debouncedFilters.hourTo !== '' ? parseInt(debouncedFilters.hourTo) : 24
        const from = Math.max(0, fromBin - 1)
        const to = Math.min(23, toBin - 1)
        return h >= from && h <= to
      })
    }
    
    // Filter by Date Range
    if (debouncedFilters.dateFrom) {
      report = report.filter(r => r.isoDate >= debouncedFilters.dateFrom || r.isoDate === 'Unknown')
    }
    if (debouncedFilters.dateTo) {
      report = report.filter(r => r.isoDate <= debouncedFilters.dateTo || r.isoDate === 'Unknown')
    }

    // Daily Aggregation Toggle
    if (!showHourlyDetail) {
      const dailyGrouped = {}
      report.forEach(r => {
        const key = `${r.date}|${r.employee}`
        if (!dailyGrouped[key]) {
          dailyGrouped[key] = { ...r, hour: 'All Day', uniqueLocations: new Set(), totalQty: 0, itemsCounted: 0, matches: 0, errors: 0, totalScans: 0 }
        }
        const dg = dailyGrouped[key]
        if (r.uniqueLocations) {
          r.uniqueLocations.forEach(loc => dg.uniqueLocations.add(loc))
        }
        dg.totalQty += (r.totalQty || 0)
        dg.itemsCounted += (r.itemsCounted || 0)
        dg.matches += (r.matches || 0)
        dg.errors += (r.errors || 0)
        dg.totalScans += (r.totalScans || 0)
      })
      report = Object.values(dailyGrouped).map(r => ({
        ...r,
        totalLocations: r.uniqueLocations.size,
        accuracyRate: r.totalScans > 0 ? Math.round((r.matches / r.totalScans) * 100) : 0
      }))
    }

    // Ensure stable "database-like" ordering:
    // Sort by isoDate ascending, then hour ascending (0..23).
    const sorted = [...report].sort((a, b) => {
      const isoA = a.isoDate && a.isoDate !== 'Unknown' ? a.isoDate : '9999-12-31'
      const isoB = b.isoDate && b.isoDate !== 'Unknown' ? b.isoDate : '9999-12-31'
      if (isoA !== isoB) return isoA.localeCompare(isoB)

      const hourA = typeof a.hour === 'number' ? a.hour : (a.hour === 'All Day' ? 1000 : 999)
      const hourB = typeof b.hour === 'number' ? b.hour : (b.hour === 'All Day' ? 1000 : 999)
      if (hourA !== hourB) return hourA - hourB

      // Secondary sort for consistency
      const empA = (a.employee || '').toString().toLowerCase()
      const empB = (b.employee || '').toString().toLowerCase()
      return empA.localeCompare(empB)
    })

    return sorted
  }, [scans, debouncedFilters, showHourlyDetail])

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      totalLocations: acc.totalLocations + (curr.totalLocations || 0),
      totalQty: acc.totalQty + (curr.totalQty || 0),
      itemsCounted: acc.itemsCounted + (curr.itemsCounted || 0),
      matches: acc.matches + (curr.matches || 0),
      errors: acc.errors + (curr.errors || 0),
      totalScans: acc.totalScans + (curr.totalScans || 0)
    }), { totalLocations: 0, totalQty: 0, itemsCounted: 0, matches: 0, errors: 0, totalScans: 0 })
  }, [filteredData])

  const totalAccuracy = totals.totalScans > 0 ? Math.round((totals.matches / totals.totalScans) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Productivity Report</h3>
              <p className="text-xs text-gray-500">
                Found {totals.totalScans} total scans across {filteredData.length} records
              </p>
            </div>
          </div>

          {/* Pagination Controls */}

          <div className="flex justify-center items-center gap-2 mt-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="mx-2 text-sm">Page {page} of {pageCount}</span>
        <button
          onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          disabled={page === pageCount}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>

          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-600">Hourly Detail</span>
            <button
              onClick={onToggleHourlyDetail}
              className={`w-10 h-5 rounded-full transition-all relative ${showHourlyDetail ? 'bg-indigo-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showHourlyDetail ? 'left-6' : 'left-1'}`} />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <h3 className="text-sm font-bold text-gray-700 font-inter">Report Filters</h3>
            {isDebouncing && <span className="text-[10px] text-indigo-500 animate-pulse font-bold">Updating...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Employee Name</label>
            <button
              onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
              className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm flex items-center justify-between shadow-sm hover:border-indigo-200 transition-colors"
            >
              <span className="truncate text-gray-700">
                {filters.employees.includes('All Employees') ? 'All Employees' : `${filters.employees.length} Selected`}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {isEmployeeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsEmployeeDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar">
                  <div className="p-2 space-y-1">
                    {['All Employees', ...employees].map(emp => (
                      <label key={emp} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500/20"
                          checked={filters.employees.includes(emp)}
                          onChange={() => toggleEmployee(emp)}
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">{emp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Hour Range</label>
            <div className="flex flex-col gap-2">
              <select
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-200"
                value={filters.hourFrom}
                onChange={(e) => setFilters({...filters, hourFrom: e.target.value})}
              >
                <option value="">From Hour</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i + 1}>{(i + 1) % 12 || 12}:00 {(i + 1) >= 12 ? 'PM' : 'AM'}</option>
                ))}
              </select>
              <select
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-200"
                value={filters.hourTo}
                onChange={(e) => setFilters({...filters, hourTo: e.target.value})}
              >
                <option value="">To Hour</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i + 1}>{(i + 1) % 12 || 12}:00 {(i + 1) >= 12 ? 'PM' : 'AM'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Date Range</label>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-200"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
              <input
                type="date"
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm shadow-sm focus:outline-none focus:border-indigo-200"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white text-gray-500 font-bold border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-xs"
            >
              <X size={14} />
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-100">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200 sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>GRAND TOTAL (Filtered)</td>
              <td className="px-6 py-4 text-sm text-gray-900">{totals.totalLocations}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{totals.totalQty.toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{totals.totalScans}</td>
              <td className="px-6 py-4 text-sm text-green-600 font-black">{totals.matches}</td>
              <td className="px-6 py-4 text-sm text-red-600 font-black">{totals.errors}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-20">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        totalAccuracy >= 95 ? 'bg-green-500' : totalAccuracy >= 85 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${totalAccuracy}%` }}
                    />
                  </div>
                  <span className={`font-black ${
                    totalAccuracy >= 95 ? 'text-green-600' : totalAccuracy >= 85 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {totalAccuracy}%
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        {filteredData.length === 0 && (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center gap-2">
              <ClipboardList className="w-12 h-12 text-gray-200" />
              <p className="text-gray-400 font-medium italic">No data matches your current criteria.</p>
              <button 
                onClick={handleClearFilters}
                className="text-indigo-600 font-bold text-xs hover:underline mt-2"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductivityReportTable
