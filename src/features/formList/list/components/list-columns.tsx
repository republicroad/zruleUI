import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type _List } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const listColumns: ColumnDef<_List>[] = [
  {
    accessorKey: 'list_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='名单名称' />
    ),
    cell: ({ row }) => (
      <Link
        to={
          `/formList/detail?list_id=${row.getValue('list_id')}` as unknown as any
        }
        className='inline-block text-primary/80 underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary'
      >
        <LongText className='max-w-36 ps-3'>
          {row.getValue('list_name')}
        </LongText>
      </Link>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'list_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='名单编号' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>
        <button
          onClick={() => navigator.clipboard.writeText(row.getValue('list_id'))}
        >
          {row.getValue('list_id')}
        </button>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'user_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='所属用户' />
    ),
    cell: ({ row }) => (
      <LongText className='w-fit ps-2 text-nowrap'>
        {row.getValue('user_name')}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'create_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>
        {row.getValue('create_time')}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
