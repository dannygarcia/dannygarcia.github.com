import { defineCollection, z } from 'astro:content';

const DEFAULT_IS_PUBLISHED = true;

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      publishDate: z.date(),
      description: z.string(),
      isPublished: z.boolean().default(DEFAULT_IS_PUBLISHED),
    })
  })
};
