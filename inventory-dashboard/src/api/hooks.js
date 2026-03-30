import { useQuery } from '@tanstack/react-query'
import client from './client'

export const useScans = () => {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data } = await client.get('/locations/scans')
      return Array.isArray(data) ? data : (data.data || [])
    },
    refetchInterval: 60000, // Auto-refresh every 60s as requested
  })
}

export const useKpis = () => {
  return useQuery({
    queryKey: ['inventory', 'kpis'],
    queryFn: async () => {
      const { data } = await client.get('/inventory/kpis')
      return data
    },
  })
}

export const useInventoryData = () => {
  return useQuery({
    queryKey: ['inventory', 'data'],
    queryFn: async () => {
      const { data } = await client.get('/inventory/data')
      return data
    },
  })
}

export const useUniqueInventorySummary = () => {
  return useQuery({
    queryKey: ['uniqueInventorySummary'],
    queryFn: async () => {
      const { data } = await client.get('/unique-inventory-summary')
      return Array.isArray(data) ? data : []
    },
    refetchInterval: 60000,
  })
}
