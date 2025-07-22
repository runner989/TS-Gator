import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string): Promise<any> {
    const [result] = await db
        .insert(users)
        .values({ name: name })
        .returning();
    return result;
}

export async function findUserByName(name: string): Promise<any> {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.name,name))
        .limit(1);
    return result;
}

export async function findUserByUserId(userId: string): Promise<any> {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id,userId))
        .limit(1);
    return result;
}

export async function getUsers(): Promise<any> {
    const result = await db.select().from(users);
    return result;
}

export async function truncateUsers(): Promise<void> {
    await db.delete(users);
}

