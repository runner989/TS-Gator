import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
export async function createUser(name) {
    const [result] = await db
        .insert(users)
        .values({ name: name })
        .returning();
    return result;
}
export async function findUserByName(name) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.name, name))
        .limit(1);
    return result;
}
export async function findUserByUserId(userId) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return result;
}
export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}
export async function truncateUsers() {
    await db.delete(users);
}
