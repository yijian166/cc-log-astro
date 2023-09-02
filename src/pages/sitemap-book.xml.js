import { SITE_TITLE, SITE_DESCRIPTION } from '../config';
import {
  PaginationLimit,
  apiRequestV2,
  SiteUrl,
  getPostCountNoFail,
} from '../services';
import sitemap from 'sitemap';
import { createGzip } from 'zlib';
import { Readable, Transform } from 'stream';
export const get = async () => {
  // res.setHeader('Content-Type', 'application/xml');
  // res.setHeader('Content-Encoding', 'gzip');
  const BlogUrl = SiteUrl;
  // const adminUrl = process.env.Backend;
  try {
    const smStream = new sitemap.SitemapStream({
      hostname: BlogUrl,
    });
    let page = 0;
    const contentStream = new Readable({
      objectMode: true,
      async read(size) {
        let all = [];
        if (page === 0) {
          const count = await getPostCountNoFail();
          // console.log('- all',count,Math.ceil(count / PaginationLimit))
          new Array(Math.max(1, Math.ceil(count / PaginationLimit)))
            .fill(1)
            .forEach((_, i) => {
              // this.push({__url:'/articles', page: i + 1});
              all.push({ __url: '/articles', page: i + 1 });
            });
        }
        const result = await apiRequestV2(`/books`, 'GET', {
          _start: PaginationLimit * Math.max(page++ - 1, 0),
          _limit: PaginationLimit,
          _sort: 'created_at:desc',
        });

        // console.log('-----111', result);
        if (result.error || !Array.isArray(result.data)) {
          this.push(null);
        } else {
          let list = [];
          for (const item of result.data) {
            const count = await getPostCountNoFail(item.id);
            // item.count = count;
            new Array(Math.max(1, Math.ceil(count / PaginationLimit)))
              .fill(1)
              .forEach((_, i) => {
                list.push({
                  ...item,
                  page: i + 1,
                });
                // console.log('--book item',item.slug, i + 1)
                // this.push(item);
              });
          }

          all.concat(list).forEach((item) => {
            this.push(item);
          });
          if (result.data.length < PaginationLimit) {
            this.push(null);
          }
        }
      },
    });

    const trans = new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        // console.log('--11-',data)
        let link = data.__url || `/p/${data.slug || data.uuid}`;
        if (data.page && data.page > 1) {
          link = `${link}/page/${data.page}`;
        }
        callback(null, link);
      },
    });

    const pipeline = contentStream
      .pipe(trans)
      .pipe(smStream)
      .pipe(createGzip());
    // smStream.write('/sitemap-book.xml');
    // smStream.write('/sitemap-post.xml');
    // smStream.end();
    // cache the response
    // sitemap.streamToPromise(pipeline).then((sm) => (sitemap = sm));
    // stream write the response
    // pipeline.pipe(res).on('error', (e) => {
    //   throw e;
    // });
    return new Response(pipeline, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Encoding': 'gzip',
      },
    });
  } catch (e) {
    console.error(e);
    // res.status(500).end();
    // res.statusCode = 200;
    // res.end();
    return new Response(null, {
      status: 500,
      statusText: 'Internal error',
    });
  }
};
