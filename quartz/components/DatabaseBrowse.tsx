import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { assetUrl, images, pageUrl, plain } from "../util/database"

export const CharacterBrowse: QuartzComponent = (props) => <section class="character-browser" data-index={assetUrl(props.fileData.slug!, "static/characters.json")} data-root={assetUrl(props.fileData.slug!, "")}>
  <div class="browse-filters">
    <label>姓名／別名<input type="search" name="name" placeholder="例如：三太子" /></label>
    {[ ["camp", "陣營"], ["appearance", "登場性質"], ["history", "歷史性"] ].map(([key, label]) => <label>{label}<select name={key}><option value="">全部</option></select></label>)}
    <label>站內圖像<select name="image"><option value="">全部</option><option value="yes">有圖片</option><option value="no">無圖片</option></select></label>
    <label>封神<select name="god"><option value="">全部</option><option value="yes">已封神</option><option value="no">未封神／其他</option></select></label>
    <label>初登場自<input name="from" type="number" min="1" max="100" placeholder="1" /></label><label>至<input name="to" type="number" min="1" max="100" placeholder="100" /></label>
    <label>排序<select name="sort"><option value="stroke">姓名筆畫</option><option value="first">初登場回</option><option value="camp">陣營</option></select></label>
    <label>顯示方式<select name="view"><option value="table">表格</option><option value="cards">卡片牆</option></select></label>
    <button type="button" class="reset-filters">清除篩選</button>
  </div>
  <p class="browse-count" role="status" aria-live="polite">載入人物索引中……</p><div class="browse-results"></div>
  <noscript>請開啟 JavaScript 使用篩選，或由左側人物目錄查詢條目。</noscript>
</section>

export const ImageBrowse: QuartzComponent = (props) => {
  const category = (image: typeof images[number]) => {
    const types = props.allFiles.filter(f => (image.characters ?? []).includes(plain(f.frontmatter?.["名稱"] ?? f.frontmatter?.title)) || JSON.stringify(f.frontmatter?.["圖像"] ?? []).includes(image.local_path)).map(f => plain(f.frontmatter?.["類型"]))
    const text = `${image.title} ${image.description} ${(image.characters ?? []).join(" ")}`
    return [...new Set([...(types.includes("人物") ? ["人物"] : []), ...(types.includes("法寶") ? ["法器"] : []), ...(types.includes("法術符訣") ? ["法術"] : []), ...(types.includes("陣法") ? ["陣法"] : []), ...(types.includes("坐騎") || /坐騎|青鸞|四不相|墨麒麟|金睛獸|五色神牛|獨角烏煙獸/.test(text) ? ["坐騎"] : [])])]
  }
  return <section class="image-browser"><p>每張圖保留原始來源與授權；點選縮圖可放大。分類依條目對應，可同時屬於多類。</p><label class="gallery-filter">類別<select name="gallery-category"><option value="">全部 {images.length} 幅</option>{["人物", "法器", "坐騎", "法術", "陣法"].map(c => <option value={c}>{c}</option>)}</select></label><span class="gallery-count" role="status" aria-live="polite"></span><div class="image-catalog">{images.map(image => <figure data-category={category(image).join(" ")}>
    <a class="image-zoom" href={assetUrl(props.fileData.slug!, image.local_path)} aria-label={`放大${image.title}`}><img src={assetUrl(props.fileData.slug!, image.thumbnail_path ?? image.local_path)} alt={image.title} loading="lazy" width="160" height="115" /></a>
    <figcaption><strong>{image.title}</strong><span>{(image.characters ?? []).slice(0, 3).map(name => { const href = pageUrl(props.fileData.slug!, name, props.allFiles); return href ? <a class="internal" href={href}>{name} </a> : `${name} ` })}</span><span><a href={image.source_page} target="_blank" rel="noopener noreferrer">來源</a> · <a href={image.license_url ?? image.source_page} target="_blank" rel="noopener noreferrer">{image.license}</a></span><details><summary>圖說與製作者</summary>{image.description}<br />署名：{image.attribution ?? plain(image.commons_metadata?.Artist?.value).replace(/<[^>]*>/g, "")}<br />{image.transformation}</details></figcaption>
  </figure>)}</div></section>
}
export default (() => CharacterBrowse) satisfies QuartzComponentConstructor

export const EntityBrowse: QuartzComponent = (props) => {
  const files = props.allFiles.filter(file => ["法寶", "坐騎"].includes(plain(file.frontmatter?.["類型"]))).sort((a,b) => new Intl.Collator("zh-Hant-TW-u-co-stroke").compare(plain(a.frontmatter?.["名稱"]), plain(b.frontmatter?.["名稱"])))
  return <section class="entity-browser"><label class="gallery-filter">條目類型<select name="entity-type"><option value="">法寶與坐騎</option><option value="法寶">法寶</option><option value="坐騎">坐騎</option></select></label><span class="entity-count" role="status" aria-live="polite"></span><div class="table-container"><table><thead><tr><th scope="col">名稱</th><th scope="col">類型</th><th scope="col">持有者／主人</th><th scope="col">初登場</th></tr></thead><tbody>{files.map(file => <tr data-type={plain(file.frontmatter?.["類型"])}><td><a class="internal" href={pageUrl(props.fileData.slug!, plain(file.frontmatter?.["名稱"]), props.allFiles)}>{plain(file.frontmatter?.["名稱"])}</a></td><td>{plain(file.frontmatter?.["類型"])}</td><td>{plain(file.frontmatter?.["主人"] ?? file.frontmatter?.["歷任持有者"])}</td><td>{plain(file.frontmatter?.["初登場"]) || "待補"}</td></tr>)}</tbody></table></div></section>
}
