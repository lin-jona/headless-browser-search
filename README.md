# Headless Browser 网页搜索工具

这是一个基于 Puppeteer 的命令行工具，用于执行网页搜索并提取搜索结果内容。该工具使用无头浏览器技术，通过 [OpenXNG 搜索引擎](https://opnxng.com/)进行内容检索，并将结果以结构化的 XML 格式输出，适合需要批量获取网页内容的场景。

## 主要特性

- 🚀 基于 Puppeteer 的高性能网页内容抓取
- 🔍 智能搜索结果过滤，支持自定义排除域名
- 📝 使用 Mozilla 的 Readability 算法提取页面主要内容
- ✨ 自动将 HTML 转换为干净的纯文本格式
- 🌊 基于 Node.js 流式处理，支持大量数据处理
- 📸 内置截图功能，方便调试和验证
- 🛡️ 内置请求拦截，优化性能和资源使用

## 系统要求

- Node.js 16.0.0 或更高版本
- Windows/Linux/MacOS 操作系统

## 快速开始

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/lin-jona/headless-browser-search.git
```

2. 进入项目目录：
```bash
cd headless-browser-search
```

3. 安装依赖：
```bash
npm install
```

### 基本使用

1. 直接搜索：
```bash
echo "你想搜索的内容" | node search.js
```

2. 从文件读取搜索内容：
```bash
cat search_query.txt | node search.js > output.txt
```

### 输出格式

搜索结果将以 XML 格式输出，包含以下字段：
```xml
<article>
    <title>页面标题</title>
    <url>页面URL</url>
    <content>提取的主要内容</content>
</article>
```

## 高级配置

### 浏览器配置
在 `src/browser.js` 中可以自定义浏览器行为：

```javascript
export const browserLaunchOptions = {
    headless: "new",          // 设置为 false 可开启浏览器界面
    defaultViewport: {        // 设置视窗大小
        width: 1080, 
        height: 1024
    },
    args: [                   // 自定义启动参数
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--incognito"         // 使用无痕模式
    ]
};

export const maxResults = 5;  // 控制最大结果数
```

### 域名过滤
在 `src/utils.js` 中可以配置需要排除的域名：

```javascript
let excludeDomains = [
    "blog.csdn.net",
    "baidu.com",
    "zhihu.com",
    // 添加更多需要排除的域名
]
```

## 项目结构

```plaintext
headless-browser-search/
├── search.js          # 程序入口点
├── src/
│   ├── browser.js     # 浏览器配置和启动选项
│   ├── macro.js       # Readability 脚本加载器
│   ├── pipeline.js    # 数据处理流水线
│   ├── to-markdown.js # HTML 转换工具
│   └── utils.js       # 工具函数和配置
└── package.json       # 项目依赖配置
```

## 核心依赖

- **puppeteer**: ^21.0.0 - Chrome 自动化工具
- **@mozilla/readability**: ^0.4.4 - 网页内容提取库
- **turndown**: ^7.1.2 - HTML 到文本转换工具
- **turndown-plugin-gfm**: ^1.0.2 - GitHub 风格 Markdown 支持
- **esbuild**: ^0.19.2 - 高性能 JavaScript 打包工具

## 工作流程

1. 接收搜索查询输入
2. 启动配置好的 Puppeteer 实例
3. 访问 OpenXNG 搜索引擎 (https://opnxng.com/) 并执行搜索
4. 智能过滤搜索结果链接
5. 并行处理多个搜索结果
6. 使用 Readability 提取核心内容
7. 转换并清理内容格式
8. 通过流处理输出结果

## 故障排除

- 如果遇到 Puppeteer 启动失败，请检查系统代理设置
- 内存使用过高时，可以通过调整 `maxResults` 来限制结果数量
- 如果提取结果不理想，可以调整 `SELECTORS_TO_REMOVE` 配置

## 许可证

本项目基于 MIT License 开源。

## 致谢

本项目基于 [local-web-search](https://github.com/egoist/local-web-search) 进行二次开发，感谢原作者的贡献。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。