import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});
export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull().unique(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});
export const feed_follows = pgTable('feed_follower', {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
    feed_id: uuid('feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
}, (t) => ({
    feedUserUnique: unique('feed_user_unique').on(t.feed_id, t.user_id)
}));
