import { User, UserCommandHandler } from '../types/command';
import { getPostsForUser } from '../lib/db/queries/posts';

export const handlerBrowse: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    if (!cmdName || cmdName !== 'browse') {
        console.log("Not browse command");
        return;
    }

    // Parse the limit argument if provided
    let limit = 2; // Default limit
    if (args.length > 0) {
        const parsedLimit = parseInt(args[0], 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limit = parsedLimit;
        } else {
            throw new Error(`Invalid limit: ${args[0]}. Please provide a positive number.`);
        }
    }

    try {
        const posts = await getPostsForUser(user.id, limit);
        
        if (posts.length === 0) {
            console.log("No posts found. Make sure you're following some feeds!");
            return;
        }

        console.log(`Found ${posts.length} posts:\n`);
        
        for (const post of posts) {
            console.log(`Title: ${post.title}`);
            console.log(`URL: ${post.url}`);
            console.log(`Feed: ${post.feedName}`);
            
            if (post.publishedAt) {
                const publishedDate = new Date(post.publishedAt);
                console.log(`Published: ${publishedDate.toLocaleString()}`);
            }
            
            if (post.description) {
                // Truncate description to 200 characters for readability
                const truncatedDesc = post.description.length > 200 
                    ? post.description.substring(0, 197) + '...' 
                    : post.description;
                console.log(`Description: ${truncatedDesc}`);
            }
            
            console.log('---'); // Separator between posts
        }
    } catch (error) {
        console.error('Error browsing posts:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
};