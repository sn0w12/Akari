import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";
import { Frame } from "../ui/frame";

interface SyncBodyProps<T> {
    title: string;
    loading: boolean;
    progress?: number;
    buttonText: string;
    onButtonClick: () => void;
    tableHeaders: string[];
    renderRow: (item: T, index: number) => ReactNode;
    data: T[];
}

export function SyncBody<T>({
    title,
    loading,
    progress,
    buttonText,
    onButtonClick,
    tableHeaders,
    renderRow,
    data,
}: SyncBodyProps<T>) {
    return (
        <div className="flex-1 max-w-6xl mx-auto w-full p-4 pt-0">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-lg">Loading data&hellip;</p>
                    {progress !== undefined && (
                        <Progress value={progress} className="w-64" />
                    )}
                </div>
            ) : (
                <>
                    <div className="flex flex-row justify-between gap-2 pt-2">
                        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
                        <Button size="sm" onClick={onButtonClick}>
                            {buttonText}
                        </Button>
                    </div>
                    <Frame className="w-full">
                        <Table
                            variant="card"
                            className="w-full overflow-hidden"
                        >
                            <TableHeader>
                                <TableRow>
                                    {tableHeaders.map((header) => (
                                        <TableHead key={header}>
                                            {header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) =>
                                    renderRow(item, index),
                                )}
                            </TableBody>
                        </Table>
                    </Frame>
                </>
            )}
        </div>
    );
}
