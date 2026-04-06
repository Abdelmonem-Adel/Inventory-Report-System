import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client, { toggleAlertVisibility } from './client'

export const useScans = () => {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data } = await client.get('/locations/scans')
      return Array.isArray(data) ? data : (data.data || [])
    },
    refetchInterval: 60000,
  })
}

export const useToggleAlertVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => toggleAlertVisibility(id),
    // Optimistic Update
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['scans'] })

      // Snapshot the previous value
      const previousScans = queryClient.getQueryData(['scans'])

      // Optimistically update to the new value
      queryClient.setQueryData(['scans'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map(scan => 
          (scan._id === id || scan.id === id) 
            ? { ...scan, hiddenFromAlerts: !scan.hiddenFromAlerts } 
            : scan
        )
      })

      // Return a context object with the snapshotted value
      return { previousScans }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      queryClient.setQueryData(['scans'], context.previousScans)
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] })
    },
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
