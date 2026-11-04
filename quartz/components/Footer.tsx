import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { pageUrl } from "../util/database"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass } = props
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
          封神演義資料庫 · 原典、考據、自創分層標示
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link.startsWith("https:") ? link : pageUrl(props.fileData.slug!, link, props.allFiles)}>{text}</a>
            </li>
          ))}
        </ul>
        <small>Built with <a href="https://quartz.jzhao.xyz/">Quartz {version}</a></small>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
