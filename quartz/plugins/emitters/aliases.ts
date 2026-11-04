import { FullSlug, isRelativeURL, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { VFile } from "vfile"
import path from "path"
import { escapeHTML } from "../../util/escape"
import { firstImage } from "../../util/database"

async function* processFile(ctx: BuildCtx, file: VFile) {
  const ogSlug = simplifySlug(file.data.slug!)

  for (const aliasTarget of file.data.aliases ?? []) {
    const aliasTargetSlug = (
      isRelativeURL(aliasTarget)
        ? path.normalize(path.join(ogSlug, "..", aliasTarget))
        : aliasTarget
    ) as FullSlug

    const redirUrl = resolveRelative(aliasTargetSlug, ogSlug)
    const description = escapeHTML(file.data.description ?? `${file.data.frontmatter?.title ?? ogSlug}：封神演義資料庫條目`)
    const image = firstImage(file.data)
    const imageUrl = `https://${ctx.cfg.configuration.baseUrl}/${image ? image.split("/").map(encodeURIComponent).join("/") : "static/og-image.png"}`
    yield write({
      ctx,
      content: `
        <!DOCTYPE html>
        <html lang="zh-Hant">
        <head>
        <title>${ogSlug}</title>
        <link rel="canonical" href="${redirUrl}">
        <meta name="robots" content="noindex">
        <meta name="description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="0; url=${redirUrl}">
        </head>
        </html>
        `,
      slug: aliasTargetSlug,
      ext: ".html",
    })
  }
}

export const AliasRedirects: QuartzEmitterPlugin = () => ({
  name: "AliasRedirects",
  async *emit(ctx, content) {
    for (const [_tree, file] of content) {
      yield* processFile(ctx, file)
    }
  },
  async *partialEmit(ctx, _content, _resources, changeEvents) {
    for (const changeEvent of changeEvents) {
      if (!changeEvent.file) continue
      if (changeEvent.type === "add" || changeEvent.type === "change") {
        // add new ones if this file still exists
        yield* processFile(ctx, changeEvent.file)
      }
    }
  },
})
