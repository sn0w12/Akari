import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import db from "@/lib/db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getHqImage(identifier: string, origImage: string) {
  const mangaCache = await db.getCache(db.hqMangaCache, identifier);
  if (mangaCache && mangaCache?.imageUrl) {
      return mangaCache.imageUrl;
  }
  return origImage;
}
