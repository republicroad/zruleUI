import { z } from 'zod'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
import { listDataService } from '../service/list-data'

const formSchema = z
  .object({
    list_id: z.string().min(1, 'list_id is required.'),
    list_name: z.string(),
    user_id: z.string().min(1, 'user_id is required.'),
    value: z.string().min(1, 'value is required.'),
    tag: z.string(),
    ttl: z.preprocess(
      (value) => {
        if (value === '' || value === null || typeof value === 'undefined') {
          return undefined
        }

        return Number(value)
      },
      z.number().min(0, 'ttl must be greater than or equal to 0').optional()
    ),
  })
type detailListForm = z.infer<typeof formSchema>

type DetailListInitForm = {
  list_id?: string
  list_name?: string
  user_id?: string
  value?: string
  tag?: string
  ttl?: number | string
}

type DetailListCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initform: DetailListInitForm
}
export function DetailListCreateDialog({
  open,
  onOpenChange,
  initform
}: DetailListCreateDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<detailListForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      list_id: initform.list_id || '',
      list_name: initform.list_name || '',
      user_id: initform.user_id || '',
      value: initform.value || '',
      tag: initform.tag || '',
      ttl:
        initform.ttl === '' || typeof initform.ttl === 'undefined'
          ? undefined
          : Number(initform.ttl),
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      list_id: initform.list_id || '',
      list_name: initform.list_name || '',
      user_id: initform.user_id || '',
      value: initform.value || '',
      tag: initform.tag || '',
      ttl:
        initform.ttl === '' || typeof initform.ttl === 'undefined'
          ? undefined
          : Number(initform.ttl),
    })
  }, [form, initform, open])

  const addMutation = useMutation({
    mutationFn: async (values: detailListForm) => {
      return await listDataService.createListData(values)
    },
    onSuccess: async (_, values) => {
      toast.promise(sleep(0.01), {
        loading: 'add new list data...',
        success: () => `add new list data ${values.value} success`,
        error: 'Error',
      })
      await queryClient.invalidateQueries({
        queryKey: ['/formList/detail', values.list_id],
      })
      form.reset({
        list_id: values.list_id,
        list_name: values.list_name,
        user_id: values.user_id,
        value: '',
        tag: '',
        ttl: undefined,
      })
      onOpenChange(false)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'add new list data failed'
      toast.error(message)
    },
  })

  const onSubmit = (values: detailListForm) => {
    addMutation.mutate(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset({
            list_id: initform.list_id || '',
            list_name: initform.list_name || '',
            user_id: initform.user_id || '',
            value: '',
            tag: '',
            ttl: undefined,
          })
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{'新增名单数据'}</DialogTitle>
          <DialogDescription>
            {'Create new detail list here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
          <Form {...form}>
            <form
              id='detail-add-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField 
                control={form.control}
                name='list_id'
                render={({ field }) => (
                  <FormItem
                    className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'
                    hidden
                  >
                    <FormLabel className='col-span-2 text-end'>list_id</FormLabel>
                    <FormControl>
                      <Input disabled className='col-span-4' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='user_id'
                render={({ field }) => (
                  <FormItem
                    className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'
                    hidden
                  >
                    <FormLabel className='col-span-2 text-end'>user_id</FormLabel>
                    <FormControl>
                      <Input disabled className='col-span-4' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='list_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>名单名称:</FormLabel>
                    <FormControl>
                      <Input disabled className='col-span-4' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>名单数据: </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入名单数据'
                        className='col-span-4'
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tag'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                    备注:
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='请输入备注'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='ttl'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                    过期时间(秒):
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='请输入过期时间'
                        className='col-span-4'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='detail-add-form'
            disabled={addMutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
