import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import authApi from '@/shared/authapiClient'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    password: z.string().max(255, 'Password must be at most 255 characters'),
    confirmPassword: z
      .string()
      .max(255, 'Confirm Password must be at most 255 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  })

interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function ForgotPasswordResetPasswordForm({
  className,
  redirectTo,
  ...props
}: FormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const { mutateAsync } = useMutation({
    // isError, isSuccess, data, error
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
        return `Welcome back!`
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
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
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
