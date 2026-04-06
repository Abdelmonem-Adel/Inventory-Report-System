import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { formatDate, getExpiryStatus } from '../../utils/dateUtils'
import { BellOff, Bell, Loader2 } from 'lucide-react'
import { useToggleAlertVisibility } from '../../api/hooks'

const ExpiryTable = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = ['admin', 'top_admin'].includes(user.role)
  const mutation = useToggleAlertVisibility()

  const handleToggleVisibility = (item) => {
    // Try both _id (Mongo) and id (System)
    const id = item._id || item.id;
    if (!id) {
      console.error('No valid ID found for scan:', item);
      return;
    }
    mutation.mutate(id);
  }

  const filteredData = useMemo(() => {
    if (isAdmin) return data;
    return data.filter(item => !item.hiddenFromAlerts);
  }, [data, isAdmin])

  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'Product',
          accessorKey: 'SKUname',
          cell: ({ row }) => (
            <div className={`flex flex-col ${row.original.hiddenFromAlerts ? 'opacity-50' : ''}`}>
              <span className="font-bold text-gray-900">{row.original.SKUname}</span>
              <span className="text-10px text-muted font-medium mt-0.5">{row.original.id}</span>
            </div>
          )
        },
        {
          header: 'Location / Warehouse',
          accessorKey: 'productLocation',
          cell: ({ row, getValue }) => (
            <span className={`text-xs font-semibold text-gray-600 ${row.original.hiddenFromAlerts ? 'opacity-50' : ''}`}>
              {getValue() || 'N/A'}
            </span>
          )
        },
        {
          header: 'Inventory Date',
          id: 'inventoryDate',
          accessorFn: (row) => row.dateInput || row.date,
          cell: ({ row, getValue }) => (
            <span className={`text-xs font-medium text-gray-500 ${row.original.hiddenFromAlerts ? 'opacity-50' : ''}`}>
              {formatDate(getValue())}
            </span>
          )
        },
        {
          header: 'Expiry Date',
          accessorKey: 'expirationDate',
          cell: ({ row, getValue }) => {
            const value = getValue()
            const status = getExpiryStatus(value)
            const colors = {
              expired: 'text-red-600 font-bold',
              critical: 'text-orange-600 font-bold',
              warning: 'text-orange-500 font-bold',
              safe: 'text-gray-900',
              none: 'text-gray-400'
            }
            return (
              <span className={`text-xs ${colors[status]} ${row.original.hiddenFromAlerts ? 'opacity-50' : ''}`}>
                {formatDate(value)}
              </span>
            )
          }
        }
      ]

      if (isAdmin) {
        cols.push({
          header: 'Actions',
          id: 'actions',
          cell: ({ row }) => {
            const isToggling = mutation.isLoading && mutation.variables === (row.original._id || row.original.id);
            return (
              <button
                onClick={() => handleToggleVisibility(row.original)}
                disabled={isToggling}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  row.original.hiddenFromAlerts
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                }`}
                title={row.original.hiddenFromAlerts ? 'Show Alert' : 'Hide Alert'}
              >
                {isToggling ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : row.original.hiddenFromAlerts ? (
                  <>
                    <Bell size={14} />
                    <span>Show</span>
                  </>
                ) : (
                  <>
                    <BellOff size={14} />
                    <span>Hide</span>
                  </>
                )}
              </button>
            );
          }
        })
      }

      return cols
    },
    [isAdmin, mutation.isLoading, mutation.variables]
  )

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
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'expirationDate', desc: false }]
    }
  })

  return (
    <>
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50/90 backdrop-blur-sm">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 table-header border-b border-gray-100">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${row.original.hiddenFromAlerts ? 'bg-gray-50/30 italic' : ''}`}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted italic">
                  No critical expiry alerts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {pageCount > 1 && (
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
      )}
    </>
  )
}

export default ExpiryTable
