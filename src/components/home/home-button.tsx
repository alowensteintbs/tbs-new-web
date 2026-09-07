import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type HomeButtonVariant = "magenta" | "green" | "navigation" | "outline";

const variants: Record<HomeButtonVariant, string> = {
  magenta: "bg-tbs-magenta text-white",
  green: "bg-tbs-green-500 text-tbs-ink shadow-[0_0_3px_#11e07f]",
  navigation: "text-tbs-green-900",
  outline: "border-2 border-[#f7f7f7] text-[#f7f7f7]",
};

type HomeButtonProps = {
  variant: HomeButtonVariant;
} & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "href">)
  | ({ href?: never } & ComponentProps<"button">)
);

export function HomeButton({ variant, className, ...props }: HomeButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-raleway font-semibold disabled:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
    variants[variant],
    className,
  );

  if (props.href !== undefined) {
    return <Link {...props} className={classes} />;
  }

  return <button type="button" {...props} className={classes} />;
}
