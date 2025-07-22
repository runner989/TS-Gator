import { getCurrentUser } from '../lib/user';
import {addFeed, deleteFeedFollow, getFeeds, createFeedFollow, getFeedFollowsForUser, getFeedByUrl} from '../lib/db/queries/feeds';
import {findUserByName, findUserByUserId} from '../lib/db/queries/users';
import { User, UserCommandHandler } from '../types/command';
import { FeedFollow } from "../types/feed";

export const handlerAddFeed: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    if (!cmdName || cmdName !== 'addfeed') {
        console.log("Not addfeed command");
        return;
    }
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <name> <url>`);
    }
    
    const [name, url] = args;
    
    const feed = await addFeed(url, name, user.id);
    console.log(`Feed added successfully!`);
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
};

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName !== 'feeds') {
        console.log("Not feeds command");
        return;
    }

    const allFeeds = await getFeeds();
    
    if (allFeeds.length === 0) {
        console.log("No feeds found");
        return;
    }
    
    for (const feed of allFeeds) {
        const user = await findUserByUserId(feed.userId);
        console.log(`* ${feed.name} - ${feed.url} - ${user.name}`);
    }
}

export const handlerFollowFeed: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    if (!cmdName || (cmdName !== 'follow')) {
        console.log("Not follow command");
        return;
    }
    
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }

    const url = args[0];

    const [feed] = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Feed with URL ${url} not found`);
    }

    const feedFollow = await createFeedFollow(user.id, feed.id);
    console.log(`Following ${feedFollow.feedName}`);
};

export const handlerFeedFollowing: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    const feedFollows = await getFeedFollowsForUser(user.id);

    if (feedFollows.length === 0) {
        console.log("Not following any feeds");
        return;
    }

    for (const follow of feedFollows) {
        console.log(`* ${follow.feedName}`);
    }
};

export const handlerUnfollowFeed: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    if (args.length == 0) {
        throw new Error("command unfollow requires a feed URL");
    }

    const url = args[0];
    // const config = readConfig();
    try {
        const currentUser = await findUserByName(user.name);
        if (!currentUser) {
            throw new Error(`User ${user.name} not found. Please register/login first.`);
        }
        console.log(`Unfollowing feed ${url}`);
        const feedResult = await getFeedByUrl(url);
        if (!feedResult || feedResult.length === 0) {
            throw new Error(`Feed ${url} not found.`);
        }
        const feed = feedResult[0];
        const feedFollows = await getFeedFollowsForUser(currentUser.id);
        const isFollowing = feedFollows.some((following: any) => following.feedUrl === url);
        if (!isFollowing) {
            throw new Error(`You are not following feed ${url}.`);
        }
        // const result =
        await deleteFeedFollow(feed.id, currentUser.id);
        // if (!result || result.length === 0) {
        //     throw new Error(`Failed to unfollow feed ${url}.`);
        // }
        console.log(`Feed ${url} unfollowed successfully`);
    } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Failed to unfollow feed'}`);
        process.exit(1);
    }
};