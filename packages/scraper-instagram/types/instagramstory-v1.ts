import { z } from 'zod'

export const InstagramStoryArgsSchema = z.object({
    0: z.string()
})
export const InstagramStoryItemSchema = z.object({
    thumbnail: z.string().url(),
    url: z.string().url(),
    type: z.literal('image').or(z.literal('video'))
})
export type InstagramStoryItem = z.infer<typeof InstagramStoryItemSchema>
export const InstagramStorySchema = z.array(InstagramStoryItemSchema)
export type InstagramStory = z.infer<typeof InstagramStorySchema>