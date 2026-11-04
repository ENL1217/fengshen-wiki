import { Fragment } from "preact"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { assetUrl, firstImage, gameStats, pageUrl, plain, sourceFor, values } from "../util/database"

export function LinkedValue({ value, props }: { value: unknown; props: QuartzComponentProps }) {
  const render = (text: string) => text.split(/(\[\[[^\]]+\]\])/g).map((part) => {
    const match = part.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/)
    const name = match?.[1] ?? part
    const href = pageUrl(props.fileData.slug!, name, props.allFiles)
    return href ? <a class="internal" href={href}>{match?.[2] ?? name}</a> : plain(part)
  })
  return <>{values(value).map((v, i) => <Fragment key={i}>{i > 0 ? "、" : ""}{render(v)}</Fragment>)}</>
}

const CharacterInfobox: QuartzComponent = (props) => {
  const { fileData } = props
  const fm = fileData.frontmatter!
  const type = plain(fm?.["類型"])
  if (!["人物", "法寶", "法術符訣", "陣法"].includes(type)) return null
  const name = plain(fm["名稱"] ?? fm.title)
  const image = firstImage(fileData)
  const source = sourceFor(image)
  const fields = type === "人物" ? ["陣營", "師承", "道場", "坐騎", "法寶", "法術", "初登場", "死亡", "封神", "封神出處", "歷史性", "史書原型"] : type === "法寶" ? ["歷任持有者", "功能", "剋制", "被剋", "五行屬性", "五行層級", "五行依據", "初登場", "下落"] : type === "陣法" ? ["陣主", "破陣者", "破陣代價", "五行屬性", "五行層級", "五行依據", "出處回目", "出處回目範圍"] : ["類別", "施展者", "效果", "五行屬性", "五行層級", "五行依據", "初登場"]
  const stats = type === "人物" ? gameStats.get(name) : undefined
  return <aside class="entry-infobox" aria-label={`${name}資料卡`}>
    <div class="infobox-title"><span>{type}</span><strong>{name}</strong></div>
    {image && <figure><a href={assetUrl(fileData.slug!, image)} class="image-zoom" data-lightbox="true" aria-label={`放大${name}圖像`}><img src={assetUrl(fileData.slug!, source?.thumbnail_path ?? image)} alt={`${name}古籍圖像`} width="280" height="340" decoding="async" /></a>
      {source && <figcaption>{source.title}<br /><a href={source.source_page} target="_blank" rel="noopener noreferrer">圖像來源</a> · {source.license}</figcaption>}
    </figure>}
    {values(fm["別名"]).length > 0 && <div class="infobox-aliases">別名：<LinkedValue value={fm["別名"]} props={props} /></div>}
    <dl>{fields.filter(key => values(fm[key]).length > 0).map(key => <Fragment key={key}><dt>{key === "封神" ? "封神／結局" : key}</dt><dd>{key === "陣營" ? values(fm[key]).map(camp => <span class={`camp-tag camp-${camp}`}><LinkedValue value={camp} props={props} /></span>) : <LinkedValue value={fm[key]} props={props} />}{key === "歷史性" && <span class="layer-badge layer-l2">L2</span>}</dd></Fragment>)}</dl>
    {stats && <details class="game-stats"><summary><span class="layer-badge layer-l3">L3 自創數值</span></summary><p>遊戲設計建議值，非原著能力定論。</p>{stats.map((value, i) => <div class="stat-row"><span>{["道行", "武力", "統率", "法術", "法寶", "智謀", "仙緣"][i]}</span><meter min="0" max="100" value={value}>{value}</meter><span>{value}</span></div>)}</details>}
  </aside>
}
export default (() => CharacterInfobox) satisfies QuartzComponentConstructor
