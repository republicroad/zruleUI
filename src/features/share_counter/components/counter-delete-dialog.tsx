import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type shareCounter } from '../data/schema'
import { counterService } from '../service/counter'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'


type CounterDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: shareCounter
}

export function CountersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CounterDeleteDialogProps) {
  const queryClient = useQueryClient()

  async function handleDelete(){
     const res = await counterService.deleteCounter({
        id: currentRow.id,
        user_id: currentRow.user_id,
      })
      toast.promise(sleep(0.01), {
        loading: 'delete counter...',
        success: () => {
          return  `delete counter ${currentRow.counter_name} success`
        },
        error: 'Error',
      })
      onOpenChange(false)
      return await res
    }
  
  const mutation = useMutation({
    mutationFn: handleDelete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/counter'] })
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
          是否确认删除当前计数器：{' '}
            <span className='font-bold'>{currentRow.counter_name}</span>?
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
