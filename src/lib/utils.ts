export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    
    if (!match) {
        throw new Error(`Invalid duration format: ${durationStr}. Expected format: <number><unit> (e.g., 1s, 5m, 1h)`);
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
        case 'ms':
            return value;
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}

export function formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    
    if (hours > 0) {
        return `${hours}h${minutes}m${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export function parsePublishedDate(dateString: string | undefined): Date | null {
    if (!dateString) {
        return null;
    }
    
    try {
        // Try parsing the date string
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date format: ${dateString}`);
            return null;
        }
        
        return date;
    } catch (error) {
        console.warn(`Error parsing date: ${dateString}`, error);
        return null;
    }
}

export interface BrowseOptions {
    limit?: number;
    page?: number;
    sortBy?: 'published_at' | 'created_at' | 'title';
    sortOrder?: 'asc' | 'desc';
    feedName?: string;
    titleSearch?: string;
    publishedAfter?: Date;
    publishedBefore?: Date;
}

export function parseBrowseArgs(args: string[]): BrowseOptions {
    const options: BrowseOptions = {};
    
    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];
        
        switch (arg) {
            case '--limit':
            case '-l':
                if (nextArg && !isNaN(parseInt(nextArg))) {
                    options.limit = parseInt(nextArg);
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--page':
            case '-p':
                if (nextArg && !isNaN(parseInt(nextArg))) {
                    options.page = parseInt(nextArg);
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--sort':
            case '-s':
                if (nextArg && ['published_at', 'created_at', 'title'].includes(nextArg)) {
                    options.sortBy = nextArg as 'published_at' | 'created_at' | 'title';
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--order':
            case '-o':
                if (nextArg && ['asc', 'desc'].includes(nextArg)) {
                    options.sortOrder = nextArg as 'asc' | 'desc';
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--feed':
            case '-f':
                if (nextArg) {
                    options.feedName = nextArg;
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--search':
            case '-t':
                if (nextArg) {
                    options.titleSearch = nextArg;
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--after':
                if (nextArg) {
                    const date = parsePublishedDate(nextArg);
                    if (date) {
                        options.publishedAfter = date;
                    }
                    i++; // Skip next arg since we used it
                }
                break;
                
            case '--before':
                if (nextArg) {
                    const date = parsePublishedDate(nextArg);
                    if (date) {
                        options.publishedBefore = date;
                    }
                    i++; // Skip next arg since we used it
                }
                break;
                
            default:
                // If it's just a number without a flag, treat it as limit (backward compatibility)
                if (!isNaN(parseInt(arg)) && !options.limit) {
                    options.limit = parseInt(arg);
                }
                break;
        }
    }
    
    return options;
}

export function showBrowseHelp(): void {
    console.log(`
Browse Command Usage:
  browse [options]

Options:
  --limit, -l <number>     Number of posts to show (default: 2)
  --page, -p <number>      Page number (default: 1)
  --sort, -s <field>       Sort by: published_at, created_at, title (default: published_at)
  --order, -o <order>      Sort order: asc, desc (default: desc)
  --feed, -f <name>        Filter by feed name (partial match)
  --search, -t <text>      Search in post titles (partial match)
  --after <date>           Show posts published after date (YYYY-MM-DD)
  --before <date>          Show posts published before date (YYYY-MM-DD)
  --help, -h               Show this help message

Examples:
  browse --limit 5                           # Show 5 latest posts
  browse --page 2 --limit 10                 # Show page 2 with 10 posts per page
  browse --sort title --order asc            # Sort by title alphabetically
  browse --feed "Hacker News"                # Show posts from feeds with "Hacker News" in name
  browse --search "javascript"               # Search for posts with "javascript" in title
  browse --after 2024-01-01                  # Show posts published after Jan 1, 2024
  browse 5                                   # Backward compatible: show 5 posts
`);
}