import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  
  // Sort posts by publish date in descending order
  const sortedPosts = blog.sort((a, b) => 
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
  
  return rss({
    title: 'Danny Garcia | Blog',
    description: 'Danny Garcia, senior frontend engineer at Shopify. Building nice things for good people.',
    site: context.site,
    items: sortedPosts.map((post) => {
      const publishDate = post.data.publishDate;
      const year = publishDate.getFullYear();
      const month = String(publishDate.getMonth() + 1).padStart(2, '0');
      const baseSlug = post.slug.replace(/^\d{4}-\d{2}-/, '');
      const postPath = `${year}/${month}/${baseSlug}`;
      
      return {
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.data.description,
        link: `/${postPath}`,
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
