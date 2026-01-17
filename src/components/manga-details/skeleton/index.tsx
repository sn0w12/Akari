import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonsSkeleton } from "./buttons";

const details = ["Authors", "Status", "Updated", "Views"];

export default function MangaDetailsSkeleton() {
    return (
        <>
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-2 items-stretch h-auto">
                <div className="flex flex-shrink-0 justify-center hidden lg:block">
                    <Skeleton
                        className="rounded-lg  object-cover h-auto xl:h-full max-w-lg lg:min-w-full"
                        style={{ width: "400px", height: "600px" }}
                    />
                </div>

                <div className="flex flex-col justify-between flex-grow lg:max-h-[600px] bg-background gap-0">
                    <div className="flex items-center mb-4 border-b pb-4 justify-between">
                        <Skeleton className="rounded-lg object-cover h-33 sm:h-41 md:h-57 w-24 sm:w-30 md:w-40 lg:hidden mr-4" />
                        <Skeleton className="h-8 w-1/2" />
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:gap-0 lg:flex-row">
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                            <Skeleton className="h-10 w-10 ml-2 rounded" />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-grow overflow-hidden">
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div>
                                {details.map((label, index) => (
                                    <div
                                        key={index}
                                        className="text-lg mb-2 flex items-center"
                                    >
                                        {label}:
                                        <Skeleton className="h-[22px] w-32 ml-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col h-full">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {[...Array(4)].map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-6 w-20"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 lg:mb-4 flex-grow h-full">
                                    <Skeleton className="hidden lg:flex xl:block w-full h-full min-h-16 rounded-xl" />
                                </div>
                            </div>
                            <ButtonsSkeleton />
                        </div>
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card className="w-full h-full max-h-96 lg:max-h-none p-4 overflow-y-auto">
                                <Skeleton className="h-48 lg:h-full w-full" />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
