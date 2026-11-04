import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor } from "../types"
import CharacterInfoboxConstructor from "../CharacterInfobox"
import script from "../scripts/database.inline"
import { CharacterBrowse, ImageBrowse } from "../DatabaseBrowse"
import ChapterNavigation from "../ChapterNavigation"
import GraphConstructor from "../Graph"
import DatabaseHome from "../DatabaseHome"

const CharacterInfobox = CharacterInfoboxConstructor()
const FullGraph = GraphConstructor()
const DatabaseContent: QuartzComponent = (props) => <article class={`popover-hint database-entry ${(props.fileData.frontmatter?.cssclasses ?? []).join(" ")}`}>
  <ChapterNavigation {...props} />
  {props.fileData.slug === "index" && <DatabaseHome {...props} />}
  <CharacterInfobox {...props} />
  {props.fileData.slug === "index" ? null : props.fileData.slug === "人物總覽" ? <CharacterBrowse {...props} /> : props.fileData.slug === "95-圖像資料/圖像索引" ? <ImageBrowse {...props} /> : htmlToJsx(props.fileData.filePath!, props.tree) as ComponentChildren}
  {props.fileData.slug === "關係圖譜" && <FullGraph {...props} />}
</article>
DatabaseContent.afterDOMLoaded = script
export default (() => DatabaseContent) satisfies QuartzComponentConstructor
