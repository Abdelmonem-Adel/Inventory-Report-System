import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { formatDate, getExpiryStatus } from '../../utils/dateUtils'

const ExpiryTable = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Product',
        accessorKey: 'SKUname',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{row.original.SKUname}</span>
            <span className="text-10px text-muted font-medium mt-0.5">{row.original.id}</span>
          </div>
        )
      },
      {
        header: 'Location / Warehouse',
        accessorKey: 'productLocation',
        cell: ({ getValue }) => <span className="text-xs font-semibold text-gray-600">{getValue() || 'N/A'}</span>
      },
      {
        header: 'Inventory Date',
        id: 'inventoryDate',
        accessorFn: (row) => row.dateInput || row.date,
        cell: ({ getValue }) => <span className="text-xs font-medium text-gray-500">{formatDate(getValue())}</span>
      },
      {
        header: 'Expiry Date',
        accessorKey: 'expirationDate',
        cell: ({ getValue }) => {
          const value = getValue()
          const status = getExpiryStatus(value)
          const colors = {
            expired: 'text-red-600 font-bold',
            critical: 'text-orange-600 font-bold',
            warning: 'text-orange-500 font-bold',
            safe: 'text-gray-900',
            none: 'text-gray-400'
          }
          return <span className={`text-xs ${colors[status]}`}>{formatDate(value)}</span>
        }
      }
    ],
    []
  )

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.ceil(data.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

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
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted italic">
                  No critical expiry alerts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
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
    </>
  )
}

export default ExpiryTable
