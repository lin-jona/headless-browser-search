// const esbuild = require("esbuild");
// const path = require("path");
import esbuild from "esbuild";
import path from "path";

export const getReadabilityScript = async () => {
  const entryPoint = path.resolve(
    "./node_modules/@mozilla/readability/Readability.js",
  );

  const result = await esbuild.build({
    entryPoints: [entryPoint],
    format: "cjs",
    minify: true,
    write: false, // 不写入文件，直接在内存中处理
  });

  // 将 Uint8Array 转换为字符串
  const content = new TextDecoder().decode(result.outputFiles[0].contents);
  // 添加一个包装函数来处理 HTML 内容
  // const wrappedContent = `
  //   ${content}
  //   module.exports.parseDocument = function(document) {
  //     const article = new module.exports(document).parse();
  //     if (!article) return null;
      
  //     // 创建临时 DOM 元素来解析 HTML
  //     const tempDiv = document.createElement('div');
  //     tempDiv.innerHTML = article.content;
      
  //     // 获取纯文本内容
  //     const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
  //     // 清理文本（移除多余空白）
  //     const cleanText = textContent
  //       .replace(/\\s+/g, ' ')
  //       .replace(/\\n\\s*\\n/g, '\\n')
  //       .trim();
      
  //     return {
  //       title: article.title,
  //       content: cleanText,
  //       excerpt: article.excerpt,
  //       byline: article.byline,
  //       dir: article.dir
  //     };
  //   };
  // `;

  return content;
};

// module.exports = { getReadabilityScript };