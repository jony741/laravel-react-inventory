import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationData<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

export default function Pagination({ links, from, to, total }: Pick<PaginationData<unknown>, 'links' | 'from' | 'to' | 'total'>) {
    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <div className="flex items-center justify-between border-t border-sidebar-border/70 dark:border-sidebar-border px-4 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    onClick={() => handlePageChange(links[0]?.url)}
                    disabled={!links[0]?.url}
                    variant="outline"
                    size="sm"
                >
                    Previous
                </Button>
                <Button
                    onClick={() => handlePageChange(links[links.length - 1]?.url)}
                    disabled={!links[links.length - 1]?.url}
                    variant="outline"
                    size="sm"
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{from}</span> to{' '}
                        <span className="font-medium">{to}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                            onClick={() => handlePageChange(links[0]?.url)}
                            disabled={!links[0]?.url}
                            variant="outline"
                            size="sm"
                            className="rounded-r-none"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {links.slice(1, -1).map((link, index) => {
                            const isNumber = !isNaN(Number(link.label));
                            if (!isNumber && link.label === '...') {
                                return (
                                    <span
                                        key={index}
                                        className="inline-flex items-center border border-sidebar-border/70 dark:border-sidebar-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
                                    >
                                        {link.label}
                                    </span>
                                );
                            }
                            return (
                                <Button
                                    key={index}
                                    onClick={() => handlePageChange(link.url)}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="rounded-none"
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                        <Button
                            onClick={() => handlePageChange(links[links.length - 1]?.url)}
                            disabled={!links[links.length - 1]?.url}
                            variant="outline"
                            size="sm"
                            className="rounded-l-none"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
