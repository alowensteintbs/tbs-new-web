import Image from "next/image";
import { BotonPack } from "./elementos";
import styles from "./pack-premium.module.css";

export function MasInformacion() {
  return (
    <div className={styles.masInformacion} id="informacion">
      <div className={styles.informacionTexto}>
        <h2>Solicita más información</h2>
        <p>
          Contamos con una alianza estratégica con Taxdown, reconocidos expertos
          en fiscalidad con un equipo de profesionales altamente cualificados.
        </p>
      </div>
      <div className={styles.informacionVentajas}>
        {[
          ["calendario", "Hazlo a tu ritmo"],
          ["online", "Formato online"],
          ["plazas", "Plazas abiertas 2026"],
        ].map(([icono, texto]) => (
          <span key={icono}>
            <Image src={`/products/pack-premium/informacion/${icono}.svg`} width={26} height={26} alt="" />
            {texto}
          </span>
        ))}
      </div>
      <BotonPack href="#llamada" className={styles.informacionBoton}>
        Solicitar información
      </BotonPack>
    </div>
  );
}
