import { db } from "..";
import { desc, asc, eq, inArray, ilike, and, gte, lte, count } from "drizzle-orm";
import { posts, feed_follows, feeds } from "../schema";

export interface PostsQueryOptions {
    limit?: number;
    offset?: number;
    sortBy?: 'published_at' | 'created_at' | 'title';
    sortOrder?: 'asc' | 'desc';
    feedName?: string;
    titleSearch?: string;
    publishedAfter?: Date;
    publishedBefore?: Date;
}

export interface PostsQueryResult {
    posts: any[];
    totalCount: number;
    hasMore: boolean;
}

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

export async function getPostsForUser(userId: string, options: PostsQueryOptions = {}): Promise<PostsQueryResult> {
    try {
        const {
            limit = 10,
            offset = 0,
            sortBy = 'published_at',
            sortOrder = 'desc',
            feedName,
            titleSearch,
            publishedAfter,
            publishedBefore
        } = options;

        // First get all feeds the user follows
        const userFeedFollows = await db
            .select({ feedId: feed_follows.feed_id })
            .from(feed_follows)
            .where(eq(feed_follows.user_id, userId));
        
        if (userFeedFollows.length === 0) {
            return { posts: [], totalCount: 0, hasMore: false };
        }
        
        const feedIds = userFeedFollows.map(ff => ff.feedId);
        
        // Build where conditions
        const conditions = [inArray(posts.feedId, feedIds)];
        
        if (feedName) {
            conditions.push(ilike(feeds.name, `%${feedName}%`));
        }
        
        if (titleSearch) {
            conditions.push(ilike(posts.title, `%${titleSearch}%`));
        }
        
        if (publishedAfter) {
            conditions.push(gte(posts.publishedAt, publishedAfter));
        }
        
        if (publishedBefore) {
            conditions.push(lte(posts.publishedAt, publishedBefore));
        }
        
        const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
        
        // Get total count for pagination
        const [{ totalCount }] = await db
            .select({ totalCount: count() })
            .from(posts)
            .innerJoin(feeds, eq(posts.feedId, feeds.id))
            .where(whereClause);
        
        // Determine sort order
        const sortColumn = sortBy === 'published_at' ? posts.publishedAt :
                          sortBy === 'created_at' ? posts.createdAt :
                          posts.title;
        
        const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
        
        // Add secondary sort by created_at if sorting by published_at or title
        const orderByClauses = sortBy === 'created_at' ? [orderBy] : [orderBy, desc(posts.createdAt)];
        
        // Get posts with pagination
        const userPosts = await db
            .select({
                id: posts.id,
                title: posts.title,
                url: posts.url,
                description: posts.description,
                publishedAt: posts.publishedAt,
                createdAt: posts.createdAt,
                feedId: posts.feedId,
                feedName: feeds.name,
                feedUrl: feeds.url
            })
            .from(posts)
            .innerJoin(feeds, eq(posts.feedId, feeds.id))
            .where(whereClause)
            .orderBy(...orderByClauses)
            .limit(limit)
            .offset(offset);
        
        const hasMore = offset + limit < totalCount;
        
        return {
            posts: userPosts,
            totalCount,
            hasMore
        };
    } catch (error) {
        console.error('Error getting posts for user:', error);
        throw error;
    }
}