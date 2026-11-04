import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor } from "../types"
import CharacterInfoboxConstructor from "../CharacterInfobox"
import script from "../scripts/database.inline"

const CharacterInfobox = CharacterInfoboxConstructor()
const DatabaseContent: QuartzComponent = (props) => <article class={`popover-hint database-entry ${(props.fileData.frontmatter?.cssclasses ?? []).join(" ")}`}>
  <CharacterInfobox {...props} />
  {htmlToJsx(props.fileData.filePath!, props.tree) as ComponentChildren}
</article>
DatabaseContent.afterDOMLoaded = script
export default (() => DatabaseContent) satisfies QuartzComponentConstructor
