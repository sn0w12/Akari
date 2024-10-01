import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Manga } from "@/app/api/interfaces";

interface ReadingButtonProps {
  manga: Manga;
}

const ReadingButton: React.FC<ReadingButtonProps> = ({ manga }) => {
  const lastReadData = JSON.parse(localStorage.getItem("last_read") || "{}");
  const lastRead = lastReadData[manga.mangaId];
  const getLinkText = () => {
    if (lastRead) {
      if (lastRead === manga.chapterList[0].id) {
        return "Up To Date";
      }
      return "Continue Reading";
    } else {
      return "Start Reading";
    }
  };

  const text = getLinkText();
  const link = lastRead
    ? lastRead
    : manga.chapterList[manga.chapterList.length - 1].id;

  return (
    <Button
      size="lg"
      className="w-full"
      asChild
      disabled={!manga.chapterList.length}
    >
      {manga.chapterList.length ? (
        <Link href={`${window.location.pathname}/${link}`}>{text}</Link>
      ) : (
        <p>No Chapters</p>
      )}
    </Button>
  );
};

export default ReadingButton;
