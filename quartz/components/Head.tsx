import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
import { firstImage, plain } from "../util/database"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const fm = fileData.frontmatter
    const structuredDescription = fm?.["名稱"] && fm?.["類型"] ? [plain(fm["名稱"]), `《封神演義》${plain(fm["類型"])}資料`, ...["陣營", "師承", "功能", "特徵", "初登場", "封神"].filter(key => fm[key]).map(key => `${key}：${plain(Array.isArray(fm[key]) ? fm[key].join("、") : fm[key])}`)].join("；").slice(0, 160) : undefined
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      structuredDescription ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources
    const uiText = "封神演義資料庫每一句都有回目可查原典考據自創小說原文怎麼寫逐句附回目出處跨文本與史書對照說明依據來源遊戲數值與推演設定明確標示非原著查人物條目法寶坐騎正神名錄原著收錄圖像從陣營初登場歷史性找到故事中的每個人按八部查閱神位對照誥敕結局追查持有者使用戰績剋制下落逐回讀沿百回本回死亡恩怨師承循殺害因果法脈釐清人物之間關係區分記載原型後世神譜全站圖畫冊外部參考最新更新介面資訊卡改版圖片統計查看紀錄本站授權來源原圖公有領域哪吒楊戩姜子牙聞仲通天教主妲己探索他書人物勢力陣法術符訣層暫無待補待考全部顯示排序表格筆畫篩選姓名別名有未封神其他至自清除模式放大關閉前下一回載入索引詳細章節備註首頁閱讀搜尋"
    const fontText = [...new Set((fileData.text ?? "") + title + uiText + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789，。、《》；：！？（）L123 /-·→↗")].join("")
    // The homepage requests only glyphs it actually uses, instead of the complete CJK family.
    const fontHref = googleFontHref(cfg.theme) + (fontText.length < 1100 ? `&text=${encodeURIComponent(fontText)}` : "")

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const image = firstImage(fileData)
    const ogImageDefaultPath = image ? `https://${cfg.baseUrl}/${image.split("/").map(encodeURIComponent).join("/")}` : `https://${cfg.baseUrl}/static/og-image.png`

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            {fileData.slug !== "index" && <><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" /></>}
            <link rel="stylesheet" href={fileData.slug === "index" ? joinSegments(baseDir, "static/fonts/home.css") : fontHref} data-font-source={fontHref} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
