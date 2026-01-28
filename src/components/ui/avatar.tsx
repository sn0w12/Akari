"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import BoringAvatar from "boring-avatars";

import { cn } from "@/lib/utils";

type AvatarSize = 16 | 24 | 32 | 48 | 64 | 96;
const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
    16: "size-4",
    24: "size-6",
    32: "size-8",
    48: "size-12",
    64: "size-16",
    96: "size-24",
};

interface AvatarProps extends React.ComponentProps<
    typeof AvatarPrimitive.Root
> {
    name: string;
    size?: AvatarSize;
}

function Avatar({ className, name, size = 32, ...props }: AvatarProps) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                AVATAR_SIZE_CLASSES[size],
                className,
            )}
            {...props}
        >
            <BoringAvatar
                name={name}
                variant="bauhaus"
                size={size}
                colors={[
                    "var(--background)",
                    "var(--secondary)",
                    "var(--accent)",
                    "var(--accent-color)",
                ]}
            />
        </AvatarPrimitive.Root>
    );
}

function AvatarImage({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn("aspect-square size-full", className)}
            {...props}
        />
    );
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                "bg-muted flex size-full items-center justify-center rounded-full",
                className,
            )}
            {...props}
        />
    );
}

export { Avatar, AvatarImage, AvatarFallback };
