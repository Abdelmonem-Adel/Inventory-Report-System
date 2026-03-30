import { format, parseISO, isValid, isWithinInterval, addDays } from 'date-fns'

export const INVALID_DATE = '1899-12-30T00:00:00.000Z'

export const formatDate = (dateString) => {
  if (!dateString || dateString === INVALID_DATE) return '—'
  const date = parseISO(dateString)
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '—'
}

export const formatFullTime = (date) => {
  return format(date || new Date(), 'HH:mm:ss')
}

export const isNearExpiry = (dateString, days = 30) => {
  if (!dateString || dateString === INVALID_DATE) return false
  const expiryDate = parseISO(dateString)
  if (!isValid(expiryDate)) return false
  
  const today = new Date()
  const limit = addDays(today, days)
  
  return expiryDate <= limit
}

export const getExpiryStatus = (dateString) => {
  if (!dateString || dateString === INVALID_DATE) return 'none'
  const expiryDate = parseISO(dateString)
  if (!isValid(expiryDate)) return 'none'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (expiryDate < today) return 'expired'
  
  const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) return 'critical'
  if (diffDays <= 30) return 'warning'
  
  return 'safe'
}
