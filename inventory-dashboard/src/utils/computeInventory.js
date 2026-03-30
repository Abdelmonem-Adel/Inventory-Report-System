import { parseISO, isValid } from 'date-fns'

export const computeInventoryMetrics = (Inventory, filters = {}) => {
  // Apply filters first
  let filtered = Inventory.filter(scan => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const match = (scan.SKUname || '').toLowerCase().includes(search) ||
        (scan.barcode || '').toLowerCase().includes(search) ||
        (scan.id || '').toLowerCase().includes(search)
      if (!match) return false
    }

    if (filters.category && Array.isArray(filters.category) && filters.category.length > 0 && !filters.category.includes('All Categories')) {
      const itemCategories = (scan.category || '').split(',').map(c => c.trim())
      const hasMatch = filters.category.some(cat => itemCategories.includes(cat))
      if (!hasMatch) return false
    }

    if (filters.status && filters.status !== 'All Statuses') {
      if (scan.productStatus !== filters.status) return false
    }

    if (filters.dateFrom) {
      const scanDateRaw = scan.dateInput || scan.date
      const scanDate = scanDateRaw ? new Date(scanDateRaw) : null
      if (isValid(scanDate) && scanDate < new Date(filters.dateFrom)) return false
    }

    if (filters.dateTo) {
      const scanDateRaw = scan.dateInput || scan.date
      const scanDate = scanDateRaw ? new Date(scanDateRaw) : null
      if (isValid(scanDate)) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59, 999) // Include the full "To" day
        if (scanDate > dateTo) return false
      }
    }

    return true
  })

  // Row 1 metrics
  const uniqueItems = new Set(filtered.map(s => s.id))
  const totalItems = uniqueItems.size
  const totalRecords = filtered.length
  const totalMatch = filtered.filter(s => s.productStatus === 'Match').length
  const totalGain = filtered.filter(s => s.productStatus === 'Extra').length
  const totalLoss = filtered.filter(s => s.productStatus === 'Missing').length

  // Row 2 metrics (sum of quantities)
  const totalPieces = filtered.reduce((sum, s) => sum + (Number(s.finalQuantity) || 0), 0)
  const matchPieces = filtered.filter(s => s.productStatus === 'Match')
    .reduce((sum, s) => sum + (Number(s.finalQuantity) || 0), 0)
  const gainPieces = filtered.filter(s => s.productStatus === 'Extra')
    .reduce((sum, s) => sum + (Number(s.finalQuantity) || 0), 0)
  const lossPieces = filtered.filter(s => s.productStatus === 'Missing')
    .reduce((sum, s) => sum + (Number(s.finalQuantity) || 0), 0)

  // Row 3 (Percentages)
  const overallAccuracy = totalRecords > 0
    ? (filtered.filter(s => s.productStatus === 'Match').length / totalRecords) * 100
    : 0

  const matchPercent = totalRecords > 0 ? (totalMatch / totalRecords) * 100 : 0
  const gainPercent = totalRecords > 0 ? (totalGain / totalRecords) * 100 : 0
  const lossPercent = totalRecords > 0 ? (totalLoss / totalRecords) * 100 : 0

  return {
    filtered,
    summary: {
      totalItems, totalMatch, totalGain, totalLoss,
      totalPieces, matchPieces, gainPieces, lossPieces,
      overallAccuracy, matchPercent, gainPercent, lossPercent
    }
  }
}

export const getLatestBySKU = (Inventory) => {
  const groups = Inventory.reduce((acc, scan) => {
    if (!acc[scan.id]) acc[scan.id] = []
    acc[scan.id].push(scan)
    return acc
  }, {})

  return Object.values(groups).map(group => {
    return group.reduce((latest, current) => {
      const latestDateRaw = latest.dateInput || latest.date
      const currentDateRaw = current.dateInput || current.date
      const latestDate = new Date(latestDateRaw)
      const currentDate = new Date(currentDateRaw)
      return currentDate > latestDate ? current : latest
    })
  }).sort((a, b) => {
    // Missing first, then Extra, then Match
    const statusOrder = { 'Missing': 0, 'Extra': 1, 'Match': 2 }
    return statusOrder[a.productStatus] - statusOrder[b.productStatus]
  })
}

export const getCategoryAnalysis = (Inventory) => {
  const catMap = {}
  Inventory.forEach(scan => {
    const cats = (scan.category || 'Uncategorized').split(',').map(c => c.trim())
    cats.forEach(cat => {
      if (!catMap[cat]) catMap[cat] = { name: cat, Match: 0, Gain: 0, Loss: 0, totalUnits: 0 }
      if (scan.productStatus === 'Match') catMap[cat].Match++
      else if (scan.productStatus === 'Extra') catMap[cat].Gain++
      else if (scan.productStatus === 'Missing') catMap[cat].Loss++
      catMap[cat].totalUnits += (Number(scan.finalQuantity) || 0)
    })
  })
  return Object.values(catMap)
}
