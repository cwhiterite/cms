import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Select one or more tags for this post',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Design', value: 'Design'},
          {title: 'UI/UX', value: 'UI/UX'},
          {title: '3D', value: '3D'},
          {title: 'Photography', value: 'Photography'},
          {title: 'Illustration', value: 'Illustration'},
          {title: 'Architecture', value: 'Architecture'},
        ],
      },
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image (Sanity CDN)',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Secondary Images (Sanity CDN)',
      description: 'Upload 1–10 images directly to Sanity CDN (drag & drop or browse; no R2 needed)',
      type: 'array',
      options: {
        layout: 'grid',
      },
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'alt',
              media: 'asset',
            },
            prepare({title, subtitle, media}) {
              return {
                title: title || subtitle || 'Image',
                subtitle: title ? subtitle : undefined,
                media,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: 'r2Gallery',
      title: 'High-Res Gallery Keys (Cloudflare R2)',
      description: 'Object keys/paths in your R2 bucket (e.g., posts/2026/neon-study/01.jpg)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'r2GalleryItem',
          fields: [
            defineField({
              name: 'r2Key',
              title: 'R2 Object Key',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'r2Key',
              subtitle: 'caption',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tags: 'tags',
      category: 'category',
      media: 'coverImage',
    },
    prepare({title, tags, category, media}) {
      const tagSubtitle = Array.isArray(tags) && tags.length > 0 ? tags.join(', ') : category
      return {
        title,
        subtitle: tagSubtitle,
        media,
      }
    },
  },
})

