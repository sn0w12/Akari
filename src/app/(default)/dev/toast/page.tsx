"use client";

import { useState } from "react";
import Toast from "@/lib/toast-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

type ToastType = "success" | "error" | "info" | "warning";

export default function ToastTestPage() {
    const [message, setMessage] = useState("This is a test toast");
    const [type, setType] = useState<ToastType>("success");
    const [duration, setDuration] = useState(5000);

    const showToast = () => {
        new Toast(message, type, { autoClose: duration });
    };

    return (
        <div className="flex items-center justify-center min-h-full p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Toast Test Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="message">Message</Label>
                        <Input
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value) =>
                                setType(value as ToastType)
                            }
                        >
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="duration">Duration (ms)</Label>
                        <Slider
                            id="duration"
                            value={[duration]}
                            onValueChange={(value) => setDuration(value[0])}
                            min={0}
                            max={50000}
                            step={500}
                            className="my-2"
                        />
                    </div>
                    <Button onClick={showToast}>Show Toast</Button>
                </CardContent>
            </Card>
        </div>
    );
}
