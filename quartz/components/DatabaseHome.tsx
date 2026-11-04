import { QuartzComponent } from "./types"
import { assetUrl, findFile, firstImage, images, pageUrl, plain, sourceFor } from "../util/database"

const DatabaseHome: QuartzComponent = (props) => {
  const { allFiles, fileData } = props
  const people = allFiles.filter(f => f.frontmatter?.["類型"] === "人物")
  const gods = findFile("封神榜總表", allFiles)
  const counts = [
    [people.length, "人物條目"],
    [allFiles.filter(f => f.frontmatter?.["類型"] === "法寶").length, "法寶條目"],
    [allFiles.filter(f => f.frontmatter?.["類型"] === "坐騎").length, "坐騎條目"],
    [Number(plain(gods?.frontmatter?.["總數"]).match(/\d+/)?.[0]) || 0, "正神名錄"],
    [allFiles.filter(f => f.frontmatter?.["類型"] === "回目" && Number(f.frontmatter?.["回數"]) > 0).length, "原著回目"],
    [images.length, "收錄圖像"],
  ]
  const link = (name: string) => pageUrl(fileData.slug!, name, allFiles)
  const entrances = [
    ["人物總覽", "查人物", "從陣營、初登場與歷史性，找到故事中的每一個人。", "01"],
    ["封神榜總表", "封神榜", "按八部名錄查閱神位，對照原文誥敕與人物結局。", "02"],
    ["法寶總表", "法寶與術法", "追查持有者、使用戰績、剋制與下落。", "03"],
    ["回目總表", "逐回讀原典", "沿百回故事，查本回初登場與死亡人物。", "04"],
    ["殺害因果表", "恩怨與師承", "循殺害因果與法脈，釐清人物之間的關係。", "05"],
    ["封神與史書人物對照表", "跨文本與史書", "區分小說記載、歷史原型與後世神譜。", "06"],
  ]
  return <div class="database-home">
    <div class="home-kicker">原典有據 · 考據有別 · 創作有界</div>
    <h2 class="home-statement">每一句，都有回目可查。</h2>
    <p class="home-position">《封神演義》全人物資料庫，原典、考據、自創，分層標示。</p>
    <div class="home-layers">{[["1", "原典", "小說原文怎麼寫，逐句附回目出處。"], ["2", "考據", "跨文本與史書對照，說明依據來源。"], ["3", "自創", "遊戲數值與推演設定，明確標示非原著。"]].map(([level, label, desc]) => <div><span class={`layer-badge layer-l${level}`}>{label} L{level}</span><span>{desc}</span></div>)}</div>
    <div class="hero-portraits" aria-label="墨繪人物精選">{["哪吒", "楊戩", "姜子牙", "聞仲", "通天教主", "妲己"].map(name => {
      const file = findFile(name, allFiles)!
      const image = firstImage(file)
      const source = sourceFor(image)
      return <figure><a class="internal" href={link(name)}>{image && <img src={assetUrl(fileData.slug!, source?.thumbnail_path ?? image)} alt={`${name}墨繪像`} width="180" height="230" decoding="async" />}<figcaption>{name}</figcaption></a>{source && <a class="hero-credit" href={source.source_page} target="_blank" rel="noopener noreferrer">原圖 · {source.license === "Public domain" ? "公有領域" : source.license}</a>}</figure>
    })}</div>
    <div class="home-counts" aria-label="資料庫規模">{counts.map(([count, label]) => <div><strong>{count}</strong><span>{label}</span></div>)}</div>
    <p class="count-note">數量依資料自動彙整；圖像包含古籍繪本、刊本插圖及其他已標示授權的參考圖。</p>
    <section class="home-entrances" aria-label="查詢入口">{entrances.map(([target, title, description, number]) => number === "06" ? <div class="entrance-card"><small>{number}</small><h3>{title}</h3><p>{description}</p><nav class="research-links" aria-label="考據分類"><a class="internal" href={assetUrl(fileData.slug!, "80-跨文本對應/")}>跨文本 →</a><a class="internal" href={link(target)}>史書對照 →</a></nav></div> : <a class="internal entrance-card" href={link(target)}><small>{number}</small><h3>{title}<span>↗</span></h3><p>{description}</p></a>)}</section>
    <div class="home-secondary"><a class="internal" href={link("師承譜系")}>師承譜系</a><a class="internal" href={link("關係圖譜")}>全站圖譜</a><a class="internal" href={link("圖像索引")}>圖像畫冊</a><a class="internal" href={link("外部圖像參考")}>外部圖像參考</a></div>
    <p class="latest-update">最新更新：查詢介面與條目資訊卡改版；圖片與外部參考分開統計。<a class="internal" href={link("更新紀錄")}>查看更新紀錄 →</a></p>
  </div>
}
export default DatabaseHome
