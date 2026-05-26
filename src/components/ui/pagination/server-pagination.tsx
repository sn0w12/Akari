import { useRouterState } from "@tanstack/react-router";
import { BasePagination } from "./base-pagination";

interface PaginationElementProps {
  currentPage: number;
  totalPages: number;
  href: string;
  className?: string;
}

export function ServerPagination({
  currentPage,
  totalPages,
  className,
  href,
}: PaginationElementProps) {
  return (
    <ServerPaginationContent
      currentPage={currentPage}
      totalPages={totalPages}
      className={className}
      href={href}
    />
  );
}

function ServerPaginationContent({
  currentPage,
  totalPages,
  className,
  href,
}: PaginationElementProps) {
  const searchParams = new URLSearchParams(useRouterState({ select: (s) => s.location.searchStr }));

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "page" && value) {
        params.append(key, value);
      }
    });

    if (page > 1) {
      params.set("page", String(page));
    }

    const paramsString = params.toString();
    return paramsString ? `${href}?${paramsString}` : href;
  };

  return (
    <BasePagination
      currentPage={currentPage}
      totalPages={totalPages}
      className={className}
      getPageUrl={createPageUrl}
      onPrefetch={() => {}}
    />
  );
}
