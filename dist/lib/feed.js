import { XMLParser } from 'fast-xml-parser';
export async function fetchFeed(feedURL) {
    const response = await fetch(feedURL, {
        headers: {
            'User-Agent': 'gator'
        }
    });
    const xmlText = await response.text();
    const parser = new XMLParser();
    const parsedData = parser.parse(xmlText);
    if (!parsedData.rss || !parsedData.rss.channel) {
        throw new Error('Invalid RSS feed: missing channel field');
    }
    const channel = parsedData.rss.channel;
    if (!channel.title || !channel.link || !channel.description) {
        throw new Error('Invalid RSS feed: missing required channel metadata');
    }
    let items = [];
    if (channel.item) {
        const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
        items = rawItems
            .filter((item) => item.title && item.link && item.description && item.pubDate)
            .map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate
        }));
    }
    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: items
        }
    };
}
