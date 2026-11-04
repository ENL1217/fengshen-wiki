function setupDatabase() {
  document.querySelectorAll("article h2").forEach(heading => {
    if (heading.textContent?.trim() !== "古籍圖像") return
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
    const target = (event.target as Element).closest<HTMLAnchorElement>("a.image-zoom")
    if (!target) return
    event.preventDefault()
    const dialog = document.createElement("dialog")
    dialog.className = "image-lightbox"
    const close = document.createElement("button")
    close.textContent = "關閉圖片 ×"
    const img = document.createElement("img")
    img.src = target.href
    img.alt = target.querySelector("img")?.alt ?? "放大圖像"
    dialog.append(close, img)
    document.body.append(dialog)
    close.onclick = () => dialog.close()
    dialog.onclick = e => { if (e.target === dialog) dialog.close() }
    dialog.addEventListener("close", () => dialog.remove(), { once: true })
    dialog.showModal()
  }
  document.addEventListener("click", openImage)
  window.addCleanup(() => document.removeEventListener("click", openImage))
}
document.addEventListener("nav", setupDatabase)
