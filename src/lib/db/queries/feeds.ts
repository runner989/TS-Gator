import { db } from "..";
import { and, eq, sql } from "drizzle-orm";
import {feeds, feed_follows, users} from "../schema";
import { fetchFeed } from "../../feed";
import { createPost } from "./posts";
import { parsePublishedDate } from "../../utils";

export async function addFeed(url: string, name: string, userId: string): Promise<any> {
    const [result] = await db
        .insert(feeds)
        .values({ url: url, name: name, userId: userId })
        .returning();
    try {
        await createFeedFollow(userId, result.id);
    } catch (error) {
        // Silently continue if follow already exists
    }
    return result;
}

export async function printFeed(url: string, name: string, userId: string): Promise<void> {
    const result = await db.select().from(feeds).where(and(eq(feeds.url, url), eq(feeds.name, name), eq(feeds.userId, userId)));
    console.log(result);
}

export async function getFeeds(): Promise<any> {
    const result = await db.select().from(feeds);
    return result;
}

export async function createFeedFollow(userId: string, feedId: string): Promise<any> {
    try {
        const [feed] = await db.select().from(feeds).where(eq(feeds.id, feedId));
        if (!feed) {
            throw new Error(`Feed with ID ${feedId} not found`);
        }
        const [inserted] = await db
            .insert(feed_follows)
            .values({user_id: userId, feed_id: feedId})
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
    } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key value')) {
            throw new Error('You are already following this feed');
        }
        throw error;
    }

}

export async function getFeedByUrl(url: string): Promise<any> {
    const result = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeedFollowsForUser(userId: string): Promise<any> {
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

export async function deleteFeedFollow(feedId: string, userId: string): Promise<void> {
    await db.delete(feed_follows).where(and(eq(feed_follows.feed_id, feedId), eq(feed_follows.user_id, userId)))
}

export async function markFeedFetched(feedId: string): Promise<void> {
    const now = new Date();
    await db
        .update(feeds)
        .set({ 
            lastFetchedAt: now,
            updatedAt: now 
        })
        .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch(): Promise<any> {
    const [result] = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
        .limit(1);
    return result;
}

export async function scrapeFeeds(): Promise<void> {
    const feed = await getNextFeedToFetch();
    
    if (!feed) {
        console.log("No feeds found to scrape");
        return;
    }
    
    try {
        console.log(`Fetching feed: ${feed.name} (${feed.url})`);
        
        await markFeedFetched(feed.id);
        
        const rssData = await fetchFeed(feed.url);
        
        if (rssData.channel.item && rssData.channel.item.length > 0) {
            console.log(`Found ${rssData.channel.item.length} posts in ${feed.name}`);
            
            let savedCount = 0;
            for (const item of rssData.channel.item) {
                try {
                    const publishedAt = parsePublishedDate(item.pubDate);
                    const post = await createPost(
                        item.title,
                        item.link,
                        feed.id,
                        item.description,
                        publishedAt
                    );
                    
                    if (post) {
                        savedCount++;
                    }
                } catch (error) {
                    // Likely a duplicate URL, which is fine
                    if (error instanceof Error && !error.message.includes('duplicate')) {
                        console.error(`Error saving post: ${error.message}`);
                    }
                }
            }
            
            console.log(`Saved ${savedCount} new posts from ${feed.name}`);
        } else {
            console.log(`No posts found in ${feed.name}`);
        }
    } catch (error) {
        console.error(`Error fetching feed ${feed.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}