import React, { useState, useMemo } from 'react'
import { useInventoryData, useScans } from '../api/hooks'
import { computeInventoryMetrics, getLatestBySKU, getCategoryAnalysis } from '../utils/computeInventory'
import { formatDate, isNearExpiry, getExpiryStatus } from '../utils/dateUtils'
import StatCard from '../components/ui/StatCard'
import SectionCard from '../components/ui/SectionCard'
import Badge from '../components/ui/Badge'
import InventoryTable from '../components/tables/InventoryTable'
import ExpiryTable from '../components/tables/ExpiryTable'
import ProductTrendTable from '../components/tables/ProductTrendTable'
import CategoryStackedBar from '../components/charts/CategoryStackedBar'
import ProductTrendLine from '../components/charts/ProductTrendLine'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import { exportToCSV } from '../utils/csvExport'
import { Search, Filter, X, ChevronDown, Calendar, AlertCircle, BarChart3, Package, FileDown, Eye, EyeOff } from 'lucide-react'
import { isValid } from 'date-fns'
import { useBulkToggleAlertVisibility } from '../api/hooks'

const InventoryView = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = ['admin', 'top_admin'].includes(user.role)

  const { data: rawInventoryData, isLoading: isInvLoading, isError: isInvError, error: invError, refetch: refetchInv } = useInventoryData()
  const { data: rawScansData, isLoading: isScansLoading, isError: isScansError, error: scansError, refetch: refetchScans } = useScans()
  
  const isLoading = isInvLoading || isScansLoading
  const isError = isInvError || isScansError
  const error = invError || scansError
  const refetch = () => { refetchInv(); refetchScans(); }
  
  const inventoryData = useMemo(() => {
    if (!rawInventoryData) return []
    return Array.isArray(rawInventoryData) ? rawInventoryData : (rawInventoryData.data || [])
  }, [rawInventoryData])

  const [filters, setFilters] = useState({
    search: '',
    category: ['All Categories'],
    status: 'All Statuses',
    dateFrom: '',
    dateTo: ''
  })
  
  const [activeFilters, setActiveFilters] = useState(filters)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [expiryDaysFilter, setExpiryDaysFilter] = useState(30)
  const [expiryVisibility, setExpiryVisibility] = useState('shown')
  const [chartStatuses, setChartStatuses] = useState(['Match', 'Gain', 'Loss'])
  const [expiryInventoryDateFrom, setExpiryInventoryDateFrom] = useState('')
  const [expiryInventoryDateTo, setExpiryInventoryDateTo] = useState('')
  
  const bulkHideMutation = useBulkToggleAlertVisibility()

  const toggleChartStatus = (status) => {
    setChartStatuses(prev => {
      if (prev.includes(status)) {
        if (prev.length === 1) return prev // Don't allow deselecting all
        return prev.filter(s => s !== status)
      }
      return [...prev, status]
    })
  }

  const { filtered, summary } = useMemo(() => {
    if (!inventoryData) return { filtered: [], summary: {} }
    return computeInventoryMetrics(inventoryData, activeFilters)
  }, [inventoryData, activeFilters])

  // حساب مجموع variance للأصناف Extra وMissing فقط
  const gainVariance = useMemo(() =>
    filtered.filter(s => s.productStatus === 'Extra').reduce((sum, s) => sum + (Number(s.variance) || 0), 0)
  , [filtered])
  const lossVariance = useMemo(() =>
    filtered.filter(s => s.productStatus === 'Missing').reduce((sum, s) => sum + (Number(s.variance) || 0), 0)
  , [filtered])

  const latestData = useMemo(() => getLatestBySKU(filtered), [filtered])
  const categoryData = useMemo(() => getCategoryAnalysis(filtered), [filtered])
  
  // Use Scans data for Expiry Alerts instead of Inventory data
  const expiryData = useMemo(() => {
    if (!rawScansData) return []
    const scans = Array.isArray(rawScansData) ? rawScansData : (rawScansData.data || [])
    
    // Apply same filters (Search & Category) to scans for consistency
    const filteredScans = scans.filter(scan => {
      // Search filter
      if (activeFilters.search) {
        const s = activeFilters.search.toLowerCase()
        const match = (scan.SKUname || '').toLowerCase().includes(s) ||
                      (scan.barcode || '').toLowerCase().includes(s) ||
                      (scan.id || '').toString().toLowerCase().includes(s)
        if (!match) return false
      }
      
      // Category filter (Array)
      if (activeFilters.category && !activeFilters.category.includes('All Categories')) {
        const itemCategories = (scan.category || '').split(',').map(c => c.trim())
        const hasMatch = activeFilters.category.some(cat => itemCategories.includes(cat))
        if (!hasMatch) return false
      }

      // Date Range filter
      const scanDateRaw = scan.dateInput || scan.date
      const scanDate = scanDateRaw ? new Date(scanDateRaw) : null
      if (activeFilters.dateFrom && isValid(scanDate)) {
        if (scanDate < new Date(activeFilters.dateFrom)) return false
      }
      if (activeFilters.dateTo && isValid(scanDate)) {
        const dateTo = new Date(activeFilters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        if (scanDate > dateTo) return false
      }

      // Expiry Specific Inventory Date Filter
      if (expiryInventoryDateFrom && isValid(scanDate)) {
        if (scanDate < new Date(expiryInventoryDateFrom)) return false
      }
      if (expiryInventoryDateTo && isValid(scanDate)) {
        const dateTo = new Date(expiryInventoryDateTo)
        dateTo.setHours(23, 59, 59, 999)
        if (scanDate > dateTo) return false
      }
      
      return true
    })

    return filteredScans.filter(s => {
      const status = getExpiryStatus(s.expirationDate)
      let matchesDays = false
      if (expiryDaysFilter === -1) matchesDays = ['expired', 'critical', 'warning'].includes(status)
      else if (expiryDaysFilter === 0) matchesDays = status === 'expired'
      else if (expiryDaysFilter === 7) matchesDays = status === 'critical'
      else matchesDays = status === 'warning'

      if (!matchesDays) return false

      if (expiryVisibility === 'shown') return !s.hiddenFromAlerts
      if (expiryVisibility === 'hidden') return s.hiddenFromAlerts
      return true
    })
  }, [rawScansData, activeFilters, expiryDaysFilter, expiryVisibility, expiryInventoryDateFrom, expiryInventoryDateTo])

  const categories = useMemo(() => {
    if (!inventoryData) return []
    const allCats = inventoryData.flatMap(s => (s.category || '').split(',').map(c => c.trim()))
    return ['All Categories', ...new Set(allCats)].filter(Boolean)
  }, [inventoryData])

  const handleApplyFilters = () => {
    setActiveFilters(filters)
    setIsCategoryDropdownOpen(false)
  }
  const handleClearFilters = () => {
    const cleared = { search: '', category: ['All Categories'], status: 'All Statuses', dateFrom: '', dateTo: '' }
    setFilters(cleared)
    setActiveFilters(cleared)
    setIsCategoryDropdownOpen(false)
  }

  const toggleCategory = (cat) => {
    let newCats = [...filters.category]
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
    setFilters({ ...filters, category: newCats })
  }

  const handleViewHistory = (product) => {
    setSelectedProduct(product)
    setIsHistoryModalOpen(true)
  }

  // Default selection for Trend Chart
  React.useEffect(() => {
    if (latestData && latestData.length > 0) {
      if (!selectedProduct || !latestData.find(p => p.id === selectedProduct.id)) {
        setSelectedProduct(latestData[0])
      }
    }
  }, [latestData, selectedProduct])

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoryDropdownOpen && !event.target.closest('.category-dropdown-container')) {
        setIsCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategoryDropdownOpen])

  if (isLoading) return <Spinner size="lg" />
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Items unique"
          value={
            <div className="flex items-start gap-32">
              <span>{summary.totalItems}</span>
              <span className="text-sm text-gray-500 font-semibold mt-1">Overall Items: <span className='text-black text-bold text-xl'>{(summary.totalMatch + summary.totalGain + summary.totalLoss)}</span></span>
            </div>
          }
          color="blue"
        />
        <StatCard label="Total Match items" value={summary.totalMatch} color="green" />
        <StatCard label="Total Gain items" value={summary.totalGain} color="orange" />
        <StatCard label="Total Loss items" value={summary.totalLoss} color="red" />
        
        <StatCard label="Total Pieces quantity" value={summary.totalPieces?.toLocaleString()} color="blue" />
        <StatCard label="Matched quantity (Sum)" value={summary.matchPieces?.toLocaleString()} color="green" />
        <StatCard label="Gain quantity (Sum)" value={gainVariance?.toLocaleString()} color="orange" />
        <StatCard label="Loss quantity (Sum)" value={(-1*lossVariance)?.toLocaleString()} color="red" />

        <StatCard label="Overall Accuracy" value={`${Math.round(summary.overallAccuracy)}%`} color="blue" progress={summary.overallAccuracy} />
        <StatCard label="Matched %" value={`${Math.round(summary.matchPercent)}%`} color="green" />
        <StatCard label="Gain %" value={`${Math.round(summary.gainPercent)}%`} color="orange" />
        <StatCard label="Loss %" value={`${Math.round(summary.lossPercent)}%`} color="red" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-10px uppercase font-bold text-muted tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Code, Name, or ID..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative category-dropdown-container">
            <label className="text-10px uppercase font-bold text-muted tracking-wider">Category</label>
            <button 
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-left flex items-center justify-between"
            >
              <span className="truncate">
                {filters.category.includes('All Categories') 
                  ? 'All Categories' 
                  : `${filters.category.length} Selected`}
              </span>
              <ChevronDown className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-gray-300"
                        checked={filters.category.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className={`text-sm ${filters.category.includes(cat) ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-10px uppercase font-bold text-muted tracking-wider">Product Status</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Match">Match</option>
              <option value="Extra">Extra</option>
              <option value="Missing">Missing</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="space-y-1.5">
              <label className="text-10px uppercase font-bold text-muted tracking-wider">From</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-10px uppercase font-bold text-muted tracking-wider">To</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleApplyFilters}
              className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-xl hover:bg-blue-600 transition-all shadow-sm shadow-blue-200"
            >
              Apply Filters
            </button>
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
        {/* Column 1: Current Inventory Table */}
        <SectionCard 
          title="Current Inventory" 
          icon={<Package size={20} className="text-blue-500" />} 
          color="blue"
          fullHeight={true}
          headerActions={
            <div className="flex items-center gap-3">
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap">
                {latestData.length} Items
              </span>
              <button 
                onClick={() => exportToCSV(latestData, 'inventory_report')}
                className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                <FileDown size={14} />
                Export CSV
              </button>
            </div>
          }
        >
          <InventoryTable 
            data={latestData} 
            onViewHistory={handleViewHistory} 
            selectedId={selectedProduct?.id}
            onSelect={setSelectedProduct}
          />
        </SectionCard>

        {/* Column 2: Selected Product Trend */}
        <div className="h-full">
          {selectedProduct ? (
            <SectionCard 
              title={`Trend: ${selectedProduct.SKUname}`}
              icon={<BarChart3 size={20} className="text-blue-500" />}
              color="blue"
              fullHeight={true}
            >
              <ProductTrendLine 
                productName={selectedProduct.SKUname} 
                data={inventoryData.filter(s => s.id === selectedProduct.id)} 
              />
            </SectionCard>
          ) : (
            <SectionCard 
              title="Product Trend" 
              icon={<BarChart3 size={20} className="text-gray-400" />}
              color="blue"
              fullHeight={true}
            >
              <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Package size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Select a product from the table<br/>to view its inventory trend</p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Full Width Section below */}
      <div className="space-y-8">
        {/* Category Analysis Chart */}
        <SectionCard 
          title="Category Analysis" 
          subtitle="View aggregate inventory trends by category"
          icon={<BarChart3 size={20} className="text-purple-500" />}
          color="purple"
        >
          {/* Chart Local Filters */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {[
              { id: 'Match', label: 'Match', color: 'green' },
              { id: 'Gain', label: 'Gain', color: 'orange' },
              { id: 'Loss', label: 'Loss', color: 'red' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => toggleChartStatus(status.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2.5 ${
                  chartStatuses.includes(status.id)
                    ? status.color === 'green' ? 'bg-green-50 border-green-200 text-green-700' 
                    : status.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-gray-100 text-gray-400 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`w-3 h-3 rounded-full shadow-sm ${
                  chartStatuses.includes(status.id)
                    ? status.color === 'green' ? 'bg-green-500' 
                    : status.color === 'orange' ? 'bg-orange-500'
                    : 'bg-red-500'
                    : 'bg-gray-200'
                }`} />
                {status.label}
              </button>
            ))}
          </div>

          <CategoryStackedBar data={categoryData} visibleStatuses={chartStatuses} />
          <p className="mt-4 text-[11px] text-muted italic text-center">
            Showing selected status distribution for categories. Tooltip displays both item counts and total units.
          </p>
        </SectionCard>

        {/* Critical Expiry Alerts */}
        <SectionCard 
          title="Critical Expiry Alerts" 
          icon={<AlertCircle size={20} className="text-red-500" />}
          color="red"
          headerActions={
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-red-50 border border-red-100 rounded-lg p-0.5">
                <select 
                  className={`bg-transparent text-red-600 text-[10px] font-bold px-2 py-1 focus:outline-none cursor-pointer ${isAdmin ? 'border-r border-red-100' : ''}`}
                  value={expiryDaysFilter}
                  onChange={(e) => setExpiryDaysFilter(Number(e.target.value))}
                >
                  <option value={-1}>Show All</option>
                  <option value={30}>30 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={0}>Expired Only</option>
                </select>
                {isAdmin && (
                  <select 
                    className="bg-transparent text-red-600 text-[10px] font-bold px-2 py-1 focus:outline-none cursor-pointer"
                    value={expiryVisibility}
                    onChange={(e) => setExpiryVisibility(e.target.value)}
                  >
                    <option value="shown">Shown Only</option>
                    <option value="hidden">Hidden Only</option>
                    <option value="all">Show All</option>
                  </select>
                )}
              </div>
              <button 
                onClick={() => {
                  const mappedData = expiryData.map(item => ({
                    'Product': item.SKUname,
                    'Location / Warehouse': item.productLocation || 'N/A',
                    'Inventory Date': formatDate(item.dateInput || item.date),
                    'Expiry Date': formatDate(item.expirationDate),
                    'Visibility': item.hiddenFromAlerts ? 'Hidden' : 'Shown'
                  }))
                  exportToCSV(mappedData, 'critical_expiry_report')
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                <FileDown size={14} />
                Export
              </button>
              <Badge variant="missing">{expiryData.length} Items</Badge>
            </div>
          }
        >
          {isAdmin && (
            <div className="p-4 bg-red-50/30 border-b border-red-100/50 mb-4 rounded-t-xl overflow-x-auto">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] uppercase font-bold text-red-400 mb-1.5 block tracking-wider">Inventory Date Filter</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-300" size={14} />
                      <input 
                        type="date" 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-red-100 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all"
                        value={expiryInventoryDateFrom}
                        onChange={(e) => setExpiryInventoryDateFrom(e.target.value)}
                      />
                    </div>
                    <span className="text-red-300 text-xs font-bold">to</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-300" size={14} />
                      <input 
                        type="date" 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-red-100 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all"
                        value={expiryInventoryDateTo}
                        onChange={(e) => setExpiryInventoryDateTo(e.target.value)}
                      />
                    </div>
                    {(expiryInventoryDateFrom || expiryInventoryDateTo) && (
                      <button 
                        onClick={() => { setExpiryInventoryDateFrom(''); setExpiryInventoryDateTo(''); }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                        title="Clear Dates"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    disabled={expiryData.length === 0 || bulkHideMutation.isLoading}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to hide all ${expiryData.length} visible items?`)) {
                        const ids = expiryData.map(item => item._id || item.id);
                        bulkHideMutation.mutate({ ids, hidden: true });
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      expiryData.length === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-red-200'
                    }`}
                  >
                    {bulkHideMutation.isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <EyeOff size={14} />
                    )}
                    Hide All Visible
                  </button>
                  
                  {expiryVisibility === 'hidden' && (
                    <button
                      disabled={expiryData.length === 0 || bulkHideMutation.isLoading}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to show all ${expiryData.length} hidden items?`)) {
                          const ids = expiryData.map(item => item._id || item.id);
                          bulkHideMutation.mutate({ ids, hidden: false });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 active:scale-95 transition-all shadow-sm shadow-green-200"
                    >
                      <Eye size={14} />
                      Show All Hidden
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <ExpiryTable data={expiryData} />
        </SectionCard>
      </div>



      {/* History Modal */}
      <Modal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        {selectedProduct && (
          <ProductTrendTable 
            data={inventoryData.filter(s => s.id === selectedProduct.id)}
            productName={selectedProduct.SKUname}
            sku={selectedProduct.id}
            onClose={() => setIsHistoryModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  )
}

export default InventoryView
