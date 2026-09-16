import styles from "./resultados-profesionales.module.css";

export function ResultadosProfesionales() {
  return (
    <aside className={styles.resultados} aria-label="Resultados de la formación profesional">
      <p>Formación diseñada para<br />aprobar e impulsar tu carrera<br />dentro del sector financiero.</p>
      <div className={styles.cifras}>
        <article><span>Mejora profesional</span><strong>82%</strong></article>
        <article><span>Tasa de aprobación</span><strong>93%</strong></article>
      </div>
    </aside>
  );
}
