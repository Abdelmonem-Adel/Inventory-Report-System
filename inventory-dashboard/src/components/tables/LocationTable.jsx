import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import Badge from '../ui/Badge'
import { Eye } from 'lucide-react'

const LocationTable = ({ data, onViewDetails }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Product Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <span className="font-bold text-gray-900">{getValue()}</span>
      },
      {
        header: 'Item ID',
        accessorKey: 'id',
        cell: ({ getValue }) => <span className="text-xs font-semibold text-accent">{getValue()}</span>
      },
      {
        header: 'Match Locs',
        accessorKey: 'matchLocs',
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <span className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold">
              {getValue()}
            </span>
          </div>
        )
      },
      {
        header: 'Miss Match Locs',
        accessorKey: 'missMatchLocs',
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-default">
              {getValue()}
            </span>
          </div>
        )
      },
      {
        header: 'Total FinalQTY',
        accessorKey: 'totalFinalQty',
        cell: ({ getValue }) => <span className="font-bold text-gray-900">{getValue()}</span>
      },
      {
        header: 'Total Sys QTY',
        accessorKey: 'totalSysQty',
        cell: ({ getValue }) => <span className="font-medium text-gray-500">{getValue()}</span>
      },
      {
        header: 'QTY Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Badge variant={value}>
              {value}
            </Badge>
          )
        }
      },
      {
        header: 'View Details',
        id: 'view',
        cell: ({ row }) => (
          <button 
            onClick={() => onViewDetails(row.original)}
            className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <Eye size={16} />
            View
          </button>
        )
      }
    ],
    [onViewDetails]
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

export default LocationTable
