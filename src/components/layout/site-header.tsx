import Image from "next/image";
import { cn } from "@/lib/utils";

export type SiteNavigationItem = {
  label: string;
  href?: string;
};

export function SiteHeader({
  items,
  className,
}: {
  items: SiteNavigationItem[];
  className?: string;
}) {
  return (
    <>
      <details className="group absolute left-4 right-4 top-10 z-20 block xl:hidden">
        <summary className="flex h-[51px] cursor-pointer list-none items-center justify-between rounded-[18px] bg-tbs-black px-4 shadow-[0_8px_4px_rgba(18,18,20,0.5)] [&::-webkit-details-marker]:hidden">
          <Image src="/home/logo-traders.svg" alt="Traders Business School" width={107} height={28} priority />
          <span className="flex size-8 items-center justify-center" aria-hidden="true">
            <span className="flex w-4 flex-col gap-1.5">
              <span className="h-px w-full bg-[#f7f7f7]" />
              <span className="h-px w-full bg-[#f7f7f7]" />
              <span className="h-px w-full bg-[#f7f7f7]" />
            </span>
          </span>
          <span className="sr-only">Abrir menú</span>
        </summary>

        <nav
          className="absolute left-0 right-0 top-[59px] hidden flex-col gap-1 rounded-[18px] bg-tbs-black p-2 shadow-[0_8px_16px_rgba(18,18,20,0.45)] group-open:flex"
          aria-label="Navegación principal"
        >
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href ?? "#formacion"}
              className="rounded-xl px-4 py-3 font-space text-sm font-medium text-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f7f7]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#formacion"
            className="rounded-xl border-2 border-[#f7f7f7] px-4 py-3 text-center font-raleway text-base font-extrabold leading-4 text-[#f7f7f7]"
          >
            Aula Virtual
          </a>
        </nav>
      </details>

      <header
        className={cn(
          "absolute left-1/2 top-[64px] z-20 hidden h-[54px] w-[calc(100%-80px)] max-w-[1199px] -translate-x-1/2 items-center justify-between rounded-[26px] bg-tbs-black py-3 pl-6 pr-3 shadow-[0_8px_4px_rgba(18,18,20,0.5)] xl:flex",
          className
        )}
      >
        <Image src="/home/logo-traders.svg" alt="Traders Business School" width={107} height={28} priority />

        <nav className="flex items-center gap-3" aria-label="Navegación principal">
          {items.map((item) => (
            <span
              key={item.label}
              className="inline-flex h-[30px] items-center rounded-full px-5 font-space text-sm font-medium leading-[14px] text-[#f7f7f7]"
              data-href={item.href}
            >
              {item.label}
            </span>
          ))}
        </nav>

        <span className="inline-flex h-[30px] items-center rounded-full border-2 border-[#f7f7f7] px-3 font-raleway text-base font-extrabold leading-4 text-[#f7f7f7]">
          Aula Virtual
        </span>
      </header>
    </>
  );
}
