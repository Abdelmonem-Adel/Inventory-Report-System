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

  // Use data directly as filtering is now handled by the parent
  const tableData = data;

  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'Product',
          accessorKey: 'SKUname',
          cell: ({ row }) => (
            <div className={`flex flex-col ${row.original.hiddenFromAlerts ? 'opacity-40' : ''}`}>
              <span className="font-bold text-primary">{row.original.SKUname}</span>
              <span className="text-10px text-muted font-medium mt-0.5">{row.original.id}</span>
            </div>
          )
        },
        {
          header: 'Location / Warehouse',
          accessorKey: 'productLocation',
          cell: ({ row, getValue }) => (
            <span className={`text-xs font-semibold text-muted ${row.original.hiddenFromAlerts ? 'opacity-40' : ''}`}>
              {getValue() || 'N/A'}
            </span>
          )
        },
        {
          header: 'Inventory Date',
          id: 'inventoryDate',
          accessorFn: (row) => row.dateInput || row.date,
          cell: ({ row, getValue }) => (
            <span className={`text-xs font-medium text-muted/80 ${row.original.hiddenFromAlerts ? 'opacity-40' : ''}`}>
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
              expired: 'text-danger font-bold',
              critical: 'text-warning font-bold',
              warning: 'text-warning/80 font-bold',
              safe: 'text-primary',
              none: 'text-muted'
            }
            return (
              <span className={`text-xs ${colors[status]} ${row.original.hiddenFromAlerts ? 'opacity-40' : ''}`}>
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
                    ? 'bg-accent/10 text-accent hover:bg-accent/20'
                    : 'bg-page text-muted hover:bg-danger/10 hover:text-danger'
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

  // handleToggleVisibility for the actions column
  const handleToggleVisibility = (item) => {
    const id = item._id || item.id;
    if (!id) return;
    mutation.mutate(id);
  }

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.ceil(tableData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

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
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar border border-border rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-page/90 backdrop-blur-sm">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 table-header border-b border-border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={`border-b border-border hover:bg-page/50 transition-colors animate-in fade-in duration-300 ${row.original.hiddenFromAlerts ? 'bg-page/30 grayscale-[0.5] opacity-80' : ''}`}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted italic">
                    <BellOff size={32} className="opacity-20 mb-2" />
                    <p>No critical expiry alerts found for the current filters.</p>
                  </div>
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
            className="px-3 py-1 rounded bg-page border border-border text-primary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2 text-sm text-muted">Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="px-3 py-1 rounded bg-page border border-border text-primary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}

export default ExpiryTable
