interface DataTableSkeletonProps {
    columnCount: number;
    rowCount?: number;
}

export function DataTableSkeleton({
    columnCount,
    rowCount = 10,
}: DataTableSkeletonProps) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4">
                    {Array.from({ length: columnCount }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="h-10 flex-1 animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
                            style={{
                                animationDelay: `${rowIndex * 0.05}s`,
                                animationDuration: '1.5s',
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
