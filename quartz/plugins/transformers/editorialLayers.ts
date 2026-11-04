import { QuartzTransformerPlugin } from "../types"
import { Root, Element, Text } from "hast"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"

export const EditorialLayers: QuartzTransformerPlugin = () => ({
  name: "EditorialLayers",
  htmlPlugins() {
    return [() => (tree: Root, file) => {
      let section = ""
      for (const node of tree.children) {
        if (node.type !== "element") continue
        if (node.tagName === "h2") section = toString(node)
        if (section === "故事年表" && (node.tagName === "table" || node.tagName === "div" && node.properties.className?.toString().includes("table-container"))) node.properties.className = [...(Array.isArray(node.properties.className) ? node.properties.className : []), "chronology"]
      }
      visit(tree, "element", (node: Element) => {
        if (/^h[2-4]$/.test(node.tagName)) {
          const title = toString(node)
          const level = /跨文本|史書對應|歷史考據/.test(title) ? 2 : /原文|原典引文/.test(title) ? 1 : 0
          if (level) node.children.push({ type: "element", tagName: "span", properties: { className: ["layer-badge", `layer-l${level}`] }, children: [{ type: "text", value: level === 1 ? "L1 原典" : "L2 考據" }] })
        }
        if (node.tagName === "blockquote") {
          visit(node, "text", (text: Text, index, parent) => {
            const offset = text.value.search(/——第/)
            if (offset < 0 || index === undefined || !parent) return
            const value = text.value
            parent.children.splice(index, 1,
              { type: "text", value: value.slice(0, offset) },
              { type: "element", tagName: "span", properties: { className: ["source-citation"] }, children: [{ type: "text", value: value.slice(offset) }] } as Element)
            return index + 2
          })
        }
        if (node.tagName === "a" && decodeURI(String(node.properties.href ?? "")).includes("待辦與規劃")) {
          node.tagName = "span"
          node.properties = { className: ["editorial-reference"], title: "編務文件，未公開" }
        }
      })
      if (String(file.data.slug).startsWith("90-遊戲設定/")) tree.children.unshift({ type: "element", tagName: "div", properties: { className: ["layer-notice"] }, children: [
        { type: "element", tagName: "span", properties: { className: ["layer-badge", "layer-l3"] }, children: [{ type: "text", value: "L3 自創" }] },
        { type: "text", value: "本頁為遊戲設計與自創推演，請與原典記載分別閱讀。" },
      ] })
      if (/^(80-跨文本對應|85-他書人物|86-史書對應)\//.test(String(file.data.slug))) tree.children.unshift({ type: "element", tagName: "div", properties: { className: ["layer-notice"] }, children: [
        { type: "element", tagName: "span", properties: { className: ["layer-badge", "layer-l2"] }, children: [{ type: "text", value: "L2 考據" }] },
        { type: "text", value: "本頁為跨文本、史料或神譜對照；推論與原典記載分別閱讀。" },
      ] })
    }]
  },
})
