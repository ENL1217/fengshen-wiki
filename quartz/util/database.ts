import fs from "node:fs"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, pathToRoot, resolveRelative } from "./path"

export const plain = (value: unknown): string => String(value ?? "").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, name, label) => label ?? name).trim()
export const values = (value: unknown): string[] => (Array.isArray(value) ? value : value ? [value] : []).map(String).filter(Boolean)
export const firstImage = (file: QuartzPluginData) => values(file.frontmatter?.["圖像"])[0]?.replace(/^!?\[\[|\]\]$/g, "").split("|")[0]
export const assetUrl = (slug: FullSlug, path: string) => `${pathToRoot(slug)}/${path.split("/").map(encodeURIComponent).join("/")}`
export const findFile = (name: string, files: QuartzPluginData[]) => {
  const target = name.replace(/\.md$/, "")
  return files.find(f => f.slug === target) ?? files.find(f => String(f.slug).split("/").pop() === target || f.frontmatter?.["名稱"] === target || values(f.frontmatter?.aliases).includes(target))
}
export const pageUrl = (slug: FullSlug, name: string, files: QuartzPluginData[]) => {
  const file = findFile(name, files)
  return file ? resolveRelative(slug, file.slug!) : undefined
}
export const chapterNumber = (value: unknown) => Number(String(value ?? "").match(/第\s*0*(\d+)\s*回/)?.[1]) || 0
export const isGod = (file: QuartzPluginData) => {
  const value = plain(file.frontmatter?.["封神"])
  return !!value && !/^(無|未|不|肉身成聖|成仙|待)/.test(value)
}
export interface SourceImage { title: string; kind: string; characters?: string[]; chapters?: number[]; description: string; source_page: string; license: string; license_url?: string; attribution?: string; transformation?: string; local_path: string; thumbnail_path?: string; commons_metadata?: Record<string, { value: string }> }
export const images: SourceImage[] = JSON.parse(fs.readFileSync("content/95-圖像資料/來源紀錄.json", "utf8"))
export const sourceFor = (path?: string) => images.find(image => image.local_path === path)
const statsText = fs.readFileSync("content/90-遊戲設定/人物數值表.md", "utf8")
export const gameStats = new Map<string, number[]>()
for (const line of statsText.split("\n")) {
  const name = line.match(/^\|\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/)?.[1]
  const numbers = line.split("|").slice(-8, -1).map(v => Number(v.trim()))
  if (name && numbers.length === 7 && numbers.every(Number.isFinite)) gameStats.set(name, numbers)
}
