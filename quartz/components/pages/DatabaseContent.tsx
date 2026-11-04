import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor } from "../types"
import CharacterInfoboxConstructor from "../CharacterInfobox"
// @ts-ignore Quartz bundles inline modules as script strings.
import script from "../scripts/database.inline"
import { CharacterBrowse, ImageBrowse, EntityBrowse } from "../DatabaseBrowse"
import ChapterNavigation from "../ChapterNavigation"
import GraphConstructor from "../Graph"
import DatabaseHome from "../DatabaseHome"

const CharacterInfobox = CharacterInfoboxConstructor()
const FullGraph = GraphConstructor()
const DatabaseContent: QuartzComponent = (props) => <article class={`popover-hint database-entry ${(props.fileData.frontmatter?.cssclasses ?? []).join(" ")}`}>
  <ChapterNavigation {...props} />
  {props.fileData.slug === "index" && <DatabaseHome {...props} />}
  {props.fileData.slug === "20-法寶/法寶總表" && <EntityBrowse {...props} />}
  <CharacterInfobox {...props} />
  {props.fileData.slug === "index" ? null : props.fileData.slug === "人物總覽" ? <CharacterBrowse {...props} /> : props.fileData.slug === "95-圖像資料/圖像索引" ? <ImageBrowse {...props} /> : htmlToJsx(props.fileData.filePath!, props.tree) as ComponentChildren}
  {props.fileData.slug === "關係圖譜" && <FullGraph {...props} />}
</article>
DatabaseContent.afterDOMLoaded = script
export default (() => DatabaseContent) satisfies QuartzComponentConstructor
