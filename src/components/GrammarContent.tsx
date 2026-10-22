import type { ReactNode } from 'react'

/**
 * Nội dung chủ đề là Markdown-lite: `### mục`, `- gạch đầu dòng`, đoạn văn,
 * `**đậm**` và `` `dạng thức` `` trong dòng. Không cần thư viện Markdown.
 */
type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'list'; items: string[] }

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', lines: paragraph })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ kind: 'list', items: list })
      list = []
    }
  }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()
    if (line.length === 0) {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'heading', text: line.slice(4).trim() })
      continue
    }
    if (line.startsWith('- ')) {
      flushParagraph()
      list.push(line.slice(2).trim())
      continue
    }
    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

/** Ba dạng inline cần cho nội dung: **đậm**, *nghiêng* và `code`. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={key} className="text-ink">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="rounded-[4px] border border-rule bg-paper px-1 py-0.5 text-[0.9375em] text-ink">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function GrammarContent({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        const key = `block-${index}`
        if (block.kind === 'heading') {
          return (
            <h3 key={key} className="pt-3 font-serif text-[1.0625rem] font-medium tracking-[-0.01em] text-ink">
              {block.text}
            </h3>
          )
        }
        if (block.kind === 'list') {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5 text-[0.9375rem] leading-[1.7] text-ink">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{inline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={key} className="max-w-[65ch] text-[0.9375rem] leading-[1.7] text-ink">
            {inline(block.lines.join(' '), key)}
          </p>
        )
      })}
    </div>
  )
}
