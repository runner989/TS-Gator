import { db } from "..";
import { desc, eq, inArray } from "drizzle-orm";
import { posts, feed_follows, feeds } from "../schema";

export async function createPost(
    title: string,
    url: string,
    feedId: string,
    description?: string | null,
    publishedAt?: Date | null
): Promise<any> {
    try {
        const [result] = await db
            .insert(posts)
            .values({ 
                title,
                url,
                feedId,
                description: description || null,
                publishedAt: publishedAt || null
            })
            .onConflictDoNothing({ target: posts.url })
            .returning();
        
        return result;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

export async function getPostsForUser(userId: string, limit: number = 10): Promise<any[]> {
    try {
        // First get all feeds the user follows
        const userFeedFollows = await db
            .select({ feedId: feed_follows.feed_id })
            .from(feed_follows)
            .where(eq(feed_follows.user_id, userId));
        
        if (userFeedFollows.length === 0) {
            return [];
        }
        
        const feedIds = userFeedFollows.map(ff => ff.feedId);
        
        // Then get posts from those feeds
        const userPosts = await db
            .select({
                id: posts.id,
                title: posts.title,
                url: posts.url,
                description: posts.description,
                publishedAt: posts.publishedAt,
                feedId: posts.feedId,
                feedName: feeds.name,
                feedUrl: feeds.url
            })
            .from(posts)
            .innerJoin(feeds, eq(posts.feedId, feeds.id))
            .where(inArray(posts.feedId, feedIds))
            .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
            .limit(limit);
        
        return userPosts;
    } catch (error) {
        console.error('Error getting posts for user:', error);
        throw error;
    }
}