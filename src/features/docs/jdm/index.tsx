import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  createMarkdownComponents,
  extractTableOfContents,
  markdownRehypePlugins,
} from '@/features/docs/shared/markdown-doc'
import { cn } from '@/lib/utils'

export function JsonDecisionModelDocs({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/json-decision-model.md')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.text()
      })
      .then((markdown) => {
        if (!cancelled) {
          setContent(markdown)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('文档加载失败')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash)
    }

    updateHash()
    window.addEventListener('hashchange', updateHash)

    return () => {
      window.removeEventListener('hashchange', updateHash)
    }
  }, [])

  const toc = content ? extractTableOfContents(content) : []
  const markdownComponents = createMarkdownComponents()

  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8', className)} {...props}>
      {error ? (
        <p className='text-sm text-destructive'>{error}</p>
      ) : content ? (
        <div className='grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]'>
          <aside className='hidden lg:sticky lg:top-20 lg:block lg:self-start'>
            <div className='rounded-xl border bg-card p-4 shadow-xs'>
              <p className='mb-3 text-sm font-semibold tracking-tight'>目录</p>
              <nav aria-label='JDM 文档目录'>
                <ul className='space-y-1'>
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setActiveHash(`#${item.id}`)}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground',
                          item.level === 1 && 'font-semibold',
                          item.level === 2 && 'pl-5 text-foreground/80',
                          item.level >= 3 && 'pl-7 text-muted-foreground',
                          activeHash === `#${item.id}` && 'bg-accent text-accent-foreground'
                        )}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <div className='min-w-0'>
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={markdownRehypePlugins}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>加载中...</p>
      )}
    </div>
  )
}
