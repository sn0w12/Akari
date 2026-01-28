"use client";

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
        <div className="flex-1 container mx-auto p-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-lg">Loading data...</p>
                    {progress !== undefined && (
                        <Progress value={progress} className="w-64" />
                    )}
                </div>
            ) : (
                <>
                    <div className="flex flex-row justify-between">
                        <h1 className="text-2xl font-bold mb-4">
                            {title} - {data.length} items
                        </h1>
                        <Button onClick={onButtonClick}>{buttonText}</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {tableHeaders.map((header, index) => (
                                    <TableHead key={index}>{header}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => renderRow(item, index))}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
}
