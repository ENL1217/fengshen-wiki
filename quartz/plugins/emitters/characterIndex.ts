import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"
import { chapterNumber, firstImage, isGod, plain, sourceFor, values } from "../../util/database"

export const CharacterIndex: QuartzEmitterPlugin = () => ({
  name: "CharacterIndex",
  async *emit(ctx, content) {
    const characters = content.filter(([, file]) => file.data.frontmatter?.["類型"] === "人物").map(([, file]) => {
      const fm = file.data.frontmatter!
      const image = firstImage(file.data)
      return { slug: file.data.slug, name: plain(fm["名稱"] ?? fm.title), aliases: values(fm["別名"]), camp: values(fm["陣營"]), appearance: plain(fm["登場性質"]), history: plain(fm["歷史性"]), god: isGod(file.data), first: chapterNumber(fm["初登場"]) || null, image: image ? sourceFor(image)?.thumbnail_path ?? image : null, frontmatter: fm }
    })
    yield write({ ctx, slug: "static/characters" as FullSlug, ext: ".json", content: JSON.stringify(characters) })
  },
})
