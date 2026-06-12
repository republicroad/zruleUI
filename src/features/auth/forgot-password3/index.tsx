'use client'

import { Component, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordEmailForm } from './components/email-form'
import { ForgotPasswordOTPForm } from './components/otp-form'
import { ForgotPasswordResetPasswordForm } from './components/reset-password-form'

function Form1({ index }: { index: number }) {
  return <div>Hello "/(auth)/forgot-password3"! {index}</div>
}
function Form2({ index }: { index: number }) {
  return <div>Hello "/(auth)/forgot-password3"! {index}</div>
}
function Form3({ index }: { index: number }) {
  return <div>Hello "/(auth)/forgot-password3"! {index}</div>
}

// steps 中可以增加组件的属性
// todo: 现在需要在各个 step 中把表单字段提取到一个上下文中或者 zustand 实例中，这样在每个步骤的组件中都可以访问和更新这些字段,
// 以及在点击 Next 时触发一个事件来让当前步骤的组件去验证输入并更新一个状态, 只有当状态允许时才真正进入下一个步骤.
const steps = [
  {
    title: 'Email',
    description: 'send OTP',
    content: <Form1 index={0} />,
    jsxFunc: Form1,
    formContent: ForgotPasswordEmailForm,
  },
  {
    title: 'OTP',
    description: 'input OTP from email',
    content: <Form2 index={1} />,
    jsxFunc: Form2,
    formContent: ForgotPasswordOTPForm,
  },
  {
    title: 'Reset',
    description: 'input new password',
    content: <Form3 index={2} />,
    jsxFunc: Form3,
    formContent: ForgotPasswordResetPasswordForm,
  },
]

export function ForgotPasswordMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <Stepper
      //   defaultValue={1}
      value={currentStep}
      onValueChange={setCurrentStep}
      //   indicators={{
      //     completed: <CheckIcon className='size-3.5' />,
      //     loading: <LoaderCircleIcon className='size-3.5 animate-spin' />,
      //   }}
      indicators={{
        completed: <CheckIcon className='size-3.5' />,
        loading: <LoaderCircleIcon className='size-3.5 animate-spin' />,
      }}
      className='w-full max-w-md space-y-8'
    >
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className='relative flex-1 items-start'
          >
            <StepperTrigger asChild className='flex flex-col gap-2.5'>
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle>{step.title}</StepperTitle>
              {/* <StepperDescription>{step.description}</StepperDescription> */}
            </StepperTrigger>

            {steps.length > index + 1 && (
              <StepperSeparator className='absolute inset-x-0 top-2.5 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none group-data-[state=completed]/step:bg-primary' />
            )}
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel className='text-sm'>
        {steps.map((step, index) => (
          <StepperContent
            key={index}
            value={index + 1}
            className='flex items-center justify-center'
          >
            {/* {step.title} content */}
            {/* 使用组件 JSX, 这样可以在组件内部使用 useState, useEffect, useContext 等 React 功能, 使每个步骤的内容更加独立和灵活. */}
            {/* {step.content} */}
            {/* 使用组件函数, 方便逐级传参数 */}
            {/* {step.jsxFunc ? <step.jsxFunc index={index + 1} /> : step.content} */}
            {/* <div>Hello "/(auth)/forgot-password3"!{index + 1}</div> */}
            {step.formContent ? <step.formContent /> : step.content}
          </StepperContent>
        ))}
      </StepperPanel>
      <div className='flex items-center justify-between gap-2.5'>
        <Button
          variant='outline'
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          onClick={() => setCurrentStep((prev) => prev + 1)}
          // 最后一步提交表单, 这里先不禁用, 后续可以在每个步骤的组件内部增加一个状态来控制是否可以进入下一个步骤,
          // 以及在点击 Next 时触发一个事件来让当前步骤的组件去验证输入并更新这个状态, 只有当状态允许时才真正进入下一个步骤.
          //   disabled={currentStep === steps.length}
        >
          Next
          {/* 这里希望输入完毕后再进入下一个步骤, 但是目前的实现是点击 Next 就直接进入下一个步骤了, 后续可以在每个步骤的
          组件内部增加一个状态来控制是否可以进入下一个步骤, 以及在点击 Next 时触发一个事件来让当前步骤的组件
          去验证输入并更新这个状态, 只有当状态允许时才真正进入下一个步骤. --- IGNORE --- */}
        </Button>
      </div>
    </Stepper>
  )
}

export function ForgotPassword3() {
  //   return <div>Hello "/(auth)/forgot-password3"!</div>
  //   return <Pattern />
  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardContent>
          <ForgotPasswordMultiStepForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
