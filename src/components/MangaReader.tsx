"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import { Card } from "@/components/ui/card";
import { Chapter } from "@/app/api/interfaces";
import PageProgress from "@/components/ui/pageProgress";
import Image from "next/image";

interface ChapterReaderProps {
  isHeaderVisible: boolean;
}

export default function ChapterReader({ isHeaderVisible }: ChapterReaderProps) {
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
    undefined
  );
  const [timeElapsed, setTimeElapsed] = useState(0);
  const router = useRouter();
  const { id, subId } = useParams();
  const bookmarkUpdatedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chapterData || bookmarkUpdatedRef.current) return;

    const isHalfwayThrough =
      currentPage >= Math.floor(chapterData.images.length / 2);
    const hasFewImages = chapterData.images.length < 4;
    const thirtySecondsPassed = timeElapsed >= 30;

    if (
      isHalfwayThrough ||
      ((hasFewImages || isStripMode) && thirtySecondsPassed)
    ) {
      updateBookmark(chapterData);
      bookmarkUpdatedRef.current = true;
    }
  }, [chapterData, currentPage, timeElapsed]);

  // Detect if the majority of images have a long aspect ratio
  useEffect(() => {
    if (chapterData && chapterData.images.length > 0) {
      let longImageCount = 0;
      const maxImagesToCheck = 5; // Limit the number of images to check
      const imagesToCheck = chapterData.images.slice(0, maxImagesToCheck);

      const checkSelectedImages = async () => {
        // Fetch dimensions for all images concurrently
        const dimensionPromises = imagesToCheck.map(async (img) => {
          try {
            const response = await fetch(
              `/api/get-image-dimensions?imageUrl=${encodeURIComponent(img)}`
            );
            const { width, height } = await response.json();
            const aspectRatio = height / width;
            if (aspectRatio > 2) {
              longImageCount += 1;
            }
          } catch (error) {
            console.error(`Failed to get dimensions for image ${img}:`, error);
          }
        });

        await Promise.all(dimensionPromises);

        // If more than half of the checked images are long, switch to strip mode
        if (longImageCount > imagesToCheck.length / 2) {
          setIsStripMode(true);
        } else {
          setIsStripMode(false);
        }
      };

      checkSelectedImages();
    }
  }, [chapterData]);

  // Fetch the chapter data
  useEffect(() => {
    const user_data = localStorage.getItem("accountInfo");
    const user_name = localStorage.getItem("accountName");
    const fetchChapter = async () => {
      const response = await fetch(
        `/api/manga/${id}/${subId}?user_data=${user_data}&user_name=${user_name}`
      );
      const data: Chapter = await response.json();
      setChapterData(data);
      document.title = `${data.title} - ${data.chapter}`;
    };

    fetchChapter();
  }, [id, subId]);

  // Navigate to the next page
  const nextPage = useCallback(() => {
    if (chapterData && currentPage < chapterData.images.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (chapterData && currentPage === chapterData.images.length - 1) {
      router.push(`/manga/${chapterData.nextChapter}`);
    }
  }, [chapterData, currentPage]);

  // Navigate to the previous page
  const prevPage = useCallback(() => {
    if (chapterData && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (chapterData && currentPage === 0) {
      router.push(`/manga/${chapterData.lastChapter}`);
    }
  }, [chapterData, currentPage]);

  async function updateBookmark(data: Chapter) {
    const user_data = localStorage.getItem("accountInfo");
    const story_data = data.storyData;
    const chapter_data = data.chapterData;
    if (!chapter_data || !story_data || !user_data) return;

    const response = await fetch("/api/bookmarks/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_data, story_data, chapter_data }),
    });
    const result = await response.json();
    return result;
  }

  // Handle key press events for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  // Handle click on the screen for normal mode
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    if (clickX > screenWidth / 2) {
      nextPage(); // Click on the right side
    } else {
      prevPage(); // Click on the left side
    }
  };

  if (!chapterData || isStripMode === undefined) {
    return <CenteredSpinner />;
  }

  // Render "strip" mode for long images
  if (isStripMode) {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="flex flex-col items-center bg-black overflow-y-scroll h-screen">
          {chapterData.images.map((image, index) => (
            <Image
              key={index}
              src={`/api/image-proxy?imageUrl=${encodeURIComponent(image)}`}
              alt={`${chapterData.title} - ${chapterData.chapter} Page ${
                index + 1
              }`}
              width={700}
              height={1080}
              className="object-contain w-128"
            />
          ))}
        </div>
        <div
          className={`absolute top-0 left-0 p-4 text-white text-sm z-10 manga-title ${
            isHeaderVisible ? "header-visible" : ""
          }`}
        >
          <Card className="p-4 text-center">
            <h3 className="font-bold">
              <a
                href={`http://${window.location.host}/manga/${chapterData.parentId}`}
                className="hover:underline"
              >
                {chapterData.title}
              </a>
            </h3>
            <p className="text-xs">{chapterData.chapter}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Normal mode (single image navigation)
  return (
    <div
      className="flex justify-center items-center h-screen w-screen bg-black"
      onClick={handleClick}
    >
      <div className="relative h-full w-full">
        <Image
          src={`/api/image-proxy?imageUrl=${encodeURIComponent(
            chapterData.images[currentPage]
          )}`}
          alt={`${chapterData.title} - ${chapterData.chapter} Page ${
            currentPage + 1
          }`}
          width={700}
          height={1080}
          className="object-contain w-full h-full cursor-pointer"
        />

        <div
          className={`absolute top-0 left-0 p-4 text-white text-sm z-10 manga-title ${
            isHeaderVisible ? "header-visible" : ""
          }`}
        >
          <Card className="p-4 text-center">
            <h3 className="font-bold">
              <a
                href={`http://${window.location.host}/manga/${chapterData.parentId}`}
                className="hover:underline"
              >
                {chapterData.title}
              </a>
            </h3>
            <p className="text-xs">{chapterData.chapter}</p>
            <p className="text-xs">
              Page {currentPage + 1} of {chapterData.images.length}
            </p>
          </Card>
        </div>
      </div>
      <PageProgress
        currentPage={currentPage}
        totalPages={chapterData.images.length}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
