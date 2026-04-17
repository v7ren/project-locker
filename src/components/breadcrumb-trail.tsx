import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbTrailItem[];
  className?: string;
};

export function BreadcrumbTrail({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList className="flex-nowrap text-[11px] leading-tight sm:text-xs">
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem className="max-w-[40vw] shrink truncate sm:max-w-[12rem]">
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} prefetch={false} className="block truncate">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="block truncate">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
