import { NextRequest, NextResponse } from "next/server";
import {
    deleteAllReadingHistory,
    deleteReadingHistoryEntry,
    encodeUserId,
    userDataToUserId,
} from "@/lib/supabase";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const user_data = getUserData(cookieStore);
        const userId = userDataToUserId(user_data);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 },
            );
        }

        // Get the entry ID from the request
        const { searchParams } = new URL(req.url);
        const entryId = searchParams.get("id");

        if (entryId) {
            const success = await deleteReadingHistoryEntry(userId, entryId);

            if (!success) {
                return NextResponse.json(
                    { error: "Failed to delete entry" },
                    { status: 500 },
                );
            }

            return NextResponse.json({ success: true });
        } else {
            const success = await deleteAllReadingHistory(userId);

            if (!success) {
                return NextResponse.json(
                    { error: "Failed to delete reading history" },
                    { status: 500 },
                );
            }

            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error("Error deleting reading history:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 },
        );
    }
}
