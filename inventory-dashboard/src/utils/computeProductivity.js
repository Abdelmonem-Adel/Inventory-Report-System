import { isValid } from 'date-fns'

export const getProp = (obj, key) => {
  if (!obj) return undefined
  if (obj[key] !== undefined) return obj[key]
  const lowerKey = key.toLowerCase()
  const actualKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey)
  return actualKey ? obj[actualKey] : undefined
}

export const computeProductivityMetrics = (scans, options = {}) => {
  if (!scans || !Array.isArray(scans) || scans.length === 0) return { 
    hourly: { itemsAvg: 0, locationsAvg: 0 }, 
    daily: { itemsAvg: 0, locationsAvg: 0 } 
  }

  // Assumption for UI display:
  // "Hourly" averages are derived from "Daily" averages by dividing by 5 hours per day.
  const HOURS_PER_DAY = 5

  // For daily averages:
  // - uniqueDaysCount: unique inventory days (regardless of employee)
  // - uniqueEmployeesCount: unique employees (userName/username)
  // The requested formula divides totals by (uniqueDaysCount * uniqueEmployeesCount).
  const uniqueDays = new Set()
  const uniqueEmployees = new Set()
  const uniqueHours = new Set()
  const uniqueLocations = new Set()

  let totalItems = 0

  scans.forEach(scan => {
    const rawDate = getProp(scan, 'dateInput') || getProp(scan, 'date')
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
      d = rawDate ? new Date(rawDate) : new Date()
    }

    if (isValid(d)) {
      // Use UTC to avoid timezone shifting between DB time and browser/server locale.
      const dayStr = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
      const hourStr = d.getUTCHours().toString().padStart(2, '0')
      const emp = (getProp(scan, 'userName') || getProp(scan, 'username') || 'Unknown').toString().trim().toLowerCase()

      uniqueDays.add(dayStr)
      uniqueEmployees.add(emp)
      uniqueHours.add(`${dayStr} ${hourStr}|${emp}`) // keep hour+employee granularity for hourly averages

      // Only count items/locations when the scan has a valid date.
      if (getProp(scan, 'id') !== undefined && getProp(scan, 'id') !== null) totalItems++

      const loc = getProp(scan, 'productLocation')
      if (loc !== undefined && loc !== null && loc.toString().trim() !== '') {
        uniqueLocations.add(loc.toString().trim())
      }
    }
  })

  const daysCountFromData = uniqueDays.size > 0 ? uniqueDays.size : 1
  const daysCount = typeof options.daysCountOverride === 'number' && options.daysCountOverride > 0
    ? options.daysCountOverride
    : daysCountFromData
  const employeesCount = uniqueEmployees.size > 0 ? uniqueEmployees.size : 1
  const totalLocations = uniqueLocations.size

  const dailyItemsAvg = daysCount > 0
    ? Number((totalItems / (daysCount * employeesCount)).toFixed(1))
    : 0
  const dailyLocationsAvg = daysCount > 0
    ? Number((totalLocations / (daysCount * employeesCount)).toFixed(1))
    : 0

  return {
    hourly: { 
      itemsAvg: Number((dailyItemsAvg / HOURS_PER_DAY).toFixed(1)),
      locationsAvg: Number((dailyLocationsAvg / HOURS_PER_DAY).toFixed(1)),
    },
    daily: { 
      itemsAvg: dailyItemsAvg,
      locationsAvg: dailyLocationsAvg
    }
  }
}

export const getProductivityReportData = (scans, filters) => {
  if (!scans || !Array.isArray(scans)) return []

  const grouped = {}

  scans.forEach(scan => {
    const rawDate = getProp(scan, 'dateInput') || getProp(scan, 'date')
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
      d = rawDate ? new Date(rawDate) : new Date()
    }
    
    let dateKey = 'Unknown'
    let isoDate = 'Unknown'
    let hourKey = 'Unknown'

    if (isValid(d)) {
      dateKey = `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCFullYear().toString().slice(-2)}`
      isoDate = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
      hourKey = d.getUTCHours()
    }
    
    const emp = (getProp(scan, 'userName') || getProp(scan, 'username') || 'Unknown').toString().trim()
    const key = `${dateKey}|${emp.toLowerCase()}|${hourKey}`

    if (!grouped[key]) {
      grouped[key] = {
        date: dateKey,
        isoDate: isoDate,
        employee: emp,
        hour: hourKey,
        totalLocations: 0,
        uniqueLocations: new Set(),
        totalQty: 0,
        itemsCounted: 0,
        matches: 0,
        errors: 0,
        totalScans: 0
      }
    }

    const g = grouped[key]
    g.totalScans++
    
    const loc = getProp(scan, 'productLocation')
    if (loc && loc.toString().trim() !== '') {
      g.uniqueLocations.add(loc.toString().trim())
    }
    
    g.totalQty += Number(getProp(scan, 'finalQuantity') || 0)
    g.itemsCounted++
    
    const acc = (getProp(scan, 'accuracy') || '').toString().toLowerCase()
    if (acc === 'match' || acc.includes('match') || acc === '1') g.matches++
    else if (acc.includes('error') || acc.includes('miss') || acc.includes('lost') || acc === '0') g.errors++
  })

  return Object.values(grouped).map(g => ({
    ...g,
    totalLocations: g.uniqueLocations.size,
    accuracyRate: g.totalScans > 0 ? Math.round((g.matches / g.totalScans) * 100) : 0
  }))
}

export const getStaffOverviewData = (scans) => {
  if (!scans || !Array.isArray(scans)) return []

  const staff = {}
  scans.forEach(scan => {
    const emp = (getProp(scan, 'userName') || getProp(scan, 'username') || 'Unknown').toString().trim()
    if (!staff[emp]) {
      staff[emp] = { 
        userName: emp, 
        totalItems: 0, 
        match: 0, 
        humanError: 0 
      }
    }
    
    staff[emp].totalItems++
    const acc = (getProp(scan, 'accuracy') || '').toString().toLowerCase()
    if (acc === 'match' || acc.includes('match') || acc === '1') staff[emp].match++
    else if (acc.includes('error') || acc.includes('miss') || acc.includes('lost') || acc === '0') staff[emp].humanError++
  })

  return Object.values(staff).sort((a, b) => b.totalItems - a.totalItems)
}
