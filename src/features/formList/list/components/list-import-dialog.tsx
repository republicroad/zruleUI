import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { formListService } from '../service/list'
import type { _List } from '../data/schema'

const formSchema = z.object({
  list_name: z.string(),
  list_id: z.string(),
  user_id: z.string(),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file.',
    })
    .refine(
      (files) =>
        [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(files?.[0]?.type),
      'Please upload csv/xlsx format.'
    ),
})

type ListImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: _List
}

export function ListImportDialog({
  open,
  onOpenChange,
  currentRow
}: ListImportDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      list_name: currentRow ? currentRow.list_name : '',
      list_id: currentRow ? currentRow.list_id : '',
      user_id: currentRow ? currentRow.user_id : '',
      file: undefined,
    },
  })

  useEffect(() => {
    const dataTransfer = new DataTransfer()
    files.forEach((file) => dataTransfer.items.add(file))
    form.setValue('file', dataTransfer.files, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [files, form])

  const importMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) =>{
      const filedata = new FormData()
      files.forEach((file) => {
        filedata.append('file', file)
      })

    const res =  await formListService.uploadFormList({
       list_id: values.list_id,
       list_name: values.list_name,
       user_id: values.user_id,
       data: filedata,
     })
     return await res
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    importMutation.mutate(values,
      {
      onSuccess: () => {
        toast.promise(sleep(0.01), {
          loading: 'import form list...',
          success: () => `import form list ${values.list_name} success`,
          error: 'Error',
        })
        queryClient.invalidateQueries({ queryKey: ['/formList/list'] })
        setFiles([])
        form.reset({
          list_name: currentRow ? currentRow.list_name : '',
          list_id: currentRow ? currentRow.list_id : '',
          user_id: currentRow ? currentRow.user_id : '',
          file: undefined,
        })
        onOpenChange(false)
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'import form list failed'
        toast.error(message)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
        setFiles([])
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle> 文件导入</DialogTitle>
          <DialogDescription>
            Import list quickly from a csv/xlsx file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='list-import-form' onSubmit={form.handleSubmit(onSubmit)}>
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
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={files}
                      onValueChange={setFiles}
                      maxFiles={1}
                      accept='text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    >
                      <FileUploadDropzone className='py-4'>
                        <div className='flex items-center gap-2'>
                          <Upload className='size-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            Drop files or
                          </span>
                          <FileUploadTrigger asChild>
                            <Button variant='link' size='sm' className='h-auto p-0'>
                              browse
                            </Button>
                          </FileUploadTrigger>
                        </div>
                      </FileUploadDropzone>
                      <FileUploadList>
                        {files.map((file, index) => (
                          <FileUploadItem key={index} value={file} className='p-2'>
                            <FileUploadItemPreview className='size-8' />
                            <FileUploadItemMetadata size='sm' />
                            <FileUploadItemDelete asChild>
                              <Button variant='ghost' size='icon' className='size-6'>
                                <X className='size-3' />
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>
                  </FormControl>
                  <FormMessage />
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
            form='list-import-form'
            disabled={importMutation.isPending}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
