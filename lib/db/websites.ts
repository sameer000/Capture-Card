import "server-only";
import { nanoid } from "nanoid";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Website {
  _id?: ObjectId;
  siteId: string;
  name: string;
  createdAt: Date;
}

async function websitesCollection() {
  const db = await getDb();
  const collection = db.collection<Website>("websites");
  await collection.createIndex({ siteId: 1 }, { unique: true });
  return collection;
}

export async function listWebsites(): Promise<Website[]> {
  const collection = await websitesCollection();
  return collection.find().sort({ createdAt: -1 }).toArray();
}

export async function getWebsiteBySiteId(
  siteId: string
): Promise<Website | null> {
  const collection = await websitesCollection();
  return collection.findOne({ siteId });
}

export async function createWebsite(name: string): Promise<Website> {
  const collection = await websitesCollection();
  const website: Website = {
    siteId: nanoid(),
    name,
    createdAt: new Date(),
  };
  await collection.insertOne(website);
  return website;
}

export async function deleteWebsite(siteId: string): Promise<void> {
  const collection = await websitesCollection();
  await collection.deleteOne({ siteId });
}
