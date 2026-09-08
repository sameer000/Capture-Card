import "server-only";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Contact {
  _id?: ObjectId;
  siteId: string;
  data: Record<string, string>;
  pageUrl: string;
  userAgent?: string;
  createdAt: Date;
}

async function contactsCollection() {
  const db = await getDb();
  const collection = db.collection<Contact>("contacts");
  await collection.createIndex({ siteId: 1, createdAt: -1 });
  return collection;
}

export async function createContact(
  contact: Omit<Contact, "_id">
): Promise<void> {
  const collection = await contactsCollection();
  await collection.insertOne(contact);
}

export async function listContactsBySiteId(
  siteId: string,
  limit = 200
): Promise<Contact[]> {
  const collection = await contactsCollection();
  return collection
    .find({ siteId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function deleteContactsBySiteId(siteId: string): Promise<void> {
  const collection = await contactsCollection();
  await collection.deleteMany({ siteId });
}
