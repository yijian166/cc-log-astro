import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../config';
import {
  apiRequestV2WithThrow,
  PaginationLimit,
  AdminUrl,
  toJsonObject,
  SiteUrl,
	getPostsWithGraphql
} from '../services';
export const get = async () => {

	let has = true
	let page = 0;
	let items = [];
	while(has) {
		const result = await getPostsWithGraphql(page++,PaginationLimit);
		if (result.error || !Array.isArray(result.data.posts)) {
			// this.push(null);
			has = false
		} else {
			result.data.posts.forEach((item) => {
				// this.push(item);
				items.push(item)
			});
			if (result.data.posts.length < PaginationLimit) {
				// this.push(null);
				has = false
			}
		}
	}

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: SiteUrl,
		items: items.map((data) => {
			console.log('--post item',data)
			return {
				link: `${SiteUrl}/p/${data.book.slug || data.book.uuid}/${
					data.slug || data.uuid
				}`,
				title: data.name,
				// changefreq: 'daily',
				// priority: 1,
				pubDate: new Date(data.updated_at),
				...(data.meta?.metaDescription && {
					description:data.meta.metaDescription
				})
			}
		}),//import.meta.glob('./blog/**/*.md'),
	})

}
