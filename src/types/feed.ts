import { feeds } from '../lib/db/schema';

export type Feed = typeof feeds.$inferSelect;

export interface FeedFollow {
    id: number;
    userId: number;
    feedId: number;
    feedName: string;
    // Add other properties that exist on your feed follow objects
}