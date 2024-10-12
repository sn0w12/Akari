import { Bookmark } from "@/app/api/interfaces";

function compareVersions(str1: string, str2: string): boolean {
    // Replace "-" with "." in both strings
    const num1 = parseFloat(str1.replace(/-/g, "."));
    const num2 = parseFloat(str2.replace(/-/g, "."));

    // Check if both values are integers
    if (Number.isInteger(num1) && Number.isInteger(num2)) {
        // Check if the first value is 1 larger than the second
        return num1 === num2 + 1;
    }

    // Check for ".5" decimal case, round down and compare
    const floorNum1 = Math.floor(num1);
    const floorNum2 = Math.floor(num2);

    if (num1 % 1 === 0.5 || num2 % 1 === 0.5) {
        // Compare after rounding down
        return floorNum1 === floorNum2 + 1;
    }

    // Check if the first value is 0.1 larger than the second
    const diff = Math.round((num1 - num2) * 10) / 10;
    if (diff === 0.1) {
        return true;
    }

    return false;
}

export function getButtonInfo(bookmark: Bookmark) {
    const mangaIdentifier = bookmark.link_story.split("/").pop();
    let continueReading = bookmark.link_chapter_now;
    let continueReadingText = `Continue Reading - Chapter ${bookmark.chapter_numbernow}`;
    let buttonColor = "bg-indigo-600 hover:bg-indigo-700";

    if (bookmark.up_to_date && bookmark.up_to_date === true) {
        continueReading = bookmark.link_chapter_last;

        if (bookmark.chapterlastnumber === bookmark.chapter_numbernow) {
            continueReadingText = `Latest Chapter - Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-green-600 hover:bg-green-700";
        } else if (
            compareVersions(
                bookmark.chapterlastnumber,
                bookmark.chapter_numbernow,
            )
        ) {
            continueReadingText = `New Chapter - Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-cyan-600 hover:bg-cyan-700";
        }
    }

    return {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    };
}

export async function checkIfBookmarked(mangaId: string) {
    const user_data = localStorage.getItem("accountInfo");

    if (!user_data) {
        console.error("User data not found");
        return false;
    }

    const response = await fetch(
        `/api/bookmarks/${mangaId}?user_data=${encodeURIComponent(user_data)}`,
    );
    const data = await response.json();
    return data.isBookmarked;
}
