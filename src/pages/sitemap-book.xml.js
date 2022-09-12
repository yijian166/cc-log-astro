import { SITE_TITLE, SITE_DESCRIPTION } from '../config';
import {
  apiRequestV2WithThrow,
  PaginationLimit,
  apiRequestV2,
  AdminUrl,
  toJsonObject,
  SiteUrl,
} from '../services';
import sitemap from 'sitemap'
import { createGzip } from 'zlib'
import { Readable , Transform} from 'stream';
export const get = async  () => {
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
        const result = await apiRequestV2(`/books`, 'GET', {
          _start: PaginationLimit * Math.max(page++ - 1, 0),
          _limit: PaginationLimit,
          _sort: 'created_at:desc',
        });
        // console.log('-----111', page);
        if (result.error || !Array.isArray(result.data)) {
          this.push(null);
        } else {
          result.data.forEach((item) => {
            this.push(item);
          });
          if (result.data.length < PaginationLimit) {
            this.push({__url:'/articles'});
            this.push(null);
          }
        }
      },
    });

    const trans = new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(null, data.__url || `/p/${data.slug || data.uuid}`);
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
}