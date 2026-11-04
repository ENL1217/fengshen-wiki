import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import DatabaseContent from "./quartz/components/pages/DatabaseContent"
import { CharacterIndex } from "./quartz/plugins/emitters/characterIndex"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "封神演義資料庫",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "zh-TW",
    baseUrl: "ENL1217.github.io/fengshen-wiki",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: { name: "Noto Serif TC", weights: [400, 700], includeItalic: false },
        body: { name: "Noto Sans TC", weights: [400, 600], includeItalic: false },
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f6f1e7",
          lightgray: "#d9d0c1",
          gray: "#746c61",
          darkgray: "#514b43",
          dark: "#2a2622",
          secondary: "#a33a2a",
          tertiary: "#334e68",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#ead6ad",
        },
        darkMode: {
          light: "#1b1916",
          lightgray: "#494238",
          gray: "#b6aa99",
          darkgray: "#d7cdbc",
          dark: "#f6f1e7",
          secondary: "#ef9c87",
          tertiary: "#9cbad4",
          highlight: "rgba(156, 186, 212, 0.12)",
          textHighlight: "#59462d",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.EditorialLayers(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage({ pageBody: DatabaseContent() }),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      CharacterIndex(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Head supplies source images directly; avoid rasterizing the full CJK font per page.
    ],
  },
}

export default config
