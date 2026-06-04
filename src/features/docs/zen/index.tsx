import { type MouseEvent, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  createMarkdownComponents,
  extractTableOfContents,
  markdownRehypePlugins,
} from '@/features/docs/shared/markdown-doc'
import { cn } from '@/lib/utils'

export function ZenExpressionDocs({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/zen-expression.md')
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

  const toc = useMemo(() => (content ? extractTableOfContents(content) : []), [content])
  const markdownComponents = useMemo(() => createMarkdownComponents(), [])

  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)

    return () => {
      window.removeEventListener('hashchange', syncHash)
    }
  }, [])

  useEffect(() => {
    if (!toc.length) {
      return
    }

    const headingElements = toc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement)

    if (!headingElements.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleHeadings.length > 0) {
          setActiveHash(`#${visibleHeadings[0].target.id}`)
        }
      },
      {
        rootMargin: '-88px 0px -65% 0px',
        threshold: [0, 1],
      }
    )

    headingElements.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [toc])

  useEffect(() => {
    if (!content) {
      return
    }

    const hash = window.location.hash.replace('#', '')
    if (!hash) {
      return
    }

    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: 'start' })
    })
  }, [content])

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()

    const target = document.getElementById(id)
    if (!target) {
      return
    }

    setActiveHash(`#${id}`)
    window.history.replaceState(null, '', `#${id}`)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      className={cn(
        'relative isolate mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_42%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_34%)]' />

      {error ? (
        <div className='rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive'>
          {error}
        </div>
      ) : content ? (
        <div className='grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10'>
          <aside className='lg:sticky lg:top-20 lg:self-start'>
            <div className='hidden max-h-[calc(100vh-22rem)] overflow-y-auto rounded-3xl border bg-card/95 p-4 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:block'>
              <p className='mb-3 text-sm font-semibold tracking-tight'>目录</p>
              <nav aria-label='ZEN 文档目录'>
                <ul className='space-y-1'>
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(event) => handleTocClick(event, item.id)}
                        className={cn(
                          'block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground',
                          item.level === 1 && 'font-semibold',
                          item.level === 2 && 'pl-5 text-foreground/85',
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

          <main className='min-w-0'>
            <section className='mb-4 rounded-3xl border bg-card/95 p-5 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden'>
              <p className='mb-3 text-sm font-semibold tracking-tight'>目录</p>
              <div className='flex gap-2 overflow-x-auto pb-1'>
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => handleTocClick(event, item.id)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                      activeHash === `#${item.id}`
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            </section>

            <article className='overflow-hidden rounded-[2rem] border bg-card/95 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/80'>
              <div className='px-6 py-8 sm:px-8 lg:px-10'>
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={markdownRehypePlugins}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </article>
          </main>
        </div>
      ) : (
        <div className='rounded-3xl border bg-card/95 px-6 py-5 text-sm text-muted-foreground shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/80'>
          加载中...
        </div>
      )}
    </div>
  )
}
