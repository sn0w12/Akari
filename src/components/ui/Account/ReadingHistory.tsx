import { useState, useEffect } from "react";
import { Clock, Book, BarChart3, Loader2 } from "lucide-react";
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
        [],
    );
    const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">(
        "7d",
    );
    const [historyLoading, setHistoryLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [chartData, setChartData] = useState<
        { date: string; count: number }[]
    >([]);
    const [offset, setOffset] = useState(0);
    const limit = 10;
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch reading history
    useEffect(() => {
        async function fetchHistory() {
            setHistoryLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/account/reading/history?limit=${limit}&offset=0`,
                );
                if (!response.ok) throw new Error("Failed to fetch history");

                const data = await response.json();
                setReadingHistory(data.history || []);
                setHasMore((data.history || []).length === limit);
                setOffset(limit);
            } catch (err) {
                setError("Failed to load reading history");
                console.error(err);
            } finally {
                setHistoryLoading(false);
            }
        }

        fetchHistory();
    }, []);

    // Fetch reading stats when period changes
    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            try {
                const response = await fetch(
                    `/api/account/reading/stats?period=${selectedPeriod}`,
                );
                if (!response.ok) throw new Error("Failed to fetch stats");

                const data = await response.json();
                setChartData(data.stats || []);
            } catch (err) {
                console.error("Error fetching reading stats:", err);
            } finally {
                setStatsLoading(false);
            }
        }

        fetchStats();
    }, [selectedPeriod]);

    // Load more history
    async function loadMore() {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const response = await fetch(
                `/api/account/reading/history?limit=${limit}&offset=${offset}`,
            );
            if (!response.ok) throw new Error("Failed to fetch more history");

            const data = await response.json();
            const newHistory = data.history || [];

            setReadingHistory((prev) => [...prev, ...newHistory]);
            setHasMore(newHistory.length === limit);
            setOffset((prev) => prev + newHistory.length);
        } catch (err) {
            console.error("Error loading more history:", err);
        } finally {
            setLoadingMore(false);
        }
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
                                View your reading patterns over time. See{" "}
                                <Link
                                    className="text-primary hover:underline hover:text-accent-color"
                                    href={"/settings?id=saveReadingHistory"}
                                >
                                    settings
                                </Link>{" "}
                                to turn off tracking.
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
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
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
                                        data={chartData}
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
                        )}
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
                    {historyLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                        </div>
                    ) : readingHistory.length === 0 ? (
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
                                            href={`/manga/${entry.mangaIdentifier}`}
                                            className="block"
                                        >
                                            <div className="relative w-full aspect-[2/3] rounded overflow-hidden">
                                                <Image
                                                    src={`/api/image-proxy?imageUrl=${entry.image}`}
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
                                                href={`/manga/${entry.mangaIdentifier}`}
                                            >
                                                <h3 className="font-bold text-2xl mb-2 mr-10 hover:underline text-left">
                                                    {entry.mangaTitle}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-3">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                Read on{" "}
                                                {formatDate(
                                                    new Date(entry.readAt),
                                                )}
                                            </p>
                                            <Link
                                                href={`/manga/${entry.mangaIdentifier}/${entry.chapterIdentifier}`}
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

                            {hasMore && (
                                <div className="flex justify-center w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            "Load More"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
