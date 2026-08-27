import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import { shikiTheme } from '@/lib/shikiTheme'

// Same gated-asset base authClient.ts's getLessonContent() reads from —
// not imported from there, since that file is 'use client' and this one
// runs in a plain server-side Route Handler, not a component.
const COURSE_ASSET_BASE = 'https://api.lowlevelnotes.com/v1/library/assets'

// Rewrites relative <img src="..."> references (e.g. "diagram.png" or
// "Images/diagram.png") to absolute, session-cookie-carrying URLs against
// the gated asset endpoint — resolved relative to the content file's own
// R2 directory, since that's how the source drafts actually reference
// their images (sitting alongside the .md file, not path-absolute). This
// also incidentally neutralizes a "javascript:" (or similar) src, since
// it gets treated as a relative reference and rewritten into a harmless
// asset-endpoint URL either way.
function rehypeRewriteImages(basePath: string) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img' || typeof node.properties?.src !== 'string') return
      const src = node.properties.src
      if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('/')) return // already absolute

      const key = new URL(src, `https://placeholder/${basePath}/`).pathname.slice(1)
      node.properties.src = `${COURSE_ASSET_BASE}/${key}`
    })
  }
}

// remark-rehype does not sanitize link hrefs — a markdown link like
// `[x](javascript:alert(1))` renders straight through into
// `<a href="javascript:alert(1)">`, which then reaches the browser via
// `dangerouslySetInnerHTML` on the lesson page. Only instructors can
// write lesson markdown today (via the instructor course builder, not
// open user submission), but this pipeline is one plausible base for a
// future contributor-submitted content path, and sanitizing link schemes
// is cheap and standard practice for any renderer that ends up in
// dangerouslySetInnerHTML — allowlist rather than blocklist, since new
// dangerous schemes (vbscript:, data: with an HTML payload, etc.) are
// easy to miss going the other way.
const SAFE_HREF_SCHEMES = /^(https?:|mailto:|tel:|#|\/)/i
function rehypeSanitizeLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || typeof node.properties?.href !== 'string') return
      const href = node.properties.href
      // A bare relative link (no scheme, no leading '/') is safe — it's
      // resolved against the page's own origin, not an injectable scheme.
      if (!href.includes(':') || SAFE_HREF_SCHEMES.test(href)) return
      delete node.properties.href
    })
  }
}

// Article-lesson content only (lessons.type = 'article'). `markdown` is
// raw text already fetched (client-side, authenticated) from R2 via
// getLessonContent() — this function itself just renders it to HTML, no
// I/O. `basePath` is the lesson's content_path directory, used to
// resolve relative image references. `remark-frontmatter` strips the
// Pandoc-style YAML header the real draft notes carry (title/author/PDF
// export settings) — without it, remark treats the `---` fences as
// thematic breaks and renders the YAML as a stray paragraph.
// `rehype-pretty-code` uses shiki internally (already a dependency for
// CodeBlock.tsx), sharing the same theme so fenced code blocks inside
// lesson prose look identical to the standalone <CodeBlock>.
export async function renderLessonMarkdown(markdown: string, basePath: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkRehype)
    // rehype-pretty-code@0.14's published types don't line up with
    // unified 11's Plugin generics (a known gap between the two
    // packages' typings, not a real type error) — the options object
    // itself is fine, this only silences the resulting false positive.
    // @ts-expect-error — see comment above
    .use(rehypePrettyCode, { theme: shikiTheme })
    .use(rehypeRewriteImages, basePath)
    .use(rehypeSanitizeLinks)
    .use(rehypeStringify)
    .process(markdown)

  return String(file)
}
