# Pack de inversión premium

Ruta: `/products/pack-premium`.

Referencia: [PDP Pack PREMIUM en Figma](https://www.figma.com/design/m95u95YJupFALIOzF6Gabh/Web---2026?node-id=7265-2265). Inspeccionado desde el editor y el prototipo en el navegador, sin MCP ni API de Figma.

## Organización

Los componentes específicos viven junto a la ruta, en `_components/`:

- `pack-premium-page.tsx`: composición de las secciones.
- `contenido.ts`: textos, beneficios y precios de referencia.
- `presentacion-section.tsx`: hero, resumen, vídeo y barra fija de inscripción.
- `formacion-section.tsx`: certificación y cursos incluidos.
- `programa-tabs.tsx`: pestañas con navegación por teclado.
- `beneficios-section.tsx`: carrusel de acompañamiento.
- `colaboraciones-section.tsx`: Renta 4 y TaxDown.
- `inscripcion-section.tsx`: opciones de inscripción y contacto.
- `formulario-contacto.tsx`: datos de contacto y selección de fecha/horario preferidos.
- `elementos.tsx`: composición de botones, etiquetas, título y formato del curso.
- `pack-premium.module.css`: estilos y adaptación a móvil/tablet, aislados de la home.

Se reutilizan `SiteHeader`, `HomeButton`, `SectionBadge`, `PartnersStrip`, `VideoShowcase`, `MentorsCarousel` y `AppFooterSection`. Las opciones nuevas de vídeo y mentores conservan el comportamiento predeterminado de la home. En esta PDP, `AppFooterSection` se usa con `showAppPromo={false}` para mostrar el footer sin el bloque promocional de la app.

## Recursos

El cierre sigue el orden del diseño: reserva de llamada, inscripción, `FreeCoursesSection` (las cuatro clases gratuitas de la home) y footer sin promoción de la app.

Las imágenes de `public/products/pack-premium/` se guardaron desde los recursos cargados por el prototipo en el navegador. No dependen de URLs firmadas. Los logos e imágenes ya existentes se referencian desde `public/home/`.

La portada del vídeo es la imagen original del diseño. Se reutiliza el vídeo de presentación de la home. Los gráficos de operativa y algunas ilustraciones de beneficios combinan los fondos originales con HTML/CSS; no son exportaciones completas de las tarjetas.

## Integraciones

Esta ruta es una maqueta comercial y mantiene los precios de referencia del diseño (73 €/mes y 950 € completo); no consulta el catálogo ni inicia pagos. Los CTA de inscripción llevan a las opciones y a la solicitud de información.

Los formularios validan los campos y abren un borrador de correo. El usuario debe enviarlo desde su aplicación. El calendario permite proponer fecha y hora de España; no consulta disponibilidad ni confirma una reserva. La fecha mínima se actualiza en el navegador, incluso si el HTML fue prerenderizado otro día.

El botón del programa abre el contenido de la página. Para ofrecer una descarga hace falta el PDF definitivo. La denominación concreta del título universitario también queda pendiente: el Figma contiene «Nombre de titulación», que no se muestra como contenido final.

## Validación

- TypeScript, ESLint de los archivos modificados y build de producción.
- Revisión visual a 390, 768 y 1440 px.
- Pestañas con clic y flechas de teclado, fecha/horario, enlaces internos y ausencia de desbordamiento horizontal.
- El build informa advertencias en el import dinámico de páginas generadas y el trazado de `figma-clone.ts`, fuera de esta implementación.
