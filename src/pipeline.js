import { getReadabilityScript } from "./macro.js";
import { SELECTORS_TO_REMOVE} from "./utils.js";
import { toMarkdown } from "./to-markdown.js";
import { Transform } from "node:stream";


// 创建转换流来处理结果
class ResultsTransform extends Transform {
    constructor(options = {}) {
      super({ objectMode: true, ...options });
    }
  
    _transform(chunk, encoding, callback) {
      // 仅推送成功的结果
      if (chunk.success) {
        this.push(chunk.data);
      }
      callback();
    }
  }

export async function scrapeWithPipeline(links, browser) {
    const resultsStream = new ResultsTransform();
  
    try {
      // 并行处理所有链接
      const readabilityScript = await getReadabilityScript();
      const results = await Promise.all(
        links.map(async (link) => {
          try {
            const newPage = await browser.newPage();
            await newPage.setRequestInterception(true);
  
            newPage.on("request", (request) => {
              if (
                ["image", "stylesheet", "font"].includes(request.resourceType())
              ) {
                request.abort();
              } else {
                request.continue();
              }
            });
            await newPage.goto(link, {
              waitUntil: "domcontentloaded",
              timeout: 60000
            });
  
            const result = await newPage.evaluate(
              ([readabilityScript, selectorsToRemove]) => {
                const Readability = new Function(
                  "module",
                  `${readabilityScript}\nreturn module.exports`,
                )({});
  
                const document = window.document;
  
                document
                  .querySelectorAll(selectorsToRemove.join(","))
                  .forEach((el) => el.remove());
  
                const article = new Readability(document).parse();
                // const article = Readability.parseDocument(document);
                // console.log('article',article)
  
                return {
                  title: document.title,
                  content: article?.content || "",
                };
              },
              [readabilityScript, SELECTORS_TO_REMOVE],
            );
  
            await newPage.close();
            if (!result) return null;
            const content = toMarkdown(result.content)
            return {
              success: true,
              data: { ...result, url: link, content: content  },
            };
          } catch (error) {
            console.error("处理链接时发生错误:", error);
            return {
              success: false,
              url: link,
              error: error.message,
            };
          }
        }),
      );
  
      // 将结果写入流
      results.forEach((result) => resultsStream.write(result));
      // 移除或注释掉这行调试输出
      // console.log("resultsStream", resultsStream);
      resultsStream.end();
  
      return resultsStream;
    } catch (error) {
      console.error("执行过程中发生错误:", error);
      await browser?.close();
      throw error;
    }
  }