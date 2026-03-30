import React, { useState, useMemo } from 'react'
import { useScans, useUniqueInventorySummary } from '../api/hooks'
import { computeLocationMetrics, getPerItemLocationStats, getTopMissMatchItems, getDiscrepancyPutaway } from '../utils/computeLocation'
import StatCard from '../components/ui/StatCard'
import SectionCard from '../components/ui/SectionCard'
import LocationTable from '../components/tables/LocationTable'
import DiscrepancyTable from '../components/tables/DiscrepancyTable'
import LocationDonut from '../components/charts/LocationDonut'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import { Search, MapPin, AlertCircle, PackageCheck, FileSpreadsheet, ArrowRight, Zap, BarChart3, FileDown, Filter, ChevronDown, X } from 'lucide-react'
import { exportToExcel } from '../utils/excelExport'
import { exportToCSV } from '../utils/csvExport'
import { parseISO, isValid } from 'date-fns'
import ScansTable from '../components/tables/ScansTable'

const LocationView = () => {
  const { data: scans, isLoading, isError, error, refetch } = useScans()
  const { data: uniqueInventorySummary = [], isLoading: isLoadingUniqueInventory } = useUniqueInventorySummary()

  // Unique Inventory Table Filters & Pagination
  const [uniqueDateFrom, setUniqueDateFrom] = useState('')
  const [uniqueDateTo, setUniqueDateTo] = useState('')
  const [uniquePage, setUniquePage] = useState(1)
  const uniquePageSize = 20

  // Filtered and paginated data
  const filteredUniqueRows = useMemo(() => {
    let rows = uniqueInventorySummary
    if (uniqueDateFrom) {
      const from = new Date(uniqueDateFrom)
      rows = rows.filter(r => r.date && new Date(r.date) >= from)
    }
    if (uniqueDateTo) {
      const to = new Date(uniqueDateTo)
      to.setHours(23,59,59,999)
      rows = rows.filter(r => r.date && new Date(r.date) <= to)
    }
    return rows
  }, [uniqueInventorySummary, uniqueDateFrom, uniqueDateTo])

  const totalPages = Math.ceil(filteredUniqueRows.length / uniquePageSize) || 1
  const pagedUniqueRows = filteredUniqueRows.slice((uniquePage-1)*uniquePageSize, uniquePage*uniquePageSize)

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Scans Detail Table Filters
  const [scansFilters, setScansFilters] = useState({
    search: '',
    category: ['All Categories'],
    daysFilterMode: 'range', // 'range' uses dateFrom/dateTo, 'days' uses selectedDays
    selectedDays: [],
    dateFrom: '',
    dateTo: ''
  })
  const [activeScansFilters, setActiveScansFilters] = useState(scansFilters)
  const [isScansCategoryDropdownOpen, setIsScansCategoryDropdownOpen] = useState(false)
  const [isInventoryDaysDropdownOpen, setIsInventoryDaysDropdownOpen] = useState(false)

  const filteredScans = useMemo(() => {
    if (!scans) return []
    return scans.filter(scan => {
      if (activeScansFilters.search) {
        const s = activeScansFilters.search.toLowerCase()
        const match = (scan.SKUname || '').toLowerCase().includes(s) ||
                      (scan.barcode || '').toLowerCase().includes(s) ||
                      (scan.id || '').toString().toLowerCase().includes(s) ||
                      (scan.userName || '').toLowerCase().includes(s) ||
                      (scan.productLocation || '').toLowerCase().includes(s)
        if (!match) return false
      }
      
      if (activeScansFilters.category && !activeScansFilters.category.includes('All Categories')) {
        const itemCategories = (scan.category || '').split(',').map(c => c.trim())
        const hasMatch = activeScansFilters.category.some(cat => itemCategories.includes(cat))
        if (!hasMatch) return false
      }
      
      const scanDateRaw = scan.dateInput || scan.date
      const scanDate = scanDateRaw ? new Date(scanDateRaw) : null
      const scanDateKey = scanDateRaw
        ? (typeof scanDateRaw === 'string' ? scanDateRaw.slice(0, 10) : (isValid(scanDate) ? scanDate.toISOString().slice(0, 10) : null))
        : null

      if (activeScansFilters.daysFilterMode === 'days') {
        // Manual multi-day selection (independent from Category selection)
        if (activeScansFilters.selectedDays.length > 0) {
          if (!scanDateKey || !activeScansFilters.selectedDays.includes(scanDateKey)) return false
        }
        // If selectedDays is empty, treat it as "all days" (so don't filter by date)
      } else {
        // Date range filtering (From/To inputs)
        if (activeScansFilters.dateFrom && isValid(scanDate)) {
          if (scanDate < new Date(activeScansFilters.dateFrom)) return false
        }
        if (activeScansFilters.dateTo && isValid(scanDate)) {
          const dateTo = new Date(activeScansFilters.dateTo)
          dateTo.setHours(23, 59, 59, 999) // Include full end day
          if (scanDate > dateTo) return false
        }
      }
      
      return true
    })
  }, [scans, activeScansFilters])

  const metrics = useMemo(() => {
    if (!filteredScans) return null
    return computeLocationMetrics(filteredScans)
  }, [filteredScans])

  const itemStats = useMemo(() => {
    if (!filteredScans) return []
    return getPerItemLocationStats(filteredScans)
  }, [filteredScans])

  const topMissMatch = useMemo(() => getTopMissMatchItems(itemStats), [itemStats])
  const discrepancyPutaway = useMemo(() => {
    if (!filteredScans) return []
    return getDiscrepancyPutaway(filteredScans)
  }, [filteredScans])

  const scansCategories = useMemo(() => {
    if (!scans) return []
    const allCats = scans.flatMap(s => (s.category || '').split(',').map(c => c.trim()))
    return ['All Categories', ...new Set(allCats)].filter(Boolean)
  }, [scans])

  const handleApplyScansFilters = () => {
    setActiveScansFilters(scansFilters)
    setIsScansCategoryDropdownOpen(false)
  }
  const handleClearScansFilters = () => {
    const cleared = { search: '', category: ['All Categories'], daysFilterMode: 'range', selectedDays: [], dateFrom: '', dateTo: '' }
    setScansFilters(cleared)
    setActiveScansFilters(cleared)
    setIsScansCategoryDropdownOpen(false)
  }

  const toggleScansCategory = (cat) => {
    let newCats = [...scansFilters.category]
    if (cat === 'All Categories') {
      newCats = ['All Categories']
    } else {
      newCats = newCats.filter(c => c !== 'All Categories')
      if (newCats.includes(cat)) {
        newCats = newCats.filter(c => c !== cat)
        if (newCats.length === 0) newCats = ['All Categories']
      } else {
        newCats.push(cat)
      }
    }
    setScansFilters({ ...scansFilters, category: newCats })
  }

  // Handle click outside for Scans Category dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isScansCategoryDropdownOpen && !event.target.closest('.scans-category-dropdown')) {
        setIsScansCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isScansCategoryDropdownOpen])

  const handleViewDetails = (item) => {
    setSelectedProduct(item)
    setIsModalOpen(true)
  }

  if (isLoading || isLoadingUniqueInventory) return <Spinner size="lg" />
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Location KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">




        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-2xl">
          <StatCard 
            label={
              <div>
                <div>Total Products (Unique)</div>
              </div>
            }
            value={
              <div className='flex items-start gap-14'>
                <span>{metrics.totalProducts}</span>
                <div className='text-sm text-gray-500 font-semibold mt-1'>
                  Overall Items: <span className='text-black text-bold text-xl'>{metrics.productStatus.match + metrics.productStatus.mismatch}</span> 
                </div>
              </div>
             
            }
            color="blue"
          />
          <StatCard label="Total Locations (Unique)" value={metrics.totalLocations} color="blue" />
        </div>




        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-blue-500 p-4">
            <div className="text-10px uppercase font-bold text-muted mb-3 tracking-widest">Product Status (In Locations)</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-green-600">{metrics.productStatus.match}</div>
                <div className="text-[10px] font-bold text-muted uppercase">Match <Badge variant="gain" className="ml-1">{Math.round(metrics.productStatus.matchPercent)}%</Badge></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-red-600">{metrics.productStatus.mismatch}</div>
                <div className="text-[10px] font-bold text-muted uppercase">Miss Match <Badge variant="missing" className="ml-1">{Math.round(metrics.productStatus.mismatchPercent)}%</Badge></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-blue-500 p-4">
            <div className="text-10px uppercase font-bold text-muted mb-3 tracking-widest">Location Status (Per Scans)</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-green-600">{metrics.locationStatus.match}</div>
                <div className="text-[10px] font-bold text-muted uppercase">Match <Badge variant="gain" className="ml-1">{Math.round(metrics.locationStatus.matchPercent)}%</Badge></div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-orange-600">{metrics.locationStatus.mismatch}</div>
                <div className="text-[10px] font-bold text-muted uppercase">Miss Match <Badge variant="extra" className="ml-1">{Math.round(metrics.locationStatus.mismatchPercent)}%</Badge></div>
              </div>
            </div>
          </div>
        </div>
      </div>





            {/* Unique Inventory Summary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-black">Warehouse Summary</div>
            <button
              onClick={() => exportToCSV(filteredUniqueRows, 'warehouse_summary')}
              className="flex gap-2 px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors whitespace-nowrap items-end"
            >
              <FileDown size={14} />
              Export CSV
            </button>
          </div>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">From</label>
              <input type="date" value={uniqueDateFrom} onChange={e => { setUniqueDateFrom(e.target.value); setUniquePage(1); }} className="border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-purple-300" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">To</label>
              <input type="date" value={uniqueDateTo} onChange={e => { setUniqueDateTo(e.target.value); setUniquePage(1); }} className="border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-purple-300" />
            </div>
            {(uniqueDateFrom || uniqueDateTo) && (
              <button onClick={() => { setUniqueDateFrom(''); setUniqueDateTo(''); setUniquePage(1); }} className="ml-2 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Clear</button>
            )}
          </div>
        </div>
        {isLoadingUniqueInventory ? (
          <div className="text-center py-8"><Spinner size={32} /> Loading summary...</div>
        ) : (
          <div className="overflow-x-auto border-t border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Matched Locations</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">MissMatched Locations</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Location Accuracy</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Matched Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">MissMatched Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Items Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedUniqueRows.map((row, i) => (
                  <tr key={row._id || i} className="hover:bg-purple-50 even:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">{row.date ? new Date(row.date).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.category || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.matchedLocations ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.missMatchedLocations ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-bold">{row.locationAccuracy != null ? `${Math.round(row.locationAccuracy * 100)}%` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.matchedItems ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.missMatchedItems ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-bold">{row.itemsAccuracy != null ? `${Math.round(row.itemsAccuracy * 100)}%` : ''}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200 sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {filteredUniqueRows.length > 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">TOTAL (Filtered)</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{/* Could show unique categories count here if desired */}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{filteredUniqueRows.reduce((a, b) => a + (b.matchedLocations || 0), 0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{filteredUniqueRows.reduce((a, b) => a + (b.missMatchedLocations || 0), 0)}</td>
                    <td className="px-6 py-4 text-sm text-purple-700">
                      {(() => {
                        const totalMatched = filteredUniqueRows.reduce((a, b) => a + (b.matchedLocations || 0), 0);
                        const totalAll = filteredUniqueRows.reduce((a, b) => a + ((b.matchedLocations || 0) + (b.missMatchedLocations || 0)), 0);
                        const percent = totalAll > 0 ? Math.round((totalMatched / totalAll) * 100) : 0;
                        return percent + "%";
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{filteredUniqueRows.reduce((a, b) => a + (b.matchedItems || 0), 0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{filteredUniqueRows.reduce((a, b) => a + (b.missMatchedItems || 0), 0)}</td>
                    <td className="px-6 py-4 text-sm text-purple-700">
                      {(() => {
                        const totalMatched = filteredUniqueRows.reduce((a, b) => a + (b.matchedItems || 0), 0);
                        const totalAll = filteredUniqueRows.reduce((a, b) => a + ((b.matchedItems || 0) + (b.missMatchedItems || 0)), 0);
                        const percent = totalAll > 0 ? Math.round((totalMatched / totalAll) * 100) : 0;
                        return percent + "%";
                      })()}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 px-6 pb-4">
              <div className="text-xs text-gray-600">Page {uniquePage} of {totalPages}</div>
              <div className="flex gap-2">
                <button disabled={uniquePage === 1} onClick={() => setUniquePage(p => Math.max(1, p-1))} className={`px-3 py-1 rounded-xl border text-xs font-bold ${uniquePage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Prev</button>
                <button disabled={uniquePage === totalPages} onClick={() => setUniquePage(p => Math.min(totalPages, p+1))} className={`px-3 py-1 rounded-xl border text-xs font-bold ${uniquePage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>








      {/* Scan Days Summary Dropdown */}
      {(() => {
        const normalizeDateKey = (scan) => {
          const raw = scan.dateInput || scan.date
          if (!raw) return null
          if (typeof raw === 'string') return raw.slice(0, 10)
          const date = new Date(raw)
          if (isNaN(date)) return null
          return date.toISOString().slice(0, 10)
        }
        const formatDay = (d) => {
          try {
            const date = new Date(d)
            return isNaN(date)
              ? d
              : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
          } catch {
            return d
          }
        }

        const dropdownScans = (scans || []).filter(scan => {
          if (!activeScansFilters.search) return true
          const s = activeScansFilters.search.toLowerCase()
          const match = (scan.SKUname || '').toLowerCase().includes(s) ||
                        (scan.barcode || '').toLowerCase().includes(s) ||
                        (scan.id || '').toString().toLowerCase().includes(s) ||
                        (scan.userName || '').toLowerCase().includes(s) ||
                        (scan.productLocation || '').toLowerCase().includes(s)
          return match
        })

        const daysArr = Array.from(
          new Set(dropdownScans.map(s => (normalizeDateKey(s))))
        ).filter(Boolean);
        
        const categoriesByDayKey = daysArr.reduce((acc, dayKey) => {
          const cats = Array.from(
            new Set(
              dropdownScans
                .filter(s => normalizeDateKey(s) === dayKey)
                .flatMap(s => (s.category || '').split(',').map(c => c.trim()))
                .filter(Boolean)
            )
          ).sort((a, b) => a.localeCompare(b))
          acc[dayKey] = cats
          return acc
        }, {})

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-sm font-bold text-blue-700">
                Inventory Cycle Count <span className="text-lg text-blue-900">{daysArr.length}</span> days
              </div>
              <div className="text-xs text-gray-700 flex flex-wrap gap-2 items-center relative pr-32">
                <span className="font-bold text-[18px]">Inventory Days :</span>
                <button
                  type="button"
                  className="ml-4 px-5 py-2 bg-blue-600 text-white rounded-lg border border-blue-700 font-bold text-base shadow-md hover:bg-blue-700 transition-all"
                  style={{minWidth: '70px'}} 
                  onClick={() => setIsInventoryDaysDropdownOpen(o => !o)}
                >
                  {isInventoryDaysDropdownOpen ? 'Hide' : 'Show'}
                </button>
                {isInventoryDaysDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 bg-white border border-blue-200 rounded-xl shadow-2xl z-10 p-4 min-w-[320px] max-h-80 overflow-y-auto flex flex-col gap-2">
                    {daysArr.length === 0 ? (
                      <span className="text-gray-400">No days found</span>
                    ) : (
                      <>
                        <div className="mb-2">
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded-lg font-bold text-xs border transition-all ${
                              scansFilters.daysFilterMode === 'days' && scansFilters.selectedDays.length === 0
                                ? 'bg-blue-600 border-blue-700 text-white'
                                : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                            }`}
                            onClick={() => {
                              setScansFilters((prev) => {
                                const nextFilters = { ...prev, daysFilterMode: 'days', selectedDays: [] }
                                setActiveScansFilters(nextFilters)
                                return nextFilters
                              })
                            }}
                          >
                            All Days
                          </button>
                        </div>
                        {daysArr.map((d, i) => (
                          <div key={d + i} className="bg-blue-50 border border-blue-100 rounded-xl p-2 mb-1">
                            <label
                              className="flex items-center justify-between gap-3 cursor-pointer select-none px-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-xs font-bold text-blue-800">
                                {formatDay(d)}
                              </div>
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-gray-300"
                                checked={
                                  scansFilters.daysFilterMode === 'days'
                                    ? (scansFilters.selectedDays.length === 0 || scansFilters.selectedDays.includes(d))
                                    : false
                                }
                                onChange={() => {
                                  setScansFilters((prev) => {
                                    const next = { ...prev, daysFilterMode: 'days' }
                                    const isAllDays = prev.daysFilterMode === 'days' && prev.selectedDays.length === 0

                                    // If currently all-days selected, switching off one day means selecting all except it.
                                    if (isAllDays) {
                                      const nextSelected = daysArr.filter(dayKey => dayKey !== d)
                                      // Prevent selecting "none" (keep at least 1 day). If only one day exists, keep all.
                                      next.selectedDays = nextSelected.length ? nextSelected : []
                                    } else {
                                      const selected = prev.selectedDays || []
                                      const hasDay = selected.length > 0 ? selected.includes(d) : false
                                      if (hasDay) {
                                        const filtered = selected.filter(dayKey => dayKey !== d)
                                        // Prevent turning off the last selected day (would be confusing/empty).
                                        if (filtered.length === 0) return prev
                                        next.selectedDays = filtered
                                      } else {
                                        next.selectedDays = [...selected, d]
                                      }
                                    }

                                    setActiveScansFilters(next)
                                    return next
                                  })
                                }}
                              />
                            </label>
                            <div className="mt-2 space-y-1">
                              {(categoriesByDayKey[d] || []).map((cat) => (
                                <label
                                  key={`${d}-${cat}`}
                                  className="flex items-center gap-3 px-2 py-1 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-gray-300"
                                    checked={scansFilters.category.includes(cat)}
                                    onChange={() => {
                                      // Toggle category only (days selection is independent)
                                      setScansFilters((prev) => {
                                        let newCats = [...prev.category]
                                        if (cat === 'All Categories') {
                                          newCats = ['All Categories']
                                        } else {
                                          newCats = newCats.filter(c => c !== 'All Categories')
                                          if (newCats.includes(cat)) {
                                            newCats = newCats.filter(c => c !== cat)
                                          } else {
                                            newCats.push(cat)
                                          }
                                          if (newCats.length === 0) newCats = ['All Categories']
                                        }

                                        const nextFilters = { ...prev, category: newCats }
                                        setActiveScansFilters(nextFilters)
                                        return nextFilters
                                      })
                                    }}
                                  />
                                  <span className={`text-sm ${scansFilters.category.includes(cat) ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                                    {cat}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-10px uppercase font-bold text-muted tracking-wider">Search Everywhere</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Name, Location, SKUID or Username..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={scansFilters.search}
                onChange={(e) => setScansFilters({...scansFilters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative scans-category-dropdown">
            <label className="text-10px uppercase font-bold text-muted tracking-wider">Category</label>
            <button 
              type="button"
              onClick={() => setIsScansCategoryDropdownOpen(!isScansCategoryDropdownOpen)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-left flex items-center justify-between"
            >
              <span className="truncate">
                {scansFilters.category.includes('All Categories') 
                  ? 'All Categories' 
                  : `${scansFilters.category.length} Selected`}
              </span>
              <ChevronDown className={`text-gray-400 transition-transform ${isScansCategoryDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isScansCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  {scansCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-gray-300"
                        checked={scansFilters.category.includes(cat)}
                        onChange={() => toggleScansCategory(cat)}
                      />
                      <span className={`text-sm ${scansFilters.category.includes(cat) ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="space-y-1.5">
              <label className="text-10px uppercase font-bold text-muted tracking-wider">From</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none"
                value={scansFilters.dateFrom}
                onChange={(e) => setScansFilters({...scansFilters, dateFrom: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-10px uppercase font-bold text-muted tracking-wider">To</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none"
                value={scansFilters.dateTo}
                onChange={(e) => setScansFilters({...scansFilters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleApplyScansFilters}
              className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-xl hover:bg-blue-600 transition-all shadow-sm shadow-blue-200"
            >
              Apply Filter
            </button>
            <button 
              onClick={handleClearScansFilters}
              className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Location Per Item Count Table */}
      <SectionCard 
        title="Location Per Item Count" 
        icon={<MapPin size={20} className="text-purple-500" />} 
        color="purple"
        headerActions={
          <button 
            onClick={() => {
              const flatRows = itemStats.flatMap(item =>
                item.locations.map(loc => ({
                  'Item ID': item.id,
                  'SKU Name': item.name,
                  'Category': item.category,
                  'Total Match Locs': item.matchLocs,
                  'Total Mismatch Locs': item.missMatchLocs,
                  'Item Status': item.status,
                  'Location': loc.productLocation,
                  'Location Status': loc.locationStatus,
                  'Physical Qty': loc.finalQuantity,
                  'System Qty': loc.sysQuantity,
                  'Variance': loc.variance,
                }))
              )
              exportToExcel(flatRows, 'location_per_item_count')
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet size={14} />
            Export Excel
          </button>
        }
      >
        <LocationTable data={itemStats} onViewDetails={handleViewDetails} />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Discrepancy Putaway */}
        <div className="lg:col-span-2">
          <SectionCard 
            title="Discrepancy Locations Putaway" 
            subtitle="System Qty = 0, Physical > 0"
            icon={<PackageCheck size={20} className="text-orange-500" />} 
            color="orange"
            headerActions={
              <button 
                onClick={() => exportToExcel(discrepancyPutaway, 'putaway_discrepancy')}
                className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet size={14} />
                Export Excel
              </button>
            }
          >
            <DiscrepancyTable data={discrepancyPutaway} />
          </SectionCard>
        </div>

        {/* Status Distribution & Top Items */}
        <div className="space-y-8">
          <SectionCard title="Location Status Distribution" color="blue">
            <LocationDonut data={metrics.locationStatus} />
          </SectionCard>

          <SectionCard 
            title="Top 5 Miss Match Items" 
            subtitle="Most Location Differences"
            icon={<AlertCircle size={20} className="text-red-500" />} 
            color="red"
          >
            <div className="space-y-4">
              {topMissMatch.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
                    <div className="text-10px text-muted font-bold truncate">{item.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" className="text-[10px] px-2">{item.missMatchLocs} Diff</Badge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Scans Detail Table Analysis */}
      <div className="pt-8 border-t border-gray-100 space-y-8">
        <SectionCard 
          title="Scans Detail Analysis" 
          subtitle={`Showing ${filteredScans.length} scan records`}
          icon={<BarChart3 size={20} className="text-blue-500" />} 
          color="blue"
          headerActions={
            <button 
              onClick={() => exportToCSV(filteredScans, 'location_scans_report')}
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <FileDown size={16} />
              Export CSV
            </button>
          }
        >
          <ScansTable data={filteredScans} />
        </SectionCard>
      </div>


      {/* Location Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Locations for: ${selectedProduct?.name || ''}`}
        maxWidth="max-w-4xl"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="bg-accent-light border border-accent/20 rounded-2xl p-6 flex flex-wrap gap-8 items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-muted uppercase tracking-widest">Location Accuracy</div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-green-600">{selectedProduct.matchLocs} <span className="text-xs font-bold text-muted">MATCH</span></div>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div className="text-2xl font-black text-red-600">{selectedProduct.missMatchLocs} <span className="text-xs font-bold text-muted">MISMATCH</span></div>
                </div>
              </div>
              
              <div className="space-y-1 text-right">
                <div className="text-xs font-bold text-muted uppercase tracking-widest">Quantity Totals</div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-extrabold text-blue-600">Phy: {selectedProduct.totalFinalQty}</div>
                  <div className="text-lg font-extrabold text-gray-400">Sys: {selectedProduct.totalSysQty}</div>
                  <Badge variant={selectedProduct.status} className="ml-2">{selectedProduct.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-green-600 flex items-center gap-2 px-1">
                  <PackageCheck size={18} /> Match Locations ({selectedProduct.matchLocs})
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedProduct.locations.filter(l => l.locationStatus === 'Match').map((loc, i) => (
                    <div key={i} className="bg-white border-l-4 border-green-500 rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="text-xs font-bold text-gray-900 mb-1">{loc.productLocation}</div>
                      <div className="text-[10px] font-bold text-muted space-x-3">
                        <span>Phy: <b className="text-gray-900">{loc.finalQuantity}</b></span>
                        <span>Sys: <b className="text-gray-900">{loc.sysQuantity}</b></span>
                        <span>Var: <b className="text-green-600">{loc.variance}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-red-600 flex items-center gap-2 px-1">
                  <AlertCircle size={18} /> Miss Match Locations ({selectedProduct.missMatchLocs})
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedProduct.locations.filter(l => l.locationStatus !== 'Match').map((loc, i) => (
                    <div key={i} className="bg-red-50/50 border-l-4 border-red-500 rounded-xl p-3 shadow-sm border border-red-100">
                      <div className="text-xs font-bold text-gray-900 mb-1">{loc.productLocation}</div>
                      <div className="text-[10px] font-bold text-muted space-x-3">
                        <span>Phy: <b className="text-gray-900">{loc.finalQuantity}</b></span>
                        <span>Sys: <b className="text-gray-900">{loc.sysQuantity}</b></span>
                        <span>Var: <b className="text-red-600">{loc.variance}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LocationView
