import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { formatDate } from '../../utils/dateUtils'

const DiscrepancyTable = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Product',
        accessorKey: 'SKUname',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 line-clamp-1">{row.original.SKUname}</span>
            <span className="text-[10px] text-muted font-medium">{row.original.id}</span>
          </div>
        )
      },
      {
        header: 'Location',
        accessorKey: 'productLocation',
        cell: ({ getValue }) => <span className="text-xs font-semibold text-gray-600">{getValue()}</span>
      },
      {
        header: 'Physical QTY',
        accessorKey: 'finalQuantity',
        cell: ({ getValue }) => (
          <div className="bg-amber-100/50 text-amber-700 px-3 py-1 rounded-lg border border-amber-200 inline-block font-extrabold text-sm">
            {getValue()}
          </div>
        )
      },
      {
        header: 'Date',
        id: 'date',
        accessorFn: (row) => row.dateInput || row.date,
        cell: ({ getValue }) => <span className="text-[11px] font-medium text-gray-400">{formatDate(getValue())}</span>
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
  })

  return (
    <>
      <div className="overflow-y-auto max-h-[730px] custom-scrollbar border border-gray-100 rounded-xl">
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

export default DiscrepancyTable
