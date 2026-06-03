import { z } from 'zod'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { counter_times, counter_types } from '../data/data'
import { type shareCounter } from '../data/schema'
import { counterService } from '../service/counter'

const formSchema = z
  .object({
    user_id:  z.string(),
    counter_name: z.string().min(1, 'counter_name is required.'),
    counter_type: z.string().min(1, 'counter_type required.'),
    counter_time: z.string().min(1, 'counter_time is required.'),
    
  })
type CounterForm = z.infer<typeof formSchema>

type CounterActionDialogProps = {
  currentRow?: shareCounter
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CountersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CounterActionDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<CounterForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      counter_name: '',
      counter_type: '',
      counter_time: ''
    },
  })

  const addMutation = useMutation({
    mutationFn: async (values: CounterForm) => {
      const res = await counterService.createCounter(values)
      return await res
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['/counter'] }),
  })

  const onSubmit = (values: CounterForm) => {
    addMutation.mutate(values, {
      onSuccess: () =>{
        toast.promise(sleep(0.01), {
          loading: 'add new counter...',
          success: () => {
            return   `add new counter ${values.counter_name} success`
          },
          error: 'Error',
        })
        queryClient.invalidateQueries({ queryKey: ['/counter'] })
      }
    })
    form.reset()
    onOpenChange(false)
  }


  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{ '新增共享计数器'}</DialogTitle>
          <DialogDescription>
            {'Create new Counter here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='counter-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='user_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                    用户id
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入用户id'
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
                name='counter_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                    计数器名称
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入计数器名称'
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
                name='counter_type'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>计算类型</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择计算类型'
                      className='col-span-4'
                      items={counter_types.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='counter_time'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>滑动窗口</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择滑动窗口'
                      className='col-span-4'
                      items={counter_times.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='counter-form'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
