let excludeDomains = [
  "blog.csdn.net",
  "baidu.com",
  "zhihu.com",
  "kaijiang.500.com"
  ]

export function getSearchUrl(options) {
  excludeDomains = options.excludeDomains.length > 0? excludeDomains.concat(options.excludeDomains):excludeDomains
  const searchParams = new URLSearchParams({
    q: `${`${excludeDomains.map((domain) => `-site:${domain}`).join(" ")} `}${options.query}`,
  })

  const url = `https://opnxng.com/search?${searchParams.toString()}`

  return url
};

const parseUrl = (url) => {
  try {
    return new URL(url);
  } catch (error) {
    return null;
  }
};

export const shouldSkipDomain = (url) => {
  const parsed = parseUrl(url);

  if (!parsed) return true;

  const { hostname } = parsed;

  return [
    "reddit.com",
    "www.reddit.com",
    "x.com",
    "twitter.com",
    "www.twitter.com",
    // TODO: maybe fetch transcript for youtube videos
    "youtube.com",
    "www.youtube.com",
  ].includes(hostname);
};

export const stripHTML = (html) => {
  return html.replace(/<[^>]*>?/g, "");
};

export const SELECTORS_TO_REMOVE = [
  "script,noscript,style,link,svg,img,video,iframe,canvas",
  // wikipedia refs
  ".reflist",
];


// module.exports = { shouldSkipDomain, stripHTML, SELECTORS_TO_REMOVE };