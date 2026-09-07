# Home TBS

## Estructura

La ruta `src/app/(public)/page.tsx` compone las secciones. Los componentes y los estilos de patrones, animaciones y carruseles viven en `src/components/home/`. El header compartido vive en `src/components/layout/`.

- `home.css`: estilos exclusivos de la home, importados desde su ruta.
- `globals.css`: tokens de Tailwind y estilos base. Los colores azules del bloque de metodología están centralizados como `tbs-blue-100`, `tbs-blue-200` y `tbs-blue-600`.
- `HomeButton`: variantes visuales compartidas; acepta `href` para navegación o propiedades nativas de botón. El estado deshabilitado se decide en cada uso.
- `SectionBadge`: variantes magenta, verde y azul. La variante azul conserva las medidas y tipografía de metodología.
- `LearningCard`: estructura común de las tarjetas, con ancho de texto configurable y contenido opcional.
- `public/home/`: assets locales. Conservar los SVG originales; no sustituirlos por emojis ni reinterpretaciones.

El contenido de escritorio tiene un ancho máximo de 1200 px. A 1440 px eso produce márgenes de 120 px. A 1280 px se mantienen 40 px sin desbordar. La metodología usa dos columnas en tablet y tres desde 1280 px; su grilla mide 812 px de alto en escritorio. Los mentores permanecen accesibles mediante desplazamiento horizontal.

## Referencia y verificación

Archivo Figma: `m95u95YJupFALIOzF6Gabh`. Nodo solicitado: `7767:80336`, dentro de `7767:80334` (metodología). La referencia local utilizada fue exportada el 7 de septiembre de 2026; su metadata indica `lastModified: 2026-09-07T14:15:41Z`.

Se verificaron las medidas de metodología, el recorte de la foto del profesor, los espaciados internos, el ancho del texto de las tarjetas largas, el tamaño de las filas y la cursiva real de Playfair Display. La home se revisa con fuentes e imágenes cargadas, en 320, 393, 768, 1280, 1440 y 1920 px. Las capturas de una sección deben esperar las imágenes lazy después de desplazarla a la vista.

## Pendientes para certificar fidelidad completa

El MCP de Figma agotó su cuota y la API REST respondió HTTP 429. Se continuó mediante la interfaz del navegador: se verificaron visualmente el nodo solicitado y sus propiedades de tipografía, dimensiones y color. La interfaz permite inspeccionar, pero sus acciones de copiar SVG y exportar no entregaron todavía un asset utilizable al navegador automatizado. No considerar esta revisión una certificación pixel perfect.

- El SVG local `learning/icon-clock.svg`, utilizado en Operativa en directo, contiene solo un círculo. La exportación disponible de `7767:80714` devuelve los mismos bytes; la captura de referencia muestra círculos concéntricos. Hace falta una exportación actual del ícono completo.
- Los iconos sociales, logos de tiendas y controles de audio de testimonios/footer siguen usando aproximaciones de la implementación previa. Hace falta exportarlos como assets individuales desde Figma.
- Las animaciones y efectos GLASS/PATTERN de Figma necesitan una comparación con la versión actual; CSS y el exportador no los reproducen idénticamente.
- La preview de la app muestra un damero también en la referencia disponible. No se inventó una captura de producto.
- El simulador, perfiles y varias llamadas a la acción aún son maquetas de la implementación previa. Sus destinos y comportamiento necesitan definición funcional; no están completos por tener su apariencia implementada.
