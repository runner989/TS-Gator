import { getCurrentUser } from '../lib/user';
import { addFeed, getFeeds, createFeedFollow, getFeedFollowsForUser, getFeedByUrl } from '../lib/db/queries/feeds';
import { findUserByName, findUserByUserId } from '../lib/db/queries/users';
export async function handlerAddFeed(cmdName, ...args) {
    if (!cmdName || cmdName !== 'addfeed') {
        console.log("Not addfeed command");
        return;
    }
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <name> <url>`);
    }
    const [name, url] = args;
    const currentUserName = await getCurrentUser();
    const currentUser = await findUserByName(currentUserName);
    if (!currentUser) {
        throw new Error('No user currently logged in');
    }
    const feed = await addFeed(url, name, currentUser.id);
    console.log(`Feed added successfully!`);
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
}
export async function handlerFeeds(cmdName, ...args) {
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
export async function handlerFollowFeed(cmdName, ...args) {
    if (!cmdName || (cmdName !== 'follow')) {
        console.log("Not follow command");
        return;
    }
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }
    const url = args[0];
    const currentUserName = await getCurrentUser();
    const currentUser = await findUserByName(currentUserName);
    if (!currentUser) {
        throw new Error('No user currently logged in');
    }
    const [feed] = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Feed with URL ${url} not found`);
    }
    const feedFollow = await createFeedFollow(currentUser.id, feed.id);
    console.log(`Following ${feedFollow.feedName}`);
}
export async function handlerFeedFollowing(cmdName, ...args) {
    const currentUserName = await getCurrentUser();
    const currentUser = await findUserByName(currentUserName);
    if (!currentUser) {
        throw new Error('No user currently logged in');
    }
    const feedFollows = await getFeedFollowsForUser(currentUser.id);
    if (feedFollows.length === 0) {
        console.log("Not following any feeds");
        return;
    }
    for (const follow of feedFollows) {
        console.log(`* ${follow.feedName}`);
    }
    // if (!cmdName || cmdName !== 'following') {
    //     console.log("Not following command");
    //     return;
    // }
    // const currentUserName = await getCurrentUser();
    // const currentUser = await findUserByName(currentUserName);
    // const userId = currentUser.id;
    // const feedFollowing = getFeedFollowsForUser(userId);
    // for (const feed of feedFollowing) {
    //     await printFeed(`* ${feed.url}, ${feed.feedName}, ${feed.userName}`);
    // }
}
