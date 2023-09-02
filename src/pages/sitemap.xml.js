import { SITE_TITLE, SITE_DESCRIPTION } from '../config';
import {
  apiRequestV2WithThrow,
  PaginationLimit,
  AdminUrl,
  toJsonObject,
  SiteUrl,
} from '../services';
import sitemap from 'sitemap';
import { createGzip } from 'zlib';
export const get = async () => {
  // res.setHeader('Content-Type', 'application/xml');
  // res.setHeader('Content-Encoding', 'gzip');
  const BlogUrl = SiteUrl;
  // const adminUrl = process.env.Backend;
  try {
    const smStream = new sitemap.SitemapStream({
      hostname: BlogUrl,
    });
    const pipeline = smStream.pipe(createGzip());
    smStream.write('/sitemap-book.xml');
    smStream.write('/sitemap-post.xml');
    smStream.end();
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
