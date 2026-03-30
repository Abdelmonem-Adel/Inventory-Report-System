import React, { useMemo, useState } from 'react'
import { useScans } from '../api/hooks'
import { 
  computeProductivityMetrics,
  getProductivityReportData, 
  getStaffOverviewData,
  getProp
} from '../utils/computeProductivity'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import SectionCard from '../components/ui/SectionCard'
import ProductivityReportTable from '../components/tables/ProductivityReportTable'
import StaffProductivityChart from '../components/charts/StaffProductivityChart'
import { Clock, Calendar, TrendingUp } from 'lucide-react'
import { isValid } from 'date-fns'


const ProductivityView = () => {
  const { data: scans, isLoading, isError, error, refetch } = useScans()
  const [showHourlyDetail, setShowHourlyDetail] = useState(true)
  const [employeeFilter, setEmployeeFilter] = useState(['All Employees'])

  const [cardDateFrom, setCardDateFrom] = useState('')
  const [cardDateTo, setCardDateTo] = useState('')

  const effectiveDateFrom = cardDateFrom || ''
  const effectiveDateTo = cardDateTo || cardDateFrom || ''

  const parseScanDateToUTC = (rawDate) => {
    let d
    if (typeof rawDate === 'string') {
      const isFullISO = rawDate.includes('T') && rawDate.split('T')[1].length > 5
      const isFullSpace = rawDate.includes(' ') && rawDate.split(' ')[1].length > 5
      if (isFullISO || isFullSpace) {
        d = new Date(rawDate)
      } else {
        const datePart = rawDate.split('T')[0].split(' ')[0]
        const parts = datePart.split('-')
        if (parts.length === 3) {
          d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        } else {
          d = new Date(rawDate)
        }
      }
    } else {
      d = rawDate ? new Date(rawDate) : null
    }
    return isValid(d) ? d : null
  }

  const scansForCards = useMemo(() => {
    if (!scans || !Array.isArray(scans)) return []
    let filtered = scans
    // Filter by date range if specified
    if (effectiveDateFrom || effectiveDateTo) {
      filtered = filtered.filter(scan => {
        const rawDate = getProp(scan, 'dateInput') || getProp(scan, 'date')
        const d = parseScanDateToUTC(rawDate)
        if (!d) return false
        const iso = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
        if (effectiveDateFrom && iso < effectiveDateFrom) return false
        if (effectiveDateTo && iso > effectiveDateTo) return false
        return true
      })
    }
    // Filter by employee if specified
    if (employeeFilter && !employeeFilter.includes('All Employees')) {
      filtered = filtered.filter(scan => {
        const name = getProp(scan, 'userName') || getProp(scan, 'username')
        return employeeFilter.includes(name)
      })
    }
    return filtered
  }, [scans, effectiveDateFrom, effectiveDateTo, employeeFilter])

  const daysCountOverride = useMemo(() => {
    if (!effectiveDateFrom || !effectiveDateTo) return undefined
    const start = new Date(`${effectiveDateFrom}T00:00:00.000Z`)
    const end = new Date(`${effectiveDateTo}T00:00:00.000Z`)
    if (!isValid(start) || !isValid(end)) return undefined
    const diffMs = end.getTime() - start.getTime()
    if (diffMs < 0) return undefined
    return Math.floor(diffMs / 86400000) + 1 // inclusive
  }, [effectiveDateFrom, effectiveDateTo])

  const metrics = useMemo(() => {
    return computeProductivityMetrics(scansForCards, { daysCountOverride })
  }, [scansForCards, daysCountOverride])

  const reportData = useMemo(() => getProductivityReportData(scans, {}), [scans])
  const staffData = useMemo(() => getStaffOverviewData(scans), [scans])
  
  const employees = useMemo(() => {
    if (!scans) return []
    const set = new Set(scans.map(s => {
      let name = getProp(s, 'userName') || getProp(s, 'username')
      return name ? name.toString().trim() : null
    }).filter(Boolean))
    return Array.from(set).sort()
  }, [scans])



  if (isLoading) return <Spinner size="lg" />
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">


      {/* Header Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <SectionCard 
          title="Hourly Productivity" 
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
          color="indigo"
          fullHeight={true}
        >
          <div className="py-2 flex flex-col justify-between h-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Average Items</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-gray-900">{metrics.hourly.itemsAvg}</div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">/ Hr</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Average Locations</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-gray-900">{metrics.hourly.locationsAvg}</div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">/ Hr</div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="text-xs font-bold text-indigo-500 text-center uppercase tracking-widest">
                Man Efficiency per hour
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Daily Productivity" 
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          color="blue"
          fullHeight={true}
        >
          <div className="py-2 flex flex-col justify-between h-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Average Items</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-gray-900">{metrics.daily.itemsAvg}</div>
                  <div className="text-xs font-bold text-blue-600 mb-1">/ Day</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Average Locations</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-gray-900">{metrics.daily.locationsAvg}</div>
                  <div className="text-xs font-bold text-blue-600 mb-1">/ Day</div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="text-xs font-bold text-blue-500 text-center uppercase tracking-widest">
                Man Efficiency per day
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="w-full">
        <SectionCard title="Staff Productivity Overview" icon={<TrendingUp size={22} className="text-blue-500" />}>
          <div className="h-[600px]">
            <StaffProductivityChart data={staffData} />
          </div>
        </SectionCard>
      </div>

      <div className="w-full">
        <ProductivityReportTable 
          scans={scans}
          data={reportData}
          employees={employees}
          showHourlyDetail={showHourlyDetail}
          onToggleHourlyDetail={() => setShowHourlyDetail(!showHourlyDetail)}
          onDateRangeChange={(from, to) => {
            setCardDateFrom(from || '')
            setCardDateTo(to || '')
          }}
          onEmployeeFilterChange={setEmployeeFilter}
        />
      </div>
    </div>
  )
}

export default ProductivityView
