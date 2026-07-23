import {
    EvilBarChart,
    Bar,
    Grid as BarGrid,
    XAxis as BarXAxis,
    YAxis as BarYAxis,
    Tooltip as BarTooltip,
} from "@/components/evilcharts/charts/bar-chart";
import {
    ActiveDot,
    Dot,
    EvilLineChart,
    Grid as LineGrid,
    Line,
    Tooltip as LineTooltip,
    XAxis as LineXAxis,
    YAxis as LineYAxis,
} from "@/components/evilcharts/charts/line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/api";
import type { ChartConfig } from "@/components/evilcharts/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type HistoryBucket = components["schemas"]["HistoryBucket"];

type SelectOption = { value: string; label: string; days?: number };
type Option = SelectOption | { value: "separator"; label: ""; days?: never };

const OPTIONS: Option[] = [
    { value: "1d", label: "Last 24 hours" },
    { value: "separator", label: "" },
    { value: "this-week", label: "This week" },
    { value: "7d", label: "Last 7 days" },
    { value: "separator", label: "" },
    { value: "this-month", label: "This month" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "separator", label: "" },
    { value: "this-year", label: "This year" },
    { value: "12m", label: "Last 12 months" },
    { value: "60m", label: "Last 5 years" },
];

const SELECT_ITEMS = OPTIONS.filter(
    (o): o is SelectOption => o.value !== "separator",
);

function isSeparator(o: Option): o is { value: "separator"; label: "" } {
    return o.value === "separator";
}

function resolveBucketRange(value: string): {
    bucket: components["schemas"]["HistoryBucket"];
    range: number;
} {
    const now = new Date();

    switch (value) {
        case "1d":
            return { bucket: "Hour", range: 24 };
        case "this-week": {
            const daysSinceMonday = (now.getDay() + 6) % 7;
            return { bucket: "Day", range: daysSinceMonday + 1 };
        }
        case "7d":
            return { bucket: "Day", range: 7 };
        case "this-month":
            return { bucket: "Day", range: now.getDate() };
        case "30d":
            return { bucket: "Day", range: 30 };
        case "90d":
            return { bucket: "Day", range: 90 };
        case "this-year":
            return { bucket: "Month", range: now.getMonth() + 1 };
        case "12m":
            return { bucket: "Month", range: 12 };
        case "60m":
            return { bucket: "Year", range: 5 };
        default:
            return { bucket: "Day", range: 30 };
    }
}

function dateKey(bucket: HistoryBucket): (d: Date) => string {
    switch (bucket) {
        case "Hour":
            return (d) =>
                `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}:00:00Z`;
        case "Day":
            return (d) =>
                `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}T00:00:00Z`;
        case "Week":
            return (d) => {
                const day = d.getUTCDay();
                const mon = new Date(d);
                mon.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
                return `${mon.getUTCFullYear()}-${String(mon.getUTCMonth() + 1).padStart(2, "0")}-${String(mon.getUTCDate()).padStart(2, "0")}T00:00:00Z`;
            };
        case "Month":
            return (d) =>
                `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01T00:00:00Z`;
        case "Year":
            return (d) => `${d.getUTCFullYear()}-01-01T00:00:00Z`;
    }
}

function formatLabel(iso: string, bucket: HistoryBucket): string {
    const d = new Date(iso);
    switch (bucket) {
        case "Hour":
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                hour12: false,
                timeZone: "UTC",
            });
        case "Day":
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
            });
        case "Week":
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
            });
        case "Month":
            return d.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
            });
        case "Year":
            return String(d.getUTCFullYear());
    }
}

function padTimeline(
    entries: components["schemas"]["ReadingHistoryTimelineEntry"][],
    bucket: HistoryBucket,
    range: number,
): { date: string; reads: number }[] {
    const mkKey = dateKey(bucket);
    const now = new Date();

    const dataMap = new Map<string, number>();
    for (const e of entries) {
        const key = mkKey(new Date(e.date));
        dataMap.set(key, (dataMap.get(key) ?? 0) + e.reads);
    }

    const result: { date: string; reads: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
        const d = new Date(now);
        switch (bucket) {
            case "Hour":
                d.setUTCHours(d.getUTCHours() - i, 0, 0, 0);
                break;
            case "Day":
                d.setUTCDate(d.getUTCDate() - i);
                d.setUTCHours(0, 0, 0, 0);
                break;
            case "Week":
                d.setUTCDate(d.getUTCDate() - i * 7);
                d.setUTCHours(0, 0, 0, 0);
                break;
            case "Month":
                d.setUTCMonth(d.getUTCMonth() - i);
                d.setUTCDate(1);
                d.setUTCHours(0, 0, 0, 0);
                break;
            case "Year":
                d.setUTCFullYear(d.getUTCFullYear() - i);
                d.setUTCMonth(0, 1);
                d.setUTCHours(0, 0, 0, 0);
                break;
        }
        const key = mkKey(d);
        result.push({
            date: formatLabel(key, bucket),
            reads: dataMap.get(key) ?? 0,
        });
    }
    return result;
}

function padDayOfWeek(
    entries: components["schemas"]["DayOfWeekReadCount"][],
): { day: string; count: number }[] {
    const map = new Map(entries.map((e) => [e.dayOfWeek, e.count]));
    return DAY_LABELS.map((day, i) => ({
        day,
        count: map.get((i + 1) % 7) ?? 0,
    }));
}

function padHour(
    entries: components["schemas"]["HourReadCount"][],
): { hour: string; count: number }[] {
    const map = new Map(entries.map((e) => [e.hour, e.count]));
    return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i + 1}`,
        count: map.get(i) ?? 0,
    }));
}

const timelineConfig = {
    reads: {
        label: "Reads",
        colors: {
            light: ["var(--primary)"],
            dark: ["var(--primary)"],
        },
    },
} satisfies ChartConfig;

const dowConfig = {
    count: {
        label: "Reads",
        colors: {
            light: ["var(--primary)"],
            dark: ["var(--primary)"],
        },
    },
} satisfies ChartConfig;

const hourConfig = {
    count: {
        label: "Reads",
        colors: {
            light: ["var(--primary)"],
            dark: ["var(--primary)"],
        },
    },
} satisfies ChartConfig;

const genreConfig = {
    count: {
        label: "Reads",
        colors: {
            light: ["var(--primary)"],
            dark: ["var(--primary)"],
        },
    },
} satisfies ChartConfig;

export function HistoryContent() {
    const [selected, setSelected] = useState("30d");
    const { bucket, range } = resolveBucketRange(selected);

    const {
        data: timeline,
        isLoading: timelineLoading,
        error: timelineError,
    } = useQuery({
        queryKey: ["reading-history", "timeline", bucket, range],
        queryFn: async () => {
            const res = await client.GET("/v2/bookmarks/history", {
                params: { query: { bucket, range } },
            });
            if (res.error) throw res.error;
            return res.data.data;
        },
    });

    const {
        data: stats,
        isLoading: statsLoading,
        error: statsError,
    } = useQuery({
        queryKey: ["reading-history", "stats", bucket, range],
        queryFn: async () => {
            const res = await client.GET("/v2/bookmarks/history/stats", {
                params: { query: { bucket, range } },
            });
            if (res.error) throw res.error;
            return res.data.data;
        },
    });

    const timelineData = useMemo(
        () => padTimeline(timeline ?? [], bucket, range),
        [timeline, bucket, range],
    );

    const dowData = useMemo(
        () => padDayOfWeek(stats?.readsByDayOfWeek ?? []),
        [stats?.readsByDayOfWeek],
    );

    const hourData = useMemo(
        () => padHour(stats?.readsByHour ?? []),
        [stats?.readsByHour],
    );

    const genreData = useMemo(() => stats?.topGenres ?? [], [stats?.topGenres]);

    if (timelineError || statsError) {
        return <div>Failed to load reading history</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    History
                </h1>
                <Select
                    items={SELECT_ITEMS}
                    value={selected}
                    onValueChange={(value) => setSelected(value as string)}
                >
                    <SelectTrigger
                        className="w-40"
                        size="sm"
                        aria-label="Time range"
                    >
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        {OPTIONS.map((o) =>
                            isSeparator(o) ? (
                                <SelectSeparator key={o.value} />
                            ) : (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard
                    title="Total Reads"
                    value={stats?.totalReads}
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Unique Manga"
                    value={stats?.uniqueManga}
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Avg Per Day"
                    value={stats?.avgPerDay?.toFixed(1)}
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Current Streak"
                    value={stats?.currentStreak}
                    suffix=" days"
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Longest Streak"
                    value={stats?.longestStreak}
                    suffix=" days"
                    isLoading={statsLoading}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reading Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <EvilLineChart
                        config={timelineConfig}
                        data={timelineData}
                        isLoading={timelineLoading}
                        className="aspect-video max-h-80"
                    >
                        <LineGrid />
                        <LineXAxis
                            dataKey="date"
                            fontSize={12}
                            minTickGap={20}
                        />
                        <LineYAxis fontSize={12} />
                        <LineTooltip />
                        <Line dataKey="reads" enableBufferLine>
                            <Dot variant="default" />
                            <ActiveDot variant="default" />
                        </Line>
                    </EvilLineChart>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Reads by Day of Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EvilBarChart
                            config={dowConfig}
                            data={dowData}
                            isLoading={statsLoading}
                            className="aspect-video max-h-64"
                        >
                            <BarGrid />
                            <BarXAxis dataKey="day" fontSize={12} />
                            <BarYAxis fontSize={12} />
                            <BarTooltip />
                            <Bar dataKey="count" variant="gradient" />
                        </EvilBarChart>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reads by Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EvilBarChart
                            config={hourConfig}
                            data={hourData}
                            isLoading={statsLoading}
                            className="aspect-video max-h-64"
                        >
                            <BarGrid />
                            <BarXAxis
                                dataKey="hour"
                                fontSize={12}
                                tickFormatter={(v: string) => `${v}:00`}
                            />
                            <BarYAxis fontSize={12} />
                            <BarTooltip />
                            <Bar dataKey="count" variant="gradient" />
                        </EvilBarChart>
                    </CardContent>
                </Card>
            </div>

            {genreData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Genres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EvilBarChart
                            config={genreConfig}
                            data={genreData}
                            layout="horizontal"
                            isLoading={statsLoading}
                            className="aspect-video max-h-96"
                        >
                            <BarGrid />
                            <BarXAxis type="number" fontSize={12} />
                            <BarYAxis
                                type="category"
                                dataKey="genre"
                                fontSize={12}
                                width={120}
                            />
                            <BarTooltip />
                            <Bar dataKey="count" />
                        </EvilBarChart>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    suffix,
    isLoading,
}: {
    title: string;
    value?: number | string;
    suffix?: string;
    isLoading: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className="text-2xl font-bold tabular-nums">
                        {value ?? "—"}
                        {suffix && (
                            <span className="text-sm font-normal text-muted-foreground">
                                {suffix}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
