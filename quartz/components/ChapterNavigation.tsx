import { QuartzComponent } from "./types"
import { chapterNumber, pageUrl, plain } from "../util/database"
import { resolveRelative } from "../util/path"

const ChapterNavigation: QuartzComponent = (props) => {
  if (props.fileData.frontmatter?.["類型"] !== "回目") return null
  const number = Number(props.fileData.frontmatter?.["回數"])
  const chapters = props.allFiles.filter(f => f.frontmatter?.["類型"] === "回目")
  const people = props.allFiles.filter(f => f.frontmatter?.["類型"] === "人物")
  const nav = (offset: number) => {
    const page = chapters.find(f => Number(f.frontmatter?.["回數"]) === number + offset)
    return page ? <a class="internal" rel={offset < 0 ? "prev" : "next"} href={resolveRelative(props.fileData.slug!, page.slug!)}>{offset < 0 ? "← 前一回" : "下一回 →"} · 第{number + offset}回</a> : <span />
  }
  return <section class="chapter-data" aria-label="回目導覽"><nav>{nav(-1)}{nav(1)}</nav>{[ ["初登場", "本回初登場人物"], ["死亡", "本回死亡人物"] ].map(([key, title]) => {
    const found = people.filter(f => chapterNumber(f.frontmatter?.[key]) === number)
    return <div><strong>{title}</strong><p>{found.length ? found.map((file, i) => <>{i ? "、" : ""}<a class="internal" href={pageUrl(props.fileData.slug!, plain(file.frontmatter?.["名稱"] ?? file.frontmatter?.title), props.allFiles)}>{plain(file.frontmatter?.["名稱"] ?? file.frontmatter?.title)}</a></>) : "目前未有條目記錄"}</p></div>
  })}<small>依人物條目的初登場、死亡欄位自動彙整；含復生情節者請參閱人物正文。</small></section>
}
export default ChapterNavigation
