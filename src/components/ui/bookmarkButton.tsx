import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Spinner from "@/components/ui/spinners/puffLoader";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { useState } from "react";
import React from "react";

interface BookmarkButtonProps {
  isBookmarked: boolean | null;
  manga: any; // Adjust type as needed
  bookmark: (
    storyData: any,
    isBookmarked: boolean,
    setIsBookmarked: (state: boolean) => void
  ) => void;
  removeBookmark: (setIsBookmarked: (state: boolean) => void) => void;
  setIsBookmarked: (state: boolean) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  manga,
  bookmark,
  removeBookmark,
  setIsBookmarked,
}) => {
  const [hovered, setHovered] = useState(false); // Track hover state for tooltip behavior

  const handleBookmarkClick = () => {
    if (isBookmarked !== null) {
      bookmark(manga.storyData, isBookmarked, setIsBookmarked);
    }
  };

  const handleRemoveBookmark = () => {
    removeBookmark(setIsBookmarked);
  };

  const buttonContent =
    isBookmarked === null ? (
      <Spinner size={30} />
    ) : isBookmarked ? (
      <>
        <Bookmark className="mr-2 h-4 w-4" />
        {hovered ? "Remove Bookmark" : "Bookmarked"}
      </>
    ) : (
      <>
        <Bookmark className="mr-2 h-4 w-4" /> Bookmark
      </>
    );

  const buttonClass = `w-full flex items-center justify-center ${
    isBookmarked
      ? "bg-green-500 text-white hover:bg-green-600"
      : "hover:bg-gray-100 hover:text-background"
  }`;

  return isBookmarked ? (
    // Wrap in ConfirmDialog if already bookmarked
    <ConfirmDialog
      triggerButton={
        <Button
          variant="default"
          size="lg"
          className={`${buttonClass} hover:bg-red-600`} // Change to red on hover if bookmarked
          disabled={isBookmarked === null}
          onClick={handleBookmarkClick}
          onMouseEnter={() => setHovered(true)} // Track hover state
          onMouseLeave={() => setHovered(false)}
        >
          {buttonContent}
        </Button>
      }
      title="Confirm Bookmark Removal"
      message="Are you sure you want to remove this bookmark?"
      confirmLabel="Remove"
      confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
      cancelLabel="Cancel"
      onConfirm={handleRemoveBookmark}
    />
  ) : (
    // Regular button if not bookmarked
    <Button
      variant="outline"
      size="lg"
      className={buttonClass}
      disabled={isBookmarked === null}
      onClick={handleBookmarkClick}
    >
      {buttonContent}
    </Button>
  );
};

export default BookmarkButton;
