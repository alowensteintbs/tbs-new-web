import Image from "next/image";
import type { ReactNode } from "react";
import { HomeButton } from "@/components/home/home-button";
import { SectionBadge } from "@/components/home/section-badge";
import { cn } from "@/lib/utils";
import styles from "./pack-premium.module.css";

export function Etiqueta({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: "lima" | "neutro" | "blanco" | "rosa";
}) {
  return (
    <SectionBadge className={cn(styles.etiqueta, styles[tono])}>
      {children}
    </SectionBadge>
  );
}

export function TituloPack({ principal = false }: { principal?: boolean }) {
  const Tag = principal ? "h1" : "h2";
  return (
    <Tag className={cn(styles.tituloPack, principal && styles.tituloPrincipal)}>
      Pack de
      <br />
      inversión
      <br />
      <em>premium</em>
    </Tag>
  );
}

export function BotonPack({
  children,
  href,
  tono = "lima",
  className,
}: {
  children: ReactNode;
  href: string;
  tono?: "lima" | "cristal" | "blanco" | "verde" | "rosa";
  className?: string;
}) {
  return (
    <HomeButton
      href={href}
      variant="magenta"
      className={cn(styles.boton, styles[`boton_${tono}`], className)}
    >
      {children}
    </HomeButton>
  );
}

export function FormatoCurso({ claro = false }: { claro?: boolean }) {
  return (
    <div className={cn(styles.formato, claro && styles.formatoClaro)}>
      <span>
        <Image
          src="/home/learning/icon-live.svg"
          width={26}
          height={26}
          alt=""
        />
        Hazlo a tu ritmo
      </span>
      <span>
        <Image src="/globe.svg" width={26} height={26} alt="" />
        Formato online
      </span>
    </div>
  );
}
