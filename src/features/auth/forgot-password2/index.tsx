'use client'
// 这个组件实现了一个多步骤的表单, 包含了输入邮箱、输入 OTP 和重置密码三个步骤.
// 通过 currentStep 来控制当前显示哪个步骤的内容, 通过 handleNextButton 和 handleBackButton 来控制步骤的切换, 最后在 onSubmit 中处理整个表单的提交逻辑.
// 这个组件的设计比较灵活, 可以根据需要添加或者删除步骤, 只需要修改 steps 数组和 renderCurrentStepContent 函数即可.
// 这个组件的实现也比较复杂, 主要是因为需要处理多步骤表单的状态和逻辑, 以及与后端 API 的交互. 但是通过合理的代码结构和注释, 可以让代码更易读和维护.
// 未来可以考虑把这个组件拆分成更小的组件, 比如每个步骤一个组件, 这样可以进一步简化代码和提高复用性.
// todo:
// 1. 目前的 handleNextButton 函数中包含了请求 OTP 的逻辑, 未来可以考虑把这个逻辑放到一个单独的函数中, 这样可以让 handleNextButton 更加专注于控制步骤的切换.
// 2. 目前的 onSubmit 函数中包含了提交表单的逻辑, 未来可以考虑把这个逻辑放到一个单独的函数中, 这样可以让 onSubmit 更加专注于处理表单提交的结果.
// 3. 目前的 formdata 状态是一个对象, 未来可以考虑把它拆分成多个状态, 每个步骤一个状态, 这样可以让状态更清晰和易于管理.
// 4. 把表单组件替换为 shadcn-ui 的 Form 组件, 这样可以简化表单的实现, 并且更好地与 shadcn-ui 的其他组件集成.
// 如何感知是第几步到第几步的变化? 也许需要记录当前状态和上一步的状态.
// 跳步的实现需要状态数组.
import { useState } from 'react'
import z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import authApi from '@/shared/authapiClient'
import { da, el } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { zipVariadic } from '@/lib/itertools'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import EmailInput from '@/components/ui/email-input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
} from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/ui/password-input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { authService } from '@/features/auth/services/auth'
import { AuthLayout } from '../auth-layout'

const formSchema = z
  .object({
    email: z.email().max(255, 'Email must be at most 255 characters'),
    otp: z
      .string()
      .min(6, 'OTP must be 6 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'OTP has invalid characters'),
    password: z.string().max(255, 'Password must be at most 255 characters'),
    confirmPassword: z
      .string()
      .max(255, 'Confirm Password must be at most 255 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  })

type FormSchema = z.infer<typeof formSchema>
type FormField = keyof FormSchema

export const ForgotPasswordOTP = () => {
  const steps: { title: string; description: string; fields: FormField[] }[] = [
    {
      title: 'forgot-password',
      description:
        '请输入您注册时使用的邮箱地址，我们将向您发送一个包含验证码的邮件。',
      fields: ['email'],
    },
    {
      title: 'otp',
      description: '请输入邮箱中的验证码以验证您的身份。',
      fields: ['otp'],
    },
    {
      title: 'reset-password',
      description: '请输入新的密码以重置您的账户密码。',
      fields: ['password', 'confirmPassword'],
    },
  ]
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formdata, setFormdata] = useState({})
  const [currentStep, setCurrentStep] = useState(0)

  const currentForm = steps[currentStep]

  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  // 这个 useEffect 的作用是监听 formdata 的变化, 但是由于 formdata 是一个对象,
  // 每次 setFormdata 都会创建一个新的对象, 导致 useEffect 每次都会被触发,
  // 这可能不是我们想要的行为. 未来可以考虑把 formdata 拆分成多个状态,
  // 每个步骤一个状态, 这样就可以避免这个问题了.
  // useEffect(() => {
  //   console.log('formdata changed:', formdata)
  // }, [formdata])

  const handleMockSubmit = async () => {
    // 后面的数据会覆盖前面的数据, 这样就可以保证最终的 formdata 中包含了所有步骤的数据了.
    try {
      const data = { ...formdata, ...form.getValues() }
      const result = await authService.forgotResetPasswdWithOTPv2(data)
      if (result.status == 0) {
        toast.success(result.message || `Reset password for ${data.email}`)
        navigate({ to: '/sign-in' })
      } else {
        toast.error(result.message || 'Failed to reset password.')
      }
    } catch (err: any) {
      // Access custom error message from server response
      toast.error(err.response?.data?.message || 'Failed to reset password.')
    }
  }

  const handleNextButton = async () => {
    const currentFields = steps[currentStep].fields
    const isValid = await form.trigger(currentFields)
    // 请求 otp 的逻辑目前放在 handleNextButton 中, 未来可以考虑把这个逻辑放到一个单独的函数中,
    // 这样可以让 handleNextButton 更加专注于控制步骤的切换.
    // 如何判断第一步到第二步的切换? 也就是从输入邮箱到输入 OTP 的切换? 这时候需要请求 OTP 了. 这个需要好好思考.
    if (currentStep == 0) {
      const curstepFormFields = form.getValues(currentFields)
      const _data = zipVariadic(currentFields, curstepFormFields)
      const data = Object.fromEntries(_data)
      console.log('Requesting OTP for data:', data)
      try {
        const result = await authService.forgotPasswdEmailv2(data)
        console.log('OTP request successful, server response:', result)
        if (result.status == 0) {
          toast.success(result.message || 'OTP sent successfully!')
        } else {
          toast.error(result.message || 'Failed to send OTP.')
          return
          // throw new Error(result.data.message || 'Failed to send OTP.')
        }
      } catch (err: any) {
        // Access custom error message from server response
        toast.error(err.response?.data?.message || 'Failed to send OTP.')
        throw err
      }
    }
    setFormdata((prev) => ({ ...prev, ...form.getValues() }))
    // 这里的 formdata 不是最新值, 因为 setFormdata 是异步的,
    // 但是我们可以通过 form.getValues() 来获取最新的表单数据,
    // 这样就可以保证我们在切换步骤的时候 formdata 中包含了当前步骤的数据了.
    // console.log('Current form data:', formdata)
    if (isValid && !isLastStep) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBackButton = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // const onSubmit = async (values: FormSchema) => {
  //   setIsLoading(true)
  //   // await new Promise((resolve) => setTimeout(resolve, 1500))
  //   console.log('Form submitted with values:', values)
  //   toast.success('Form successfully submitted')
  //   setIsLoading(false)
  // }

  const renderCurrentStepContent = () => {
    // 最好分两个表单来实现, 这样就可以避免在 onSubmit 中处理不同步骤的逻辑了. 目前的实现虽然可以工作,
    // 但是代码比较复杂, 不太容易理解和维护. 未来可以考虑把每个步骤的内容放到一个单独的组件中, 这样就可以让代码更清晰和易于维护了.
    switch (currentStep) {
      case 0: {
        return (
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <EmailInput
                    {...field}
                    id='email'
                    aria-invalid={fieldState.invalid}
                    placeholder=''
                    autoComplete='off'
                    disabled={false}
                  />
                  <FieldDescription></FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        )
      }

      case 1: {
        return (
          <FieldGroup>
            <Controller
              name='otp'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='otp'>OTP</FieldLabel>
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
                  <FieldDescription></FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        )
      }

      case 2: {
        return (
          // todo: 未来将 FieldGroup 替换为 FormField 来简化代码
          <FieldGroup>
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id='password'
                    aria-invalid={fieldState.invalid}
                    placeholder=''
                    autoComplete='off'
                    disabled={false}
                  />
                  <FieldDescription></FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='confirmPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='confirmPassword'>
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id='confirmPassword'
                    aria-invalid={fieldState.invalid}
                    placeholder=''
                    autoComplete='off'
                    disabled={false}
                  />
                  <FieldDescription></FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        )
      }

      default: {
        return null
      }
    }
  }

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardHeader>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <CardTitle>{currentForm.title}</CardTitle>
              <p className='text-xs text-muted-foreground'>
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <CardDescription>{currentForm.description}</CardDescription>
          </div>
          <Progress value={progress} />
        </CardHeader>
        <CardContent>
          {/* <ForgotPasswordForm /> */}
          {/* 注意: 这里的 form 是一个多步骤的表单, 每一步的内容根据 currentStep 来动态渲染, 
          通过 handleNextButton 和 handleBackButton 来控制步骤的切换, 最后在 onSubmit 中处理整个表单的提交逻辑.*/}
          {/* 为了排查表单提交的问题, 最好把 onSubmit 设置成一个简单的函数, 打印表单数据或者错误.
          form.handleSubmit((data) => console.log(data), (errors) => console.log(errors)) */}
          <Form {...form}>
            <form
              id='multi-form'
              onSubmit={form.handleSubmit(
                (data) => console.log(data),
                (errors) => console.log(errors)
              )}
            >
              {renderCurrentStepContent()}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Field className='justify-between' orientation='horizontal'>
            {currentStep > 0 && (
              <Button type='button' variant='ghost' onClick={handleBackButton}>
                <ChevronLeft /> Back
              </Button>
            )}
            {!isLastStep && (
              <Button
                type='button'
                variant='secondary'
                onClick={handleNextButton}
              >
                Next
                <ChevronRight />
              </Button>
            )}
            {isLastStep && (
              <Button
                type='button'
                // form='multi-form'
                onClick={handleMockSubmit}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Spinner /> : 'Submit'}
              </Button>
            )}
          </Field>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
