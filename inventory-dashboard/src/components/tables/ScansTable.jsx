import React, { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/dateUtils'

const ScansTable = ({ 
  data, 
  manualPagination = false, 
  pageCount = 1, 
  pageIndex = 0, 
  onPageChange 
}) => {
  const columns = useMemo(
    () => [
      // ... (rest of columns remain exactly the same)
      {
        header: 'Location',
        accessorKey: 'productLocation',
        cell: ({ getValue }) => <span className="text-xs font-bold text-gray-700">{getValue()}</span>
      },
      {
        header: 'Barcode',
        accessorKey: 'barcode',
        cell: ({ getValue }) => <span className="text-[10px] font-medium text-gray-400">{getValue()}</span>
      },
      {
        header: 'Item ID',
        accessorKey: 'id',
        cell: ({ getValue }) => <span className="text-xs font-bold text-blue-500 cursor-pointer">{getValue()}</span>
      },
      {
        header: 'Product Name',
        accessorKey: 'SKUname',
        cell: ({ getValue }) => <span className="text-xs font-bold text-gray-900 line-clamp-1">{getValue()}</span>
      },
      {
        header: 'Prod. Date',
        accessorKey: 'productionDate',
        cell: ({ getValue }) => <span className="text-[10px] text-gray-500">{formatDate(getValue())}</span>
      },
      {
        header: 'Exp. Date',
        accessorKey: 'expirationDate',
        cell: ({ getValue }) => <span className="text-[10px] text-gray-500">{formatDate(getValue())}</span>
      },
      {
        header: 'Final QTY',
        accessorKey: 'finalQuantity',
        cell: ({ getValue }) => <span className="font-bold text-gray-900">{getValue()}</span>
      },
      {
        header: 'Sys QTY',
        accessorKey: 'sysQuantity',
        cell: ({ getValue }) => <span className="text-gray-500">{getValue()}</span>
      },
      {
        header: 'Final Var',
        accessorKey: 'variance',
        cell: ({ getValue }) => {
          const value = getValue()
          const val = Number(value) || 0
          const color = val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-gray-400'
          const prefix = val > 0 ? '+' : ''
          return <span className={`font-bold ${color}`}>{prefix}{val}</span>
        }
      },
      {
        header: 'Loc. Status',
        accessorKey: 'locationStatus',
        cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge>
      },
      {
        header: 'Prod. Status',
        accessorKey: 'productStatus',
        cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge>
      },
      {
        header: 'User Name',
        accessorKey: 'userName',
        cell: ({ getValue }) => <span className="text-xs font-semibold text-purple-600">{getValue()}</span>
      },
      {
        header: 'Employee Accuracy',
        accessorKey: 'accuracy',
        cell: ({ getValue }) => {
          const value = getValue()
          return <Badge variant={value === 'Match' ? 'match' : 'error'}>{value}</Badge>
        }
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    state: manualPagination ? { pagination: { pageIndex, pageSize: 25 } } : undefined,
    onPaginationChange: manualPagination ? (updater) => {
        if (typeof updater === 'function') {
            const next = updater({ pageIndex, pageSize: 25 });
            onPageChange(next.pageIndex);
        }
    } : undefined,
    manualPagination: manualPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    initialState: manualPagination ? undefined : {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50/90 backdrop-blur-sm">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-3 table-header border-b border-gray-100 whitespace-nowrap">
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScansTable
