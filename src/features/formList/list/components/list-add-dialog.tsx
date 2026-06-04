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
import { formListService } from '../service/list'


const formSchema = z
  .object({
    user_id:  z.string().min(1, 'user_id is required.'),
    list_name: z.string().min(1, 'list_name is required.'),
    
  })
type ListForm = z.infer<typeof formSchema>

type ListCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function ListCreateDialog({
  open,
  onOpenChange,
}: ListCreateDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<ListForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      list_name: ''
    },
  })
  const addMutation = useMutation({
    mutationFn: async (values: ListForm) => {
      const res = await formListService.createFormList(values)
      return await res
    },
  })


  const onSubmit = (values: ListForm) => {
    addMutation.mutate(values, {
      onSuccess: () =>{
        toast.promise(sleep(0.01), {
          loading: 'add new list...',
          success: () => {
            return   `add new list ${values.list_name} success`
          },
          error: 'Error',
        })
        queryClient.invalidateQueries({ queryKey: ['/formList/list'] })
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
          <DialogTitle>{ '创建名单'}</DialogTitle>
          <DialogDescription>
            {'Create new List here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
          <Form {...form}>
            <form
              id='list-form'
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
                        required
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='list_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                    名单名称
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入名单名称'
                        className='col-span-4'
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        <DialogFooter>
          <Button type='submit' form='list-form'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}