export function getVisiblePages(currentPage: number, totalPages: number) {
    const pages = new Set<number>();

    pages.add(1);
    pages.add(currentPage);
    if (totalPages > 1) {
        pages.add(totalPages);
    }

    // Add neighboring pages around current page
    if (currentPage > 1) {
        pages.add(currentPage - 1);
    }
    if (currentPage < totalPages) {
        pages.add(currentPage + 1);
    }

    return Array.from(pages).sort((a, b) => a - b);
}
