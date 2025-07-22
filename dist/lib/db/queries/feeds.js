import { db } from "..";
import { and, eq } from "drizzle-orm";
import { feeds, feed_follows } from "../schema";
export async function addFeed(url, name, userId) {
    const [result] = await db
        .insert(feeds)
        .values({ url: url, name: name, userId: userId })
        .returning();
    try {
        await createFeedFollow(userId, result.id);
    }
    catch (error) {
        // Silently continue if follow already exists
    }
    return result;
}
export async function printFeed(url, name, userId) {
    const result = await db.select().from(feeds).where(and(eq(feeds.url, url), eq(feeds.name, name), eq(feeds.userId, userId)));
    console.log(result);
}
export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}
export async function createFeedFollow(userId, feedId) {
    try {
        const [feed] = await db.select().from(feeds).where(eq(feeds.id, feedId));
        if (!feed) {
            throw new Error(`Feed with ID ${feedId} not found`);
        }
        const [inserted] = await db
            .insert(feed_follows)
            .values({ user_id: userId, feed_id: feedId })
            .returning();
        const [result] = await db
            .select({
            id: feed_follows.id,
            createdAt: feed_follows.createdAt,
            updatedAt: feed_follows.updatedAt,
            feedName: feeds.name
        })
            .from(feed_follows)
            .where(eq(feed_follows.id, inserted.id))
            .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id));
        return result;
    }
    catch (error) {
        if (error.message.includes('duplicate key value')) {
            throw new Error('You are already following this feed');
        }
        throw error;
    }
}
export async function getFeedByUrl(url) {
    const result = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}
export async function getFeedFollowsForUser(userId) {
    const result = await db
        .select({
        id: feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        feedName: feeds.name,
        feedUrl: feeds.url
    })
        .from(feed_follows)
        .where(eq(feed_follows.user_id, userId))
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id));
    return result;
}
