import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonsSkeleton } from "./buttons";

const details = ["Author", "Status", "Updated", "Views"];

export default function MangaDetailsSkeleton() {
    return (
        <>
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-2 items-stretch h-auto">
                <div className="flex flex-shrink-0 justify-center hidden lg:block">
                    <Skeleton className="rounded-lg object-cover h-auto max-w-lg min-w-full w-full aspect-[2/3] lg:h-[600px]" />
                </div>

                <div className="flex flex-col justify-between flex-grow lg:max-h-[600px] bg-background gap-0">
                    <div className="flex items-center mb-4 border-b pb-4 justify-between">
                        <Skeleton className="rounded-lg object-cover h-auto w-24 sm:w-30 md:w-40 aspect-[2/3] lg:hidden mr-4" />
                        <div className="flex items-center gap-2 flex-grow">
                            <Skeleton className="h-8 w-1/2" />
                        </div>
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:gap-0 lg:flex-row">
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow overflow-hidden">
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                {details.map((label, index) => (
                                    <div key={index}>
                                        <div className="text-lg font-semibold">
                                            {label}:
                                        </div>
                                        <Skeleton className="h-[22px] w-24 rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="h-fit">
                                    <h2 className="text-xl font-semibold">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {[...Array(4)].map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-[22px] w-20 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="my-2 flex-grow">
                                    <Skeleton className="w-full h-full min-h-16 rounded-xl" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-auto">
                                <ButtonsSkeleton />
                            </div>
                        </div>
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card className="w-full h-full max-h-60 md:max-h-96 lg:max-h-none p-4 overflow-y-auto">
                                <Skeleton className="h-48 lg:h-full w-full" />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
