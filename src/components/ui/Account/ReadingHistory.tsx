import { useState } from "react";
import { Clock, Book, BarChart3 } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { Combo } from "../combo";
import { ReadingHistoryEntry } from "@/app/api/interfaces";

export default function ReadingHistory() {
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryEntry[]>(
        () => {
            // Helper function to create a date relative to now
            const getRelativeDate = (daysAgo: number, hoursAgo = 0): Date => {
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                date.setHours(date.getHours() - hoursAgo);
                return date;
            };

            return [
                {
                    id: "1",
                    userId: "user-1",
                    mangaId: "manga-1",
                    mangaTitle: "One Piece",
                    image: "https://picsum.photos/100/150",
                    chapterId: "chapter-1052",
                    chapterTitle: "Chapter 1052: New Era",
                    readAt: getRelativeDate(0, 2), // Today, 2 hours ago
                },
            ];
        },
    );
    const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">(
        "7d",
    );

    function getChartData() {
        const now = new Date();
        let startDate: Date;
        let dateFormat: Intl.DateTimeFormatOptions;
        let periodDivisions: number;

        switch (selectedPeriod) {
            case "24h":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                dateFormat = { hour: "2-digit" };
                periodDivisions = 24; // 24 hours
                break;
            case "7d":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                dateFormat = { weekday: "short" };
                periodDivisions = 7; // 7 days
                break;
            case "30d":
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                dateFormat = { month: "short", day: "numeric" };
                periodDivisions = 30; // 30 days
                break;
        }

        // Filter history entries after start date
        const filteredHistory = readingHistory.filter(
            (entry) => entry.readAt >= startDate,
        );

        // Create a map of all possible date keys with zero counts
        const allPeriods: Record<string, number> = {};

        // For 7d and 30d, generate all possible date keys
        if (selectedPeriod === "7d" || selectedPeriod === "30d") {
            for (let i = 0; i < periodDivisions; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateKey = new Intl.DateTimeFormat(
                    "en-US",
                    dateFormat,
                ).format(date);
                allPeriods[dateKey] = 0;
            }
        } else if (selectedPeriod === "24h") {
            // For 24h, generate hourly keys
            for (let i = 0; i < 24; i++) {
                const date = new Date(now);
                date.setHours(now.getHours() - i);
                const dateKey = new Intl.DateTimeFormat(
                    "en-US",
                    dateFormat,
                ).format(date);
                allPeriods[dateKey] = 0;
            }
        }

        // Fill in actual counts
        filteredHistory.forEach((entry) => {
            const dateKey = new Intl.DateTimeFormat("en-US", dateFormat).format(
                entry.readAt,
            );
            allPeriods[dateKey] = (allPeriods[dateKey] || 0) + 1;
        });

        // Convert to array for chart and sort chronologically
        return Object.entries(allPeriods)
            .map(([date, count]) => ({
                date,
                count,
            }))
            .sort((a, b) => {
                // Simple sort for hour format (24h view)
                if (selectedPeriod === "24h") {
                    return a.date.localeCompare(b.date);
                }

                // For other periods, we need more complex sorting
                if (selectedPeriod === "7d") {
                    // Sort by day of week
                    const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ];
                    return days.indexOf(a.date) - days.indexOf(b.date);
                }

                // For 30d, sort by date
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
    }

    // Format the date for display
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    return (
        <TabsContent value="history" className="space-y-2">
            <Card>
                <CardHeader>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Reading Activity
                            </CardTitle>
                            <CardDescription>
                                View your reading patterns over time
                            </CardDescription>
                        </div>
                        <Combo
                            className="w-40"
                            options={[
                                { label: "Last 24 Hours", value: "24h" },
                                { label: "Last 7 Days", value: "7d" },
                                { label: "Last 30 Days", value: "30d" },
                            ]}
                            value={selectedPeriod}
                            onChange={(e) =>
                                setSelectedPeriod(
                                    e.target.value as "24h" | "7d" | "30d",
                                )
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer
                                config={{
                                    activity: {
                                        label: "Chapters Read",
                                        theme: {
                                            light: "hsl(221.2 83.2% 53.3%)",
                                            dark: "hsl(217.2 91.2% 59.8%)",
                                        },
                                    },
                                }}
                            >
                                <LineChart
                                    data={getChartData()}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        padding={{ left: 10, right: 10 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        allowDecimals={false}
                                        width={30}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="activity"
                                        stroke="var(--accent-color)"
                                        strokeWidth={2}
                                        dot={{
                                            r: 0,
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: "var(--accent-color)",
                                        }}
                                        isAnimationActive={false}
                                    />
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <span className="font-medium">
                                                                {
                                                                    payload[0]
                                                                        .payload
                                                                        .date
                                                                }
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    payload[0]
                                                                        .value
                                                                }{" "}
                                                                chapters
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Reading History
                    </CardTitle>
                    <CardDescription>
                        View your recent reading activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {readingHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <Book className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium">
                                No reading history yet
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Start reading manga to build your history
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {readingHistory.map((entry) => (
                                <Card
                                    key={entry.id}
                                    className="flex flex-row items-start p-4 shadow-sm border border-border rounded-lg"
                                >
                                    <div className="w-28 h-full mb-0 shrink-0">
                                        <Link
                                            href={`/manga/${entry.mangaId}`}
                                            className="block"
                                        >
                                            <div className="relative w-full aspect-[2/3] rounded overflow-hidden">
                                                <Image
                                                    src={
                                                        entry.image ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={entry.mangaTitle}
                                                    className="object-cover"
                                                    fill
                                                />
                                            </div>
                                        </Link>
                                    </div>
                                    <CardContent className="ml-4 flex flex-col flex-grow justify-between p-0">
                                        <div className="mb-4">
                                            <Link
                                                href={`/manga/${entry.mangaId}`}
                                            >
                                                <h3 className="font-bold text-2xl mb-2 mr-10 hover:underline text-left">
                                                    {entry.mangaTitle}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-3">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                Read on{" "}
                                                {formatDate(entry.readAt)}
                                            </p>
                                            <Link
                                                href={`/manga/${entry.mangaId}/${entry.chapterId}`}
                                                className="block mt-2"
                                            >
                                                <Button className="py-1 px-4 text-sm font-medium text-white bg-accent-color hover:bg-accent-color/70 transition-colors">
                                                    {entry.chapterTitle}
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="flex justify-center w-full">
                                <Button variant="outline" className="w-full">
                                    Load More
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
