import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import Badge from '../ui/Badge'
import { FileDown, History } from 'lucide-react'
import { exportToCSV } from '../../utils/csvExport'

const InventoryTable = ({ data, onViewHistory, selectedId, onSelect }) => {
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.ceil(data.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);
  const columns = useMemo(
    () => [
      {
        header: 'Product',
        accessorKey: 'SKUname',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{row.original.SKUname}</span>
            <span className="text-10px text-gray-400 font-medium mt-0.5">{row.original.id}</span>
          </div>
        )
      },
      {
        header: 'category',
        accessorKey: 'category',
        cell: ({ getValue }) => <span className="text-xs text-gray-400 font-medium">{getValue() || 'N/A'}</span>
      },
      {
        header: 'Product Status',
        accessorKey: 'productStatus',
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
        header: 'Action',
        id: 'action',
        cell: ({ row }) => (
          <button 
            onClick={() => onViewHistory(row.original)}
            className="flex items-center gap-1.5 text-success font-bold text-sm hover:text-success/80 transition-colors"
          >
            <History size={16} />
            View History
          </button>
        )
      }
    ],
    [onViewHistory]
  )

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'productStatus', desc: false }]
    }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto max-h-[500px] flex-1 custom-scrollbar border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50/80 backdrop-blur-sm">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 table-header border-b border-gray-100">
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const isSelected = row.original.id === selectedId
              return (
                <tr 
                  key={row.id} 
                  onClick={() => onSelect && onSelect(row.original)}
                  className={`
                    border-b border-gray-100 transition-all cursor-pointer
                    ${isSelected 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500 shadow-sm' 
                      : 'hover:bg-gray-50/50'}
                  `}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="mx-2 text-sm text-gray-500">Page {page} of {pageCount}</span>
        <button
          onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          disabled={page === pageCount}
          className="px-3 py-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default InventoryTable
