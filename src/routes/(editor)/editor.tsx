import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  JdmConfigProvider,
  CodeEditor,
  DecisionGraph,
  DecisionGraphType,
} from '@gorules/jdm-editor'
import '@gorules/jdm-editor/dist/style.css'
import classes from './decision-simple.module.css'

export const Route = createFileRoute('/(editor)/editor')({
  component: RuleEditor,
})

function RouteComponent() {
  return <div>Hello "/(hero)/editor"!</div>
}

function ExpressionEditor() {
  const [expression, setExpression] = useState('customer.age >= 18')

  return (
    <JdmConfigProvider>
      <CodeEditor
        value={expression}
        onChange={setExpression}
        type='unary'
        lint
      />
      // Standard expression
      <CodeEditor type='standard' value='cart.total * 0.1' />
      // Unary condition
      <CodeEditor type='unary' value='>= 100' />
      // Template string
      <CodeEditor type='template' value='Hello, {customer.name}!' />
    </JdmConfigProvider>
  )
}

function RuleEditor() {
  const [value, setValue] = useState<DecisionGraphType>({
    nodes: [],
    edges: [],
  })

  return (
    <div className={classes.page}>
      <div className={classes.contentWrapper}>
        <div className={classes.content}>
          <JdmConfigProvider>
            <DecisionGraph value={value} onChange={setValue} />
          </JdmConfigProvider>
        </div>
      </div>
    </div>
  )
}
