import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().transform((d) => new Date(d)),
    published: z.boolean().default(true),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { blog };

