import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Información sobre el uso de cookies y tecnologías similares en Traders Business School.",
};

export default function PoliticaDeCookiesPage() {
  return (
    <LegalPage
      eyebrow="Transparencia"
      title="Política de cookies"
      description="Información sobre las tecnologías que usamos para que el sitio funcione, recuerde preferencias y mida su uso."
      updated="Última actualización: 23 de septiembre de 2026"
    >
      <LegalSection id="que-son" title="1. ¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos que se almacenan en tu navegador cuando
          visitas un sitio web. Sirven, entre otras cosas, para recordar preferencias,
          permitir funciones técnicas y obtener información agregada sobre el uso del
          sitio. También pueden utilizarse tecnologías similares, como píxeles o
          almacenamiento local, a las que nos referimos conjuntamente como cookies.
        </p>
      </LegalSection>

      <LegalSection id="tipos" title="2. Tipos de cookies">
        <h3>Cookies necesarias</h3>
        <p>
          Son imprescindibles para el funcionamiento y la seguridad del sitio. Por
          ejemplo, permiten recordar el país utilizado para mostrar una moneda
          adecuada o mantener una sesión de administración autorizada. No requieren
          consentimiento cuando son estrictamente necesarias.
        </p>
        <h3>Cookies analíticas y de marketing</h3>
        <p>
          Nos ayudan a comprender el uso del sitio y a medir la efectividad de las
          campañas. Solo se activarán cuando exista una base legal válida, normalmente
          tu consentimiento, y siempre que estén configuradas en el sitio.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="3. Cookies y tecnologías utilizadas">
        <div className="legal-table-wrap">
          <table>
            <thead>
              <tr><th>Nombre o proveedor</th><th>Finalidad</th><th>Duración aproximada</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>tbs_country</strong></td><td>Recuerda el país detectado o seleccionado para resolver moneda y disponibilidad del checkout.</td><td>30 días</td></tr>
              <tr><td><strong>tbs_session</strong></td><td>Cookie técnica de sesión para el acceso autorizado al área de administración. No se utiliza para compradores.</td><td>Sesión / según configuración de acceso</td></tr>
              <tr><td><strong>Google Tag Manager / Google Analytics</strong></td><td>Gestión de etiquetas y medición analítica, cuando estén configurados y consentidos.</td><td>Variable según el proveedor</td></tr>
              <tr><td><strong>HubSpot</strong></td><td>Gestión de formularios, contactos y automatización, cuando esté configurado y consentido.</td><td>Variable según el proveedor</td></tr>
              <tr><td><strong>Meta Pixel</strong></td><td>Medición de campañas y audiencias publicitarias, cuando esté configurado y consentido.</td><td>Variable según el proveedor</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Este listado refleja las integraciones previstas en la nueva plataforma. Las
          cookies efectivamente instaladas pueden variar según la configuración del
          sitio, los servicios que utilices y las preferencias que aceptes.
        </p>
      </LegalSection>

      <LegalSection id="consentimiento" title="4. Consentimiento">
        <p>
          Las cookies estrictamente necesarias se utilizan porque son indispensables
          para prestar el servicio solicitado. Las cookies analíticas, de marketing o
          de terceros que no sean necesarias requerirán tu consentimiento antes de
          activarse. Puedes retirarlo con la misma facilidad con la que lo otorgaste.
        </p>
        <div className="legal-callout">
          <p>
            Esta política debe leerse junto con la Política de privacidad. Si se
            incorporan nuevas herramientas de medición o publicidad, el panel de
            consentimiento y esta tabla se actualizarán antes de su activación.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="gestion" title="5. Cómo gestionar las cookies">
        <p>
          Puedes bloquear o eliminar cookies desde los ajustes de tu navegador. Ten en
          cuenta que, si deshabilitas las cookies necesarias, algunas partes del sitio
          pueden no funcionar correctamente. Los navegadores también permiten limitar
          cookies de terceros o borrar los datos de navegación de forma periódica.
        </p>
        <p>
          Para ejercer tus derechos en relación con datos personales tratados mediante
          cookies, consulta nuestra Política de privacidad o escríbenos a <a href="mailto:tradersbusinessschool@gmail.com">tradersbusinessschool@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="actualizaciones" title="6. Actualizaciones de esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios técnicos, legales o
          de los servicios utilizados. Publicaremos la versión vigente en esta misma
          página e indicaremos la fecha de última actualización.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
