import {
  apiRequestV2WithThrow,
  PaginationLimit,
  AdminUrl,
  toJsonObject,
  SiteUrl,
} from './api';
import nodeUrl from 'url';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import toc from 'remark-toc';
import slug from 'remark-slug';
import { getPlaiceholder } from 'plaiceholder';
export const DefaultSiteFeatureImage = {
  url: 'https://image.hicc.pro/pro/20210621011100FogTEZ-rHY_vjy8BV-yGeEPPrBe3NWXhU6m2v1W4087jDXEnl.jpg',
  width: 4032,
  height: 3024,
};
const prismPlugins = [
  // 'autolinker',
  // 'command-line',
  // 'data-uri-highlight',
  // 'diff-highlight',
  // 'inline-color',
  'keep-markup',
  'line-numbers',
  'show-invisibles',
  // 'treeview',
];
export async function markdownToHtml(markdown) {
  const result = await remark()
    .use(slug)
    .use(toc, { skip: 'Intro' })
    .use((config) => {
      return function loopTree(node) {
        // console.log('---', node);
        if (node.type === 'code') {
          node.lang += `[class="${prismPlugins.join(' ')}"]`;
        } else if (Array.isArray(node.children)) {
          node.children.forEach(loopTree);
        }
      };
    }, {})
    .use(prism, {
      // transformInlineCode: true,
      plugins: prismPlugins,
    })
    .use(html)
    .process(markdown);
  return result.toString();
}
/**
 * query books
 * @returns
 */
export const getBooks = () => {
  return apiRequestV2WithThrow(
    'graphql',
    'POST',
    {},
    {
      query: `query {
        books(limit:${PaginationLimit}) {
          id,name,slug,status, 
        }
      }`,
    }
  );
};

export const getPostCount = async (bookId = -1) => {
  // const adminUrl = process.env.Backend;
  const count = await apiRequestV2WithThrow(
    `/posts/countpublish`,
    'GET',
    {
      ...(bookId > -1 && { _where: [{ book: bookId }] }),
    },
    {
      returnText: true,
    }
  );
  return count.data ?? 0;
};
export const getPostCountNoFail = (bookId = -1) => {
  try {
    return getPostCount(bookId);
  } catch (error) {
    return 0;
  }
};
/**
 * query books
 * @param {*} start
 * @param {*} bookUUID
 * @returns
 */
export const getPosts = (start = 0, bookUUID = '') => {
  const limit = PaginationLimit;
  return apiRequestV2WithThrow(
    `graphql`,
    'POST',
    {},
    {
      query: `query {
        posts(limit: ${limit},start:${
        start * limit
      },sort: "created_at:desc", where:{
        status: "published",
        ${bookUUID ? `book: { slug: "${bookUUID}" }` : ''}
      }) {
          slug,
          uuid,
          status,
          name,
          book {
            id,uuid,name,slug
          },
          updated_at,
					created_at
        }
      }`,
    }
  );
};
const getImgInfo = async (url) => {
  if (url.startsWith('http') || url.startsWith('//')) {
    try {
      url = url.startsWith('//') ? `https:${url}` : url;
      // const pathname = nodeUrl.parse(url);
      // const key = Buffer.from('hicdn:' + pathname).toString('base64');
      let _url =
        (url.includes('?') ? url.slice(0, url.indexOf('?')) : url) +
        '?imageInfo';
      _url = new nodeUrl.URL(_url).href;
      const res = await fetch(_url);
      const result = await res.json();
      return { isOk: true, result };
      // console.log('---stat', _url, result);
      // block.data.file.width = result.width;
      // block.data.file.height = result.height;
      // block.data.file.isFirst = i === 0;
      // if (
      //   url.startsWith('https://image.hicc.pro') ||
      //   url.startsWith('http://image.hicc.pro')
      // ) {
      //   block.data.file.sourceType = 'qiniu';
      // }
    } catch (error) {
      console.log('--get img info--', error);
    }
  }
  return { isOk: false };
};
const findIframeTagInMd = (md, template) => {
  //	const reg = new RegExp(`(?<=\\[iframe[^\\]]*?template=“${template}”[^\\]]*?\\])(.*?)(?=\\[\\/iframe\\])`,'sg')
  const reg = new RegExp(
    `\\[iframe[^\\]]*?template=“${template}”[^\\]]*?\\](.*?)\\[\\/iframe\\]`,
    'sg'
  );
  return md.match(reg)?.reduce((pre, stWithTag) => {
    console.log('stWithTag:', stWithTag);
    const mdContent = stWithTag.match(
      /(?<=\[iframe[^\]]*\])(.*?)(?=\[\/iframe\])/gs
    )?.[0];
    console.log('md:\n', mdContent);
    const code = stWithTag.match(
      /(?<=\[iframe[^\]]*\]\n```\w*?\n)(.*?)(?=```\n\[\/iframe\])/gs
    )?.[0];
    console.log('code:\n', code);
    pre.push({
      stWithTag,
      mdContent,
      code,
    });
    return pre;
  }, []);
};
const handleMdIframeTag = (md) => {
  let _content = md;
  [
    [
      'threejs-init',
      (md, matchInfos) => {
        let _content = md;
        console.log('--x', matchInfos);
        matchInfos?.forEach(({ stWithTag, mdContent, code }) => {
          const html = (code) => {
            const html = `<!DOCTYPE html>
          <html>
          <head>
              <title>Example 01.02 - First Scene</title>
              <meta charset='UTF-8' />
              <script src='${SiteUrl}/assets/threejs/libs/three/three.js'></script>
              <script src='${SiteUrl}/assets/threejs/libs/three/controls/TrackballControls.js'></script>
              <link rel='stylesheet' href='${SiteUrl}/assets/threejs/css/default.css'>
          </head>
          <body>
              <!-- Div which will hold the Output -->
              <div id='webgl-output'></div>
              <script>
                  (function () {
                    ${
                      code
                      // .replace(/\/\/.+\n/g, '')
                      // .replace(/\/\*\*[^\/]+\//g, ';')
                      // .replace(/\n/g, '')
                      // .replace(/"/g, `'`)
                    }
                  })();
              </script>
          </body>
          </html>
        
          `;
            const buff = Buffer.from(html, 'utf-8');
            // encode buffer as Base64
            return buff.toString('base64');
          };
          const _mdContent = `${mdContent || ''}\n\n<div class="iframe-box">
          <iframe class="Threejs-iframe" sandbox="allow-scripts" src="data:text/html;base64,${html(
            code
          )}" ></iframe></div>
        `;
          _content = _content.replace(stWithTag, _mdContent);
        });
        return _content;
      },
    ],
    [
      'threejs-init2',
      (md, matchInfos) => {
        let _content = md;
        console.log('--x', matchInfos);
        matchInfos?.forEach(({ stWithTag, mdContent, code }) => {
          const html = (code) => {
            const html = `<!DOCTYPE html>
          <html>
          <head>
              <title>Example 01.02 - First Scene</title>
              <meta charset='UTF-8' />
              <script src='${SiteUrl}/assets/threejs/libs/three/three.js'></script>
              <script src='${SiteUrl}/assets/threejs/libs/three/controls/TrackballControls.js'></script>
              <script src="${SiteUrl}/assets/threejs/libs/util/Stats.js"></script>
              <script src="${SiteUrl}/assets/threejs/src/js/util.js"></script>
              <link rel='stylesheet' href='${SiteUrl}/assets/threejs/css/default.css'>
          </head>
          <body>
              <!-- Div which will hold the Output -->
              <div id='webgl-output'></div>
              <script>
                  (function () {
                    // contains the code for this example
                    init();
                    ${
                      code
                      // .replace(/\/\/.+\n/g, '')
                      // .replace(/\/\*\*[^\/]+\//g, ';')
                      // .replace(/\n/g, '')
                      // .replace(/"/g, `'`)
                    }
                  })();
              </script>
          </body>
          </html>
        
          `;
            const buff = Buffer.from(html, 'utf-8');
            // encode buffer as Base64
            return buff.toString('base64');
          };
          const _mdContent = `${mdContent || ''}\n\n<div class="iframe-box">
          <iframe class="Threejs-iframe" data-template="threejs-init2" sandbox="allow-scripts" src="data:text/html;base64,${html(
            code
          )}" ></iframe></div>
        `;
          _content = _content.replace(stWithTag, _mdContent);
        });
        return _content;
      },
    ],
    [
      'threejs-gui',
      (md, matchInfos) => {
        let _content = md;
        // console.log('--x', matchInfos);
        matchInfos?.forEach(({ stWithTag, mdContent, code }) => {
          const html = (code) => {
            const html = `<!DOCTYPE html>
          <html>
          <head>
              <title>Example 01.02 - First Scene</title>
              <meta charset='UTF-8' />
              <script src='${SiteUrl}/assets/threejs/libs/three/three.js'></script>
              <script src='${SiteUrl}/assets/threejs/libs/three/controls/TrackballControls.js'></script>
              <script src="${SiteUrl}/assets/threejs/libs/util/Stats.js"></script>
              <script type="text/javascript" src="${SiteUrl}/assets/threejs/libs/util/dat.gui.js"></script>
              <script src="${SiteUrl}/assets/threejs/src/js/util.js"></script>
              <link rel='stylesheet' href='${SiteUrl}/assets/threejs/css/default.css'>
          </head>
          <body>
              <!-- Div which will hold the Output -->
              <div id='webgl-output'></div>
              <script>
                  (function () {
                    // contains the code for this example
                    init();
                    ${
                      code
                      // .replace(/\/\/.+\n/g, '')
                      // .replace(/\/\*\*[^\/]+\//g, ';')
                      // .replace(/\n/g, '')
                      // .replace(/"/g, `'`)
                    }
                  })();
              </script>
          </body>
          </html>
          `;
            const buff = Buffer.from(html, 'utf-8');
            // encode buffer as Base64
            return buff.toString('base64');
          };
          const _mdContent = `${mdContent || ''}\n\n<div class="iframe-box">
          <iframe class="Threejs-iframe" data-template="threejs-init2" sandbox="allow-scripts" src="data:text/html;base64,${html(
            code
          )}" ></iframe></div>
        `;
          _content = _content.replace(stWithTag, _mdContent);
        });
        return _content;
      },
    ],
  ].forEach(([template, fn]) => {
    _content = fn(_content, findIframeTagInMd(_content, template));
  });
  // console.log('--handleMdIframeTag end', _content);
  return _content;
};
const handleMdContent = async (md) => {
  return handleMdIframeTag(`## toc\n# Intro\n${md || ''}`);
};
export const getPostDetail = async (postUUID) => {
  const posts = await apiRequestV2WithThrow(
    `/posts`,
    'GET',
    {
      _where: { _or: [{ uuid: postUUID }, { slug: postUUID }] },
      _limit: 1,
    },
    {}
  );

  // console.log('--getPostDetail',posts)

  const post = toJsonObject(posts.data?.[0] ?? null, true);
  // console.log('---post info ---', post, posts);
  let featureImage = {};
  if (post?.meta?.featureImage?.url) {
    if (post.meta.featureImage.formats?.medium) {
      featureImage = post.meta.featureImage.formats.medium;
    } else {
      const { isOk, result } = await getImgInfo(post.meta.featureImage.url);
      featureImage = {
        url: post.meta.featureImage.url,
        ...(isOk && result),
      };
    }
  }
  const base = {
    adminUrl: AdminUrl,
    siteUrl: SiteUrl,
    defaultSiteFeatureImage: DefaultSiteFeatureImage,
    featureImage,
  };
  if (post && typeof post.rawContent === 'string' && post.rawContent) {
    // post.html = mdToHTML(post.rawContent);
    // const md = (post.rawContent || '') + '## toc\n';
    post.rawContent = await handleMdContent(post.rawContent || '');
    // const mdHtml = await markdownToHtml(md);
    // delete post.rawContent;
    return {
      props: {
        post,
        error: posts.error ?? '',
        ...base,
        featureImage: base.featureImage.url
          ? base.featureImage
          : DefaultSiteFeatureImage,
        isMd: true,
        // md,
      },
      revalidate: 10,
    };
  }
  const editorJsData = post?.content?.data ?? {};

  // 处理图片
  for (let i = 0; i < editorJsData.blocks.length; i++) {
    const block = editorJsData.blocks[i];
    if (block.type === 'image') {
      // console.log('--file', block.data.file.url);
      let url = block.data.file.url;
      const { isOk, result } = await getImgInfo(url);
      if (false) {
        // 使用 getPlaiceholder 似乎会导致页面白屏。cvm 性能太低
        const { isOk, result } = (async () => {
          if (!url.startsWith('http') && url.startsWith('//')) {
            return { isOk: false };
          }
          try {
            const _url = url.startsWith('//') ? `https:${url}` : url;
            const { base64, img } = await getPlaiceholder(_url);
            block.data.file.imageProps = {
              ...img,
              blurDataURL: base64,
            };
            // console.log(
            //   '---get placiceholder props ',
            //   block.data.file.imageProps
            // );
            return { isOk: true, result: block.data.file.imageProps };
          } catch (error) {
            console.log('---get placiceholder error ', error);
            return { isOk: false };
          }
        })();
      }
      // const { isOk, result } = await getImgInfo(url);
      if (!base.featureImage.url) {
        base.featureImage = {
          url,
          ...(isOk && result),
        };
      }
      if (isOk) {
        block.data.file.width = result.width;
        block.data.file.height = result.height;
        block.data.file.imageProps = result;
        block.data.file.isFirst = i === 0;
        if (
          url.startsWith('https://image.hicc.pro') ||
          url.startsWith('http://image.hicc.pro')
        ) {
          block.data.file.sourceType = 'qiniu';
        }
      }
    }
    if (block.type === 'paragraph') {
      let text = block.data?.text ?? '';
      if (text.length > 300) {
        text = text.slice(0, 300);
      }
      if (!post.meta?.metaDescription) {
        if (!post.meta) {
          post.meta = {};
        }
        post.meta.metaDescription = text;
      }
    }
    if (block.type === 'code') {
      let lan = block.data.language ?? 'javascript';
      lan = lan === 'TypeScript Jsx' ? 'tsx' : lan;
      lan = lan === 'Javascript Jsx' ? 'jsx' : lan;
      // const md = '```' + lan.toLowerCase() + '\n' + block.data.text + '\n````';
      // block.data.text = md;
      // block.data.html = await markdownToHtml(md);
    }
    if (block.type === 'table') {
      const [tHead, ...tBody] = block.data.content ?? [];
      let body = (tBody ?? []).map((col, colIndex) => {
        return col.map((item, rowIndex) => {
          const content = item;
          let rowSpan = 1;
          let colSpan = 1;
          if (item) {
            // check row
            for (let i = colIndex + 1; i < tBody.length; i++) {
              // console.log('-row', i, rowIndex);
              if (!tBody[i]?.[rowIndex]) {
                rowSpan++;
              } else {
                break;
              }
            }

            // check col
            for (let i = rowIndex + 1; i < col.length; i++) {
              // console.log('-col', i, rowIndex);
              if (!tBody[colIndex]?.[i]) {
                colSpan++;
              } else {
                break;
              }
            }
          }

          return { content, rowSpan, colSpan };
        });
      });
      block.data.enhancedContent = [tHead, ...body];
      // console.log('--table ', block.data.enhancedContent);
    }
  }

  // console.log('---editor', editorJsData);
  // if (
  //   post?.book.uuid !== params?.bookUUID &&
  //   post?.book.slug !== params?.bookUUID
  // ) {
  //   return {
  //     props: {
  //       error: 'NOT FOUNT POST',
  //     },
  //   };
  // }
  return {
    props: {
      post,
      isMd: false,
      error: posts.error ?? '',
      ...base,
      featureImage: base.featureImage.url
        ? base.featureImage
        : DefaultSiteFeatureImage,
    },
    revalidate: 10,
  };
};

export const getPostsWithGraphql = (start = 0, limit = 50) => {
  // const adminUrl = process.env.Backend;
  return apiRequestV2WithThrow(
    `graphql`,
    'POST',
    {},
    {
      query: `query {
        posts(limit: ${limit},start:${
        start * start
      },sort: "created_at:desc", where:{status: "published"}) {
          slug,
          uuid,
          status,
          name,
          book {
            id,uuid,name,slug
          },
          meta {
            metaDescription,
          },
          updated_at
        }
      }`,
    }
  );
};
