import Turndown from "turndown"
import { gfm } from "turndown-plugin-gfm"
import { stripHTML } from "./utils.js"

export const turndown = new Turndown({
  codeBlockStyle: "fenced",
})
turndown.use(gfm)

export function toMarkdown(html) {
  return stripHTML(turndown.turndown(html))
}


// module.exports = { toMarkdown };