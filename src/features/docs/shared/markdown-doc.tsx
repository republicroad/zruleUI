import { type ComponentPropsWithoutRef, isValidElement, type ReactNode } from 'react'
import GithubSlugger from 'github-slugger'
import { Link2 } from 'lucide-react'
import rehypeSlug from 'rehype-slug'
import { type Components } from 'react-markdown'
import { cn } from '@/lib/utils'

export type TocItem = {
  id: string
  level: number
  text: string
}

function slugifyHeading(text: string) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return slug || 'section'
}

function stripMarkdownInline(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function collectNodeText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(collectNodeText).join('')
  }

  if (isValidElement(children)) {
    return collectNodeText(children.props.children)
  }

  return ''
}

function createHeadingIdFactory() {
  const slugger = new GithubSlugger()

  return (text: string) => {
    const normalized = stripMarkdownInline(text)
    return slugger.slug(normalized || 'section') || slugifyHeading(normalized)
  }
}

export const markdownRehypePlugins = [rehypeSlug]

export function normalizeMarkdownImageSrc(src?: string) {
  if (!src) {
    return src
  }

  if (src.startsWith('/image/')) {
    return src.replace('/image/', '/images/')
  }

  if (src.startsWith('image/')) {
    return `/${src.replace('image/', 'images/')}`
  }

  return src
}

export function extractTableOfContents(markdown: string) {
  const lines = markdown.split('\n')
  const createHeadingId = createHeadingIdFactory()
  const toc: TocItem[] = []
  let inCodeBlock = false
  let fenceMarker = ''

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (fenceMatch) {
      const marker = fenceMatch[1]

      if (!inCodeBlock) {
        inCodeBlock = true
        fenceMarker = marker
        continue
      }

      const isClosingFence = new RegExp(
        `^\\s*${fenceMarker[0]}{${fenceMarker.length},}\\s*$`
      ).test(line)

      if (isClosingFence) {
        inCodeBlock = false
        fenceMarker = ''
      }

      continue
    }

    if (inCodeBlock) {
      continue
    }

    const match = line.match(/^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/)
    if (!match) {
      continue
    }

    const text = stripMarkdownInline(match[2])
    if (!text) {
      continue
    }

    toc.push({
      id: createHeadingId(text),
      level: match[1].length,
      text,
    })
  }

  return toc
}

export function createMarkdownComponents(): Components {
  const createHeadingId = createHeadingIdFactory()

  const resolveHeadingId = (id: string | undefined, children: ReactNode) =>
    id || createHeadingId(stripMarkdownInline(collectNodeText(children)))

  const createHeading =
    (
      Tag: 'h1' | 'h2' | 'h3' | 'h4',
      className: string,
      iconClassName: string
    ) =>
    ({
      className: headingClassName,
      children,
      id,
      ...props
    }: ComponentPropsWithoutRef<'h1'>) => {
      const headingId = resolveHeadingId(id, children)

      return (
        <Tag id={headingId} className={cn('group/heading relative', className, headingClassName)} {...props}>
          <a
            href={`#${headingId}`}
            className='absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            aria-label={`跳转到标题：${stripMarkdownInline(collectNodeText(children))}`}
          />
          <span className='relative z-10 inline-flex items-start gap-2'>
            <span>{children}</span>
            <span
              className={cn(
                'mt-1 inline-flex shrink-0 text-muted-foreground/70 opacity-0 transition-opacity group-hover/heading:opacity-100 group-focus-within/heading:opacity-100',
                iconClassName
              )}
              aria-hidden='true'
            >
              <Link2 className='size-[0.9em]' />
            </span>
          </span>
        </Tag>
      )
    }

  return {
    h1: createHeading(
      'h1',
      'mt-10 mb-6 scroll-m-20 text-4xl font-semibold tracking-tight first:mt-0',
      'text-primary'
    ),
    h2: createHeading(
      'h2',
      'mt-10 mb-4 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0',
      'text-primary'
    ),
    h3: createHeading(
      'h3',
      'mt-8 mb-3 scroll-m-20 text-xl font-semibold tracking-tight',
      'text-primary/80'
    ),
    h4: createHeading('h4', 'mt-6 mb-2 scroll-m-20 text-lg font-semibold', 'text-primary/70'),
    p: ({ className, ...props }) => (
      <p className={cn('my-4 leading-7 text-foreground/90', className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          'font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80',
          className
        )}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn('my-4 ml-6 list-disc space-y-2 marker:text-primary', className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn('my-4 ml-6 list-decimal space-y-2 marker:text-primary', className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn('leading-7 text-foreground/90', className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          'my-6 border-l-4 border-primary/30 bg-muted/40 py-1 pl-4 italic text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    table: ({ className, ...props }) => (
      <div className='my-6 overflow-x-auto rounded-lg border'>
        <table className={cn('w-full border-collapse text-sm', className)} {...props} />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn('bg-muted/60 text-left', className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn('border-b px-4 py-3 font-semibold whitespace-nowrap', className)}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn('border-b px-4 py-3 align-top', className)} {...props} />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          'my-6 overflow-x-auto rounded-xl border bg-card px-4 py-3 font-mono text-sm leading-6 shadow-xs',
          className
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          'rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]',
          className?.includes('language-') ? 'bg-transparent px-0 py-0 text-inherit' : undefined,
          className
        )}
        {...props}
      />
    ),
    img: ({ className, src, alt, ...props }) => (
      <img
        className={cn('my-6 w-full rounded-xl border bg-card object-contain shadow-xs', className)}
        src={normalizeMarkdownImageSrc(src)}
        alt={alt ?? ''}
        loading='lazy'
        {...props}
      />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn('my-8 border-border', className)} {...props} />
    ),
    strong: ({ className, ...props }) => (
      <strong className={cn('font-semibold text-foreground', className)} {...props} />
    ),
  }
}
