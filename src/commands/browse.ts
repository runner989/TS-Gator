import { User, UserCommandHandler } from '../types/command';
import { getPostsForUser, PostsQueryOptions } from '../lib/db/queries/posts';
import { parseBrowseArgs, showBrowseHelp } from '../lib/utils';
import { PostBrowserTUI, Post } from '../lib/tui';

export const handlerBrowse: UserCommandHandler = async (cmdName: string, user: User, ...args: string[]): Promise<void> => {
    if (!cmdName || cmdName !== 'browse') {
        console.log("Not browse command");
        return;
    }

    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
        showBrowseHelp();
        return;
    }

    try {
        // Parse command line arguments
        const browseOptions = parseBrowseArgs(args);
        
        // If TUI mode is requested, get more posts and launch TUI
        if (browseOptions.tui) {
            const tuiQueryOptions: PostsQueryOptions = {
                limit: 1000, // Get a large number of posts for TUI
                offset: 0,
                sortBy: browseOptions.sortBy || 'published_at',
                sortOrder: browseOptions.sortOrder || 'desc',
                feedName: browseOptions.feedName,
                titleSearch: browseOptions.titleSearch,
                publishedAfter: browseOptions.publishedAfter,
                publishedBefore: browseOptions.publishedBefore
            };

            const result = await getPostsForUser(user.id, tuiQueryOptions);
            
            if (result.posts.length === 0) {
                console.log("No posts found for TUI mode. Make sure you're following some feeds!");
                return;
            }

            // Convert posts to TUI format
            const tuiPosts: Post[] = result.posts.map(post => ({
                id: post.id,
                title: post.title,
                url: post.url,
                description: post.description,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
                createdAt: new Date(post.createdAt),
                feedName: post.feedName,
                feedUrl: post.feedUrl
            }));

            // Launch TUI
            try {
                const tui = new PostBrowserTUI(tuiPosts);
                await tui.run();
            } catch (tuiError) {
                console.error('Failed to launch TUI:', tuiError);
                console.error('Error details:', tuiError instanceof Error ? tuiError.stack : tuiError);
            }
            return;
        }
        
        // Set defaults for regular mode
        const limit = browseOptions.limit || 2;
        const page = browseOptions.page || 1;
        const offset = (page - 1) * limit;
        
        // Build query options
        const queryOptions: PostsQueryOptions = {
            limit,
            offset,
            sortBy: browseOptions.sortBy || 'published_at',
            sortOrder: browseOptions.sortOrder || 'desc',
            feedName: browseOptions.feedName,
            titleSearch: browseOptions.titleSearch,
            publishedAfter: browseOptions.publishedAfter,
            publishedBefore: browseOptions.publishedBefore
        };

        const result = await getPostsForUser(user.id, queryOptions);
        
        if (result.posts.length === 0) {
            if (result.totalCount === 0) {
                console.log("No posts found. Make sure you're following some feeds!");
            } else {
                console.log("No posts found matching your criteria.");
            }
            return;
        }

        // Display header with filtering/sorting info
        console.log(formatBrowseHeader(result, page, limit, queryOptions));
        
        // Display posts
        for (let i = 0; i < result.posts.length; i++) {
            const post = result.posts[i];
            const postNumber = offset + i + 1;
            
            console.log(`\n[${postNumber}] ${post.title}`);
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
            
            if (i < result.posts.length - 1) {
                console.log('---');
            }
        }
        
        // Display pagination info
        console.log(formatPaginationInfo(result, page, limit));
        
    } catch (error) {
        console.error('Error browsing posts:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
};

function formatBrowseHeader(result: any, page: number, limit: number, options: PostsQueryOptions): string {
    let header = `\nShowing ${result.posts.length} of ${result.totalCount} posts`;
    
    if (page > 1 || result.hasMore) {
        header += ` (page ${page})`;
    }
    
    const filters = [];
    if (options.feedName) filters.push(`feed: "${options.feedName}"`);
    if (options.titleSearch) filters.push(`search: "${options.titleSearch}"`);
    if (options.publishedAfter) filters.push(`after: ${options.publishedAfter.toDateString()}`);
    if (options.publishedBefore) filters.push(`before: ${options.publishedBefore.toDateString()}`);
    
    if (filters.length > 0) {
        header += `\nFiltered by: ${filters.join(', ')}`;
    }
    
    if (options.sortBy !== 'published_at' || options.sortOrder !== 'desc') {
        header += `\nSorted by: ${options.sortBy} (${options.sortOrder})`;
    }
    
    return header;
}

function formatPaginationInfo(result: any, page: number, limit: number): string {
    if (result.totalCount <= limit) {
        return ''; // No pagination needed
    }
    
    const totalPages = Math.ceil(result.totalCount / limit);
    let info = `\nPage ${page} of ${totalPages}`;
    
    if (page > 1) {
        info += ` | Previous: --page ${page - 1}`;
    }
    
    if (result.hasMore) {
        info += ` | Next: --page ${page + 1}`;
    }
    
    info += `\nUse --help to see all browsing options`;
    
    return info;
}