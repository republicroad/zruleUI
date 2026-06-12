import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
// import authApi from '@/shared/authapiClient'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
// import { useAuthStore } from '@/stores/auth-store'
import { sleep, cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const formSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'OTP has invalid characters'),
})

interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function ForgotPasswordOTPForm({
  className,
  redirectTo,
  ...props
}: FormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onBlur',
  })

  const { mutateAsync } = useMutation({
    // isError, isSuccess, data, error
    //  (credentials as { email: string }).email
    mutationFn: async (credentials: Record<string, unknown>) => {
      console.log(credentials)
    },
    onSuccess: async (response: any) => {
      console.log('mutationFn onSuccess:', response)
      // data 以后可以考虑用 typescript 类型来定义.
      await login(response.data.data.accessToken) // 直接调用 login 方法来设置 user 和 accessToken, 以及 expiresAt.
      // toast.success(data.message)
    },
    onError: (error) => {
      alert(`Login failed: ${error.message}`)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    toast.promise(mutateAsync(data), {
      loading: 'Signing in...',
      success: () => {
        setIsLoading(false)
        return `Welcome back`
      },
      error: (err) => {
        setIsLoading(false)
        // Access custom error message from server response
        return err.response?.data?.message || err
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <InputOTP
                  id='otp'
                  maxLength={6}
                  pattern='^[a-zA-Z0-9]+$'
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  disabled={false}
                >
                  <InputOTPGroup className='gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                    {Array.from({ length: 6 }, (_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button> */}
      </form>
    </Form>
  )
}
