import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Información sobre el tratamiento de datos personales en Traders Business School.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Protección de datos"
      title="Política de privacidad"
      description="Te explicamos qué datos tratamos, para qué los utilizamos y cómo puedes ejercer tus derechos."
      updated="Última actualización: 23 de septiembre de 2026"
    >
      <LegalSection id="responsable" title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es <strong>TRADER
          BUSINESS SCHOOL, S.L.</strong>, con NIF <strong>B90424938</strong> y
          domicilio en Avenida República Argentina, 15, planta 9, 41011 Sevilla,
          España.
        </p>
        <p>
          Para cualquier cuestión relacionada con tus datos personales puedes escribir
          a <a href="mailto:tradersbusinessschool@gmail.com">tradersbusinessschool@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="datos" title="2. Datos que podemos tratar">
        <p>Según cómo interactúes con TBS, podemos tratar las siguientes categorías de datos:</p>
        <ul>
          <li><strong>Datos identificativos y de contacto:</strong> nombre, apellidos, correo electrónico, teléfono, país y dirección cuando realizas una compra o completas un formulario.</li>
          <li><strong>Datos de contratación:</strong> formación adquirida, importe, moneda, estado del pedido, descuentos y comunicaciones asociadas. Los datos completos de tarjeta son tratados por el proveedor de pago, no por TBS.</li>
          <li><strong>Datos de navegación:</strong> información técnica del dispositivo, dirección IP, país aproximado, cookies y eventos de uso, cuando estén activadas las tecnologías correspondientes.</li>
          <li><strong>Datos de soporte:</strong> la información que nos facilites al contactar con nuestro equipo.</li>
        </ul>
      </LegalSection>

      <LegalSection id="finalidades" title="3. Finalidades y base jurídica">
        <div className="legal-table-wrap">
          <table>
            <thead>
              <tr><th>Finalidad</th><th>Base jurídica</th></tr>
            </thead>
            <tbody>
              <tr><td>Gestionar pedidos, cobros, acceso a formaciones y comunicaciones necesarias para el servicio.</td><td>Ejecución de un contrato o aplicación de medidas precontractuales.</td></tr>
              <tr><td>Atender consultas, solicitudes de información e incidencias.</td><td>Consentimiento, medidas precontractuales o interés legítimo, según el caso.</td></tr>
              <tr><td>Enviar comunicaciones comerciales sobre cursos, clases o contenidos de TBS.</td><td>Consentimiento o interés legítimo cuando exista una relación previa y la ley lo permita. Podrás oponerte en cualquier momento.</td></tr>
              <tr><td>Mejorar el sitio, analizar su uso y medir campañas.</td><td>Consentimiento para cookies no necesarias, conforme a nuestra <Link href="/politica-de-cookies">Política de cookies</Link>.</td></tr>
              <tr><td>Cumplir obligaciones legales, fiscales, contables y de prevención del fraude.</td><td>Cumplimiento de obligaciones legales e interés legítimo de TBS.</td></tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="destinatarios" title="4. Destinatarios y transferencias internacionales">
        <p>
          No vendemos tus datos personales. Podrán acceder a ellos proveedores que
          nos prestan servicios y actúan, cuando corresponda, como encargados del
          tratamiento: alojamiento y tecnología, correo electrónico, gestión de
          relaciones con clientes, analítica, formularios y soporte.
        </p>
        <p>
          Para procesar una compra, los datos estrictamente necesarios pueden
          comunicarse al método de pago seleccionado, como Stripe, PayPal, seQura,
          Aplazame o dLocal. Cada proveedor trata los datos de acuerdo con sus propias
          condiciones y política de privacidad, particularmente cuando ofrece una
          modalidad de financiación.
        </p>
        <p>
          Algunos proveedores tecnológicos pueden estar ubicados fuera del Espacio
          Económico Europeo. En esos casos, TBS utilizará los mecanismos exigidos por
          la normativa aplicable, como decisiones de adecuación, cláusulas
          contractuales tipo u otras garantías válidas.
        </p>
      </LegalSection>

      <LegalSection id="conservacion" title="5. Conservación de los datos">
        <p>
          Conservaremos los datos mientras sean necesarios para la finalidad para la
          que se recabaron y, posteriormente, durante los plazos de prescripción de
          responsabilidades legales. Los datos de contratación y facturación se
          conservarán durante los plazos exigidos por la normativa fiscal y contable.
        </p>
        <p>
          Cuando el tratamiento se base en tu consentimiento, trataremos los datos
          hasta que lo retires, sin perjuicio de los datos que debamos conservar para
          atender obligaciones legales o reclamaciones.
        </p>
      </LegalSection>

      <LegalSection id="derechos" title="6. Tus derechos">
        <p>
          Puedes solicitar el acceso, rectificación, supresión, oposición, limitación
          del tratamiento y portabilidad de tus datos. También puedes retirar el
          consentimiento cuando esa sea la base jurídica del tratamiento, sin que ello
          afecte a la licitud del tratamiento previo.
        </p>
        <p>
          Para ejercerlos, escríbenos a <a href="mailto:tradersbusinessschool@gmail.com">tradersbusinessschool@gmail.com</a>,
          indicando el derecho que deseas ejercer. Podremos solicitar información
          adicional razonable para verificar tu identidad. Si consideras que el
          tratamiento no se ajusta a la normativa, puedes presentar una reclamación
          ante la <a href="https://www.aepd.es/" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>.
        </p>
      </LegalSection>

      <LegalSection id="seguridad" title="7. Seguridad y datos de menores">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger los datos
          frente a pérdida, alteración, acceso no autorizado o divulgación. Ningún
          sistema es completamente infalible; por ello, si detectas una incidencia
          relacionada con tus datos, te pedimos que nos lo comuniques cuanto antes.
        </p>
        <p>
          Nuestros servicios no se dirigen a menores de edad. Si detectamos que hemos
          recibido datos de un menor sin la autorización necesaria, procederemos a
          eliminarlos tan pronto como sea posible.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
