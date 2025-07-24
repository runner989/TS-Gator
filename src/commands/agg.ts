import { scrapeFeeds } from '../lib/db/queries/feeds';
import { parseDuration, formatDuration } from '../lib/utils';

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName !== 'agg') {
        console.log("Not agg command");
        return;
    }

    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <time_between_reqs>`);
    }

    const durationStr = args[0];
    
    try {
        const timeBetweenRequests = parseDuration(durationStr);
        const formattedDuration = formatDuration(timeBetweenRequests);
        
        console.log(`Collecting feeds every ${formattedDuration}`);
        
        const handleError = (error: any) => {
            console.error('Error in scrapeFeeds:', error instanceof Error ? error.message : 'Unknown error');
        };
        
        // Run scrapeFeeds immediately
        scrapeFeeds().catch(handleError);
        
        // Set up interval for subsequent runs
        const interval = setInterval(() => {
            scrapeFeeds().catch(handleError);
        }, timeBetweenRequests);
        
        // Handle graceful shutdown
        await new Promise<void>((resolve) => {
            process.on("SIGINT", () => {
                console.log("\nShutting down feed aggregator...");
                clearInterval(interval);
                resolve();
            });
        });
        
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
}