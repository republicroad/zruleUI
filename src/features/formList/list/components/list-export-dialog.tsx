import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { formListService } from '../service/list'
import type { _List } from '../data/schema'

const formSchema = z.object({
  list_name: z.string(),
  list_id: z.string(),
  file_type: z.enum(['csv', 'xlsx']),
})

type ListExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: _List
}

export function ListExportDialog({
  open,
  onOpenChange,
  currentRow
}: ListExportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      list_name: currentRow ? currentRow.list_name : '',
      list_id: currentRow ? currentRow.list_id : '',
      file_type: 'csv',
    },
  })

  const exportMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) =>
      formListService.exportFormList(values),
    onSuccess: async (blob, values) => {
      const fileName = `${values.list_name || values.list_id}.${values.file_type}`
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      toast.promise(sleep(0.01), {
        loading: 'export form list...',
        success: () => `export form list ${values.list_name} success`,
        error: 'Error',
      })

      form.reset({
        list_name: currentRow ? currentRow.list_name : '',
        list_id: currentRow ? currentRow.list_id : '',
        file_type: 'csv',
      })
      onOpenChange(false)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'export form list failed'
      toast.error(message)
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    exportMutation.mutate(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset({
          list_name: currentRow ? currentRow.list_name : '',
          list_id: currentRow ? currentRow.list_id : '',
          file_type: 'csv',
        })
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle> 文件导出</DialogTitle>
          <DialogDescription>
            Export list quickly from a csv/xlxs file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='list-export-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField 
              control={form.control}
              name='list_id'
              render={() => (
                <FormItem className='my-2' hidden >
                  <FormLabel>list_id</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      defaultValue={currentRow.list_id}
                      className='h-8 py-0'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField 
              control={form.control}
              name='list_name'
              render={() => (
                <FormItem className='my-2' >
                  <FormLabel>名单名称</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      defaultValue={currentRow.list_name}
                      className='h-8 py-0'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField 
              control={form.control}
              name='file_type'
              render={({ field }) => (
                <FormItem className='my-2' >
                  <FormLabel>文件类型</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='csv' />
                        </FormControl>
                        <FormLabel className='font-normal'>csv</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='xlsx' />
                        </FormControl>
                        <FormLabel className='font-normal'>xlsx</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>

                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button
            type='submit'
            form='list-export-form'
            disabled={exportMutation.isPending}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
