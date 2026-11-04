function setupDatabase() {
  const entity = document.querySelector<HTMLSelectElement>("select[name='entity-type']")
  if (entity) {
    const filter = () => {
      let count = 0
      document.querySelectorAll<HTMLElement>(".entity-browser tbody tr").forEach(row => {
        row.hidden = !!entity.value && row.dataset.type !== entity.value
        if (!row.hidden) count++
      })
      document.querySelector(".entity-count")!.textContent = `顯示 ${count} 筆`
    }
    entity.addEventListener("change", filter)
    window.addCleanup(() => entity.removeEventListener("change", filter))
    filter()
  }
  const browser = document.querySelector<HTMLElement>(".character-browser")
  if (browser) void setupCharacters(browser)
  const gallery = document.querySelector<HTMLSelectElement>("select[name='gallery-category']")
  if (gallery) {
    const filter = () => {
      let count = 0
      document.querySelectorAll<HTMLElement>(".image-catalog > figure").forEach(figure => {
        figure.hidden = !!gallery.value && !(figure.dataset.category ?? "").split(" ").includes(gallery.value)
        if (!figure.hidden) count++
      })
      document.querySelector(".gallery-count")!.textContent = `顯示 ${count} 幅`
    }
    gallery.addEventListener("change", filter)
    window.addCleanup(() => gallery.removeEventListener("change", filter))
    filter()
  }
  document.querySelectorAll("article h2").forEach(heading => {
    if (!["古籍圖像", "圖像與來源", "核實圖像與使用場景"].includes(heading.textContent?.trim() ?? "")) return
    const grid = document.createElement("div")
    grid.className = "source-gallery"
    heading.after(grid)
    let node = grid.nextElementSibling
    let figure: HTMLElement | undefined
    while (node && !/^H[12]$/.test(node.tagName)) {
      const next = node.nextElementSibling
      if (node.querySelector("img")) {
        figure = document.createElement("figure")
        grid.append(figure)
      }
      if (figure) figure.append(node)
      node = next
    }
    const first = grid.querySelector("img")
    const hero = document.querySelector<HTMLAnchorElement>(".entry-infobox .image-zoom")
    if (first && hero && new URL(first.getAttribute("src")!, location.href).pathname === new URL(hero.href).pathname) {
      const figure = first.closest("figure")!
      figure.classList.add("first-image-source")
      first.remove()
      figure.insertAdjacentHTML("afterbegin", '<small>資訊卡主圖的圖說與完整來源</small>')
    }
  })
  document.querySelectorAll<HTMLImageElement>(".source-gallery img").forEach(img => {
    img.loading = "lazy"
    if (img.closest("a")) return
    const anchor = document.createElement("a")
    anchor.href = img.src
    anchor.className = "image-zoom"
    anchor.setAttribute("aria-label", `放大${img.alt || "圖像"}`)
    img.before(anchor)
    anchor.append(img)
  })
  const openImage = (event: Event) => {
    if (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
    const target = (event.target as Element).closest<HTMLAnchorElement>("a.image-zoom")
    if (!target) return
    event.preventDefault()
    event.stopPropagation()
    const dialog = document.createElement("dialog")
    dialog.className = "image-lightbox"
    dialog.setAttribute("aria-label", target.querySelector("img")?.alt ?? "放大圖像")
    const close = document.createElement("button")
    close.textContent = "關閉圖片 ×"
    const img = document.createElement("img")
    img.src = target.href
    img.alt = target.querySelector("img")?.alt ?? "放大圖像"
    dialog.append(close, img)
    document.body.append(dialog)
    close.onclick = () => dialog.close()
    dialog.onclick = e => { if (e.target === dialog) dialog.close() }
    dialog.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); dialog.close() }
    })
    dialog.addEventListener("close", () => dialog.remove(), { once: true })
    dialog.showModal()
  }
  document.addEventListener("click", openImage, true)
  window.addCleanup(() => {
    document.removeEventListener("click", openImage, true)
    document.querySelectorAll("dialog.image-lightbox").forEach(dialog => dialog.remove())
  })
}
document.addEventListener("nav", setupDatabase)
export {}

type CharacterRow = { slug: string; name: string; aliases: string[]; camp: string[]; appearance: string; history: string; god: boolean; first: number | null; image: string | null }
async function setupCharacters(root: HTMLElement) {
  try {
    const response = await fetch(root.dataset.index!)
    if (!response.ok) throw new Error(`人物索引 ${response.status}`)
    const characters: CharacterRow[] = await response.json()
    if (!root.isConnected) return
    const field = (name: string) => root.querySelector<HTMLInputElement | HTMLSelectElement>(`[name='${name}']`)!
    for (const key of ["camp", "appearance", "history"] as const) {
      const options = [...new Set(characters.flatMap(person => Array.isArray(person[key]) ? person[key] : [person[key]]))].filter(Boolean).sort(new Intl.Collator("zh-Hant-TW-u-co-stroke").compare)
      for (const value of options) field(key).append(new Option(value, value))
    }
    const node = (tag: string, text?: string) => { const element = document.createElement(tag); if (text) element.textContent = text; return element }
    const url = (path: string) => new URL(root.dataset.root! + path.split("/").map(encodeURIComponent).join("/"), location.href).href
    const render = () => {
      const query = field("name").value.trim().toLowerCase()
      const list = characters.filter(person => {
        const first = person.first
        return (!query || [person.name, ...person.aliases].some(name => name.toLowerCase().includes(query)))
          && (!field("camp").value || person.camp.includes(field("camp").value))
          && (!field("appearance").value || person.appearance === field("appearance").value)
          && (!field("history").value || person.history === field("history").value)
          && (!field("image").value || Boolean(person.image) === (field("image").value === "yes"))
          && (!field("god").value || person.god === (field("god").value === "yes"))
          && (!field("from").value || !!first && first >= Number(field("from").value))
          && (!field("to").value || !!first && first <= Number(field("to").value))
      })
      const collator = new Intl.Collator("zh-Hant-TW-u-co-stroke")
      list.sort((a, b) => (field("sort").value === "first" ? (a.first ?? Infinity) - (b.first ?? Infinity) : field("sort").value === "camp" ? collator.compare(a.camp.join(""), b.camp.join("")) : 0) || collator.compare(a.name, b.name))
      const results = root.querySelector(".browse-results")!
      results.replaceChildren()
      root.querySelector(".browse-count")!.textContent = `顯示 ${list.length}／${characters.length} 位人物`
      const cards = field("view").value === "cards"
      const container = node(cards ? "div" : "table")
      container.className = cards ? "character-cards" : "character-table"
      if (!cards) {
        const head = node("thead"), tr = node("tr")
        for (const title of ["人物", "陣營", "初登場", "歷史性", "封神", "圖像"]) { const th = node("th", title); th.setAttribute("scope", "col"); tr.append(th) }
        head.append(tr); container.append(head)
      }
      const body = cards ? container : node("tbody")
      for (const person of list) {
        const row = node(cards ? "div" : "tr")
        const name = node("a", person.name) as HTMLAnchorElement
        name.href = url(person.slug); name.className = "internal"
        if (cards) {
          row.className = "character-card"
          if (person.image) { const img = document.createElement("img"); img.src = url(person.image); img.alt = person.name; img.loading = "lazy"; img.width = 160; img.height = 180; name.prepend(img) }
          else { const missing = node("span", "暫無站內圖像"); missing.className = "no-portrait"; name.prepend(missing) }
          row.append(name, node("small", person.camp.join("、")), node("small", person.first ? `第${person.first}回初登場` : "初登場待補"))
        } else {
          const cell = node("td"); cell.append(name); row.append(cell)
          for (const text of [person.camp.join("、") || "—", person.first ? `第${person.first}回` : "待補", person.history || "待補", person.god ? "已封神" : "—", person.image ? "有" : "—"]) row.append(node("td", text))
        }
        body.append(row)
      }
      if (!cards) container.append(body)
      const wrapper = node("div"); wrapper.className = "table-container"; wrapper.append(container); results.append(wrapper)
    }
    root.addEventListener("input", render)
    root.addEventListener("change", render)
    const reset = () => { root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select").forEach(input => { if (input instanceof HTMLSelectElement) input.selectedIndex = 0; else input.value = "" }); render() }
    root.querySelector(".reset-filters")!.addEventListener("click", reset)
    window.addCleanup(() => { root.removeEventListener("input", render); root.removeEventListener("change", render); root.querySelector(".reset-filters")?.removeEventListener("click", reset) })
    render()
  } catch {
    root.querySelector(".browse-count")!.textContent = "人物索引載入失敗，請重新整理或使用左側目錄。"
  }
}
