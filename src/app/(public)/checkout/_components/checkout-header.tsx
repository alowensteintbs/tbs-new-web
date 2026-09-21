import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";

export function CheckoutHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="Traders Business School, inicio">
        <Image
          src="/home/logo-traders.svg"
          alt="Traders Business School"
          width={107}
          height={28}
          priority
        />
      </Link>
      <span className={styles.headerBadge}>
        Escuela de inversión más elegida de España
      </span>
    </header>
  );
}
