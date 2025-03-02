export const browserLaunchOptions = {
    headless: "new",
    defaultViewport: { width: 1080, height: 1024 },
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", // 设置 User Agent
        "--incognito", // 无痕模式
        "--lang=en-US",
        "--proxy-server=http://127.0.0.1:3067",
    ], // 添加启动参数，提高稳定性
};

export const maxResults = 5;