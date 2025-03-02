import { shouldSkipDomain, getSearchUrl } from "./src/utils.js";
import { scrapeWithPipeline } from "./src/pipeline.js";
import { browserLaunchOptions, maxResults } from "./src/browser.js"
import puppeteer from "puppeteer";
import { Transform } from "node:stream";

// 从标准输入读取搜索内容
let searchContent = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("data", (chunk) => {
  searchContent += chunk;
});

process.stdin.on("end", async () => {
  let browser;
  const {headless, defaultViewport, args} = browserLaunchOptions
  // const maxResults = maxResults
  try {
    browser = await puppeteer.launch({
      headless: headless,
      defaultViewport: defaultViewport,
      args: args,
    });

    const page = await browser.newPage();

    // 设置更长的超时时间（如果需要）
    // page.setDefaultTimeout(60000);

    // 访问并等待页面加载完成
    const options = {
      excludeDomains:[],
      query: searchContent
    }
    const searchUrl = getSearchUrl(options)
    await page.goto(searchUrl, {
      waitUntil: ["domcontentloaded", "networkidle2"],
    });

    // // 等待搜索框出现并输入内容
    // await page.waitForSelector("#q", { visible: true });
    // const blockSite = " -site:blog.csdn.net -site:baidu.com -site:zhihu.com -site:kaijiang.500.com";
    // await page.type("#q", searchContent.trim() + blockSite);

    // // 点击搜索按钮
    // await page.click("#send_search", { visible: true }); // 搜索按钮的实际 ID

    // 等待搜索结果加载
    await page.waitForSelector("#results", { visible: true }); // 等待搜索结果容器出现

    // 截图
    await page.screenshot({
      path: "search_result.png",
      fullPage: true,
    });

    // console.log("搜索完成，截图已保存为 search_result.png");
    // 等待搜索结果容器加载完成
    await page.waitForSelector("div#urls");

    // 获取所有文章元素的链接
    const links = await page.evaluate((maxResults) => {
      const articles = document.querySelectorAll("div#urls article");
      return Array.from(articles)
        .slice(0, maxResults)
        .map((article) => {
          const anchor = article.querySelector("a");
          return anchor ? anchor.href : null;
        })
        .filter(link => link !== null);
    }, maxResults);
    
    // 在 Node.js 环境中进行域名过滤
    const filteredLinks = links.filter(link => !shouldSkipDomain(link));
    
    const pipeline = await scrapeWithPipeline(filteredLinks, browser);
    // 添加调试信息，查看是否有数据流过管道
    let hasData = false;

    // 使用管道处理结果
    pipeline
      .pipe(
        new Transform({
          objectMode: true,
          transform(chunk, encoding, callback) {
            // 标记有数据流过
            hasData = true;
            // 提取需要的数据
            this.push({
              title: chunk.title,
              url: chunk.url,
              content: chunk.content,
              // content: chunk.content.substring(0, 1000) + "...", // 只保留部分内容
            });
            callback();
          },
        }),
      )
      .pipe(
        new Transform({
          objectMode: true,
          transform(chunk, encoding, callback) {
            // 将对象转换为格式化文本以输出到标准输出
            const textOutput = `<article>\n
                                <title> ${chunk.title}</title>\n
                                <url>${chunk.url}</url>\n
                                <content>${chunk.content}</content>\n
                                </article>\n\n`;

            // 使用Buffer确保UTF-8编码输出
            process.stdout.write(Buffer.from(textOutput, "utf8"));
            this.push(chunk);
            callback();
          },
        }),
      )
      .on("error", (err) => {
        console.error("流处理错误:", err);
        browser.close();
      })
      .on("end", () => {
        if (!hasData) {
          console.log("警告: 没有数据流过管道，请检查爬取结果");
        }
        browser.close().then(() => {
          // 添加延迟确保所有输出都已完成
          setTimeout(() => {
            process.exit(0); // 成功退出，状态码为0
          }, 1000);
        });
      });
    // console.log("pipeline", pipeline);
  } catch (error) {
    console.error("执行过程中发生错误:", error);
    await browser?.close(); // 确保浏览器实例被关闭
  }
});

// 如果没有输入，输出使用说明
if (process.stdin.isTTY) {
  console.log('使用方法: echo "search_content" | node search.js');
  process.exit(1);
}
