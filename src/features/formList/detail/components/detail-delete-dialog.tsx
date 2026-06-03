import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type detailList } from '../data/schema'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { listDataService } from '../service/list-data'


type DetailListDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: detailList
}

export function DetailListDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DetailListDeleteDialogProps) {
  const queryClient = useQueryClient()

  async function handleDelete(){
      const res = await listDataService.deleteListData({
        data_id: currentRow.id,
      })
      toast.promise(sleep(0.01), {
        loading: 'delete list data...',
        success: () => {
          return  `delete list data ${currentRow.value} success`
        },
        error: 'Error',
      })
      onOpenChange(false)
      return await res
    }
  
  const mutation = useMutation({
    mutationFn: handleDelete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['/formList/detail', currentRow.list_id],})
    },
  })
  
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={mutation.mutate}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
          是否确认删除当前名单数据：{' '}
            <span className='font-bold'>{currentRow.value}</span>?
          </p>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}