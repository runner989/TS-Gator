import { fetchFeed } from '../lib/feed';

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName !== 'agg') {
        console.log("Not agg command");
        return;
    }

    try {
        const feed = await fetchFeed('https://www.wagslane.dev/index.xml');
        console.log(JSON.stringify(feed, null, 2));
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw error;
    }
}