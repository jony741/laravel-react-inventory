import { Skeleton } from '@/components/ui/skeleton';

type TableSkeletonProps = {
    rows?: number;
    columns?: number;
};

export default function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                            <Skeleton className="h-5 w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
