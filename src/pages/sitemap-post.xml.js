import { SITE_TITLE, SITE_DESCRIPTION } from '../config';
import {
  apiRequestV2WithThrow,
  PaginationLimit,
  getPostsWithGraphql,
  AdminUrl,
  toJsonObject,
  SiteUrl,
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
    const postStream = new Readable({
      objectMode: true,
      async read(size) {
        // const result = await apiRequestV2(`${adminUrl}/posts`, 'GET', {
        //   _start: PaginationLimit * Math.max(page++ - 1, 0),
        //   _limit: PaginationLimit,
        //   _sort: 'created_at:desc',
        //   _populate: [
        //     'name',
        //     'book',
        //     'created_at',
        //     'updated_at',
        //     'id',
        //     'slug',
        //     'uuid',
        //   ],
        // });
        const result = await getPostsWithGraphql(page++, PaginationLimit);
        // console.log('-----111', page, result);
        if (result.error || !Array.isArray(result.data.posts)) {
          this.push(null);
        } else {
          result.data.posts.forEach((item) => {
            this.push(item);
          });
          if (result.data.posts.length < PaginationLimit) {
            this.push(null);
          }
        }
      },
    });

    const trans = new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(null, {
          url: `/p/${data.book.slug || data.book.uuid}/${
            data.slug || data.uuid
          }`,
          changefreq: 'daily',
          priority: 1,
          lastmod: new Date(data.updated_at),
        });
      },
    });

    const pipeline = postStream.pipe(trans).pipe(smStream).pipe(createGzip());
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
