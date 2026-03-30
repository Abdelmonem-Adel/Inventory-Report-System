export const computeLocationMetrics = (scans) => {
  if (!scans || !Array.isArray(scans) || scans.length === 0) {
    return {
      totalProducts: 0,
      totalLocations: 0,
      productStatus: { match: 0, mismatch: 0, matchPercent: 0, mismatchPercent: 0 },
      locationStatus: { match: 0, mismatch: 0, matchPercent: 0, mismatchPercent: 0 }
    }
  }

  const totalProducts = new Set(scans.map(s => s.id)).size
  const totalLocations = new Set(scans.map(s => s.productLocation)).size

  // Location status counts (record-level), used in "Location Status" card.
  const locStatusMatch = scans.filter(s => s.locationStatus === 'Match').length
  const locStatusMismatch = scans.filter(s => s.locationStatus !== 'Match').length

  const locDenom = scans.length
  const locMatchPercent = locDenom > 0 ? (locStatusMatch / locDenom) * 100 : 0
  const locMismatchPercent = locDenom > 0 ? (locStatusMismatch / locDenom) * 100 : 0

  // Product status counts (item-day level), used in "Product Status" card.
  // Rule:
  // For each (item id + inventory day), if ANY record has locationStatus != 'Match'
  // => that item-day counts as 1 Miss Match; otherwise 1 Match.
  const normalizeDayKey = (scan) => {
    const raw = scan.date
    if (!raw) return 'Unknown'

    if (typeof raw === 'string') {
      // If it looks like a date-only string, keep it.
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
      const d = new Date(raw)
      if (Number.isNaN(d.getTime())) return 'Unknown'
      return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
    }

    const d = raw instanceof Date ? raw : new Date(raw)
    if (Number.isNaN(d.getTime())) return 'Unknown'
    return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
  }

  const itemDayKeyToHasMismatch = new Map()
  scans.forEach(scan => {
    const dayKey = normalizeDayKey(scan)
    const itemId =  scan.id ?? 'Unknown'
    const key = `${dayKey}|${itemId}`

    const hasMismatchHere = scan.locationStatus !== 'Match'
    const prev = itemDayKeyToHasMismatch.get(key) || false
    itemDayKeyToHasMismatch.set(key, prev || hasMismatchHere)
  })

  let prodStatusMatch = 0
  let prodStatusMismatch = 0
  itemDayKeyToHasMismatch.forEach(hasMismatch => {
    if (hasMismatch) prodStatusMismatch++
    else prodStatusMatch++
  })

  const prodDenom = prodStatusMatch + prodStatusMismatch 
  const prodMatchPercent = prodDenom > 0 ? (prodStatusMatch / prodDenom) * 100 : 0
  const prodMismatchPercent = prodDenom > 0 ? (prodStatusMismatch / prodDenom) * 100 : 0

  return {
    totalProducts,
    totalLocations,
    productStatus: {
      match: prodStatusMatch,
      mismatch: prodStatusMismatch,
      matchPercent: prodMatchPercent,
      mismatchPercent: prodMismatchPercent
    },
    locationStatus: {
      match: locStatusMatch,
      mismatch: locStatusMismatch,
      matchPercent: locMatchPercent,
      mismatchPercent: locMismatchPercent
    }
  }
}

export const getPerItemLocationStats = (scans) => {
  const groups = scans.reduce((acc, scan) => {
    if (!acc[scan.id]) {
      acc[scan.id] = {
        name: scan.SKUname,
        id: scan.id,
        category: scan.category,
        matchLocs: 0,
        missMatchLocs: 0,
        totalFinalQty: 0,
        totalSysQty: 0,
        variance: 0,
        status: 'Match',
        locations: []
      }
    }
    const item = acc[scan.id]
    if (scan.locationStatus === 'Match') item.matchLocs++
    else item.missMatchLocs++
    
    item.totalFinalQty += (Number(scan.finalQuantity) || 0)
    item.totalSysQty += (Number(scan.sysQuantity) || 0)
    item.variance += (Number(scan.variance) || 0)
    item.locations.push(scan)
    
    return acc
  }, {})

  return Object.values(groups).map(item => {
    if (item.totalFinalQty > item.totalSysQty) item.status = 'Extra'
    else if (item.totalFinalQty < item.totalSysQty) item.status = 'Missing'
    else item.status = 'Match'
    return item
  })
}

export const getTopMissMatchItems = (itemStats, limit = 5) => {
  return [...itemStats]
    .sort((a, b) => b.missMatchLocs - a.missMatchLocs)
    .slice(0, limit)
}

export const getDiscrepancyPutaway = (scans) => {
  return scans.filter(s => Number(s.sysQuantity) === 0 && Number(s.finalQuantity) > 0)
}
