import Image from "next/image";
import styles from "./trading.module.css";

const detalles = [
  {
    texto: "50 minutos",
    icono: "/products/pack-premium/informacion/plazas.svg",
  },
  {
    texto: "Formato online",
    icono: "/products/pack-premium/informacion/online.svg",
  },
] as const;

export function ClaseGratisDetalles() {
  return (
    <div className={styles.formatoClase}>
      {detalles.map((detalle) => (
        <span key={detalle.texto}>
          <Image src={detalle.icono} alt="" width={30} height={30} />
          {detalle.texto}
        </span>
      ))}
    </div>
  );
}
