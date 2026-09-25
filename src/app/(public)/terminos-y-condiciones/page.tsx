import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de contratación y uso de las formaciones de Traders Business School.",
};

export default function TerminosYCondicionesPage() {
  return (
    <LegalPage
      eyebrow="Contratación"
      title="Términos y condiciones"
      description="Condiciones que regulan la compra de formaciones y el uso de los servicios de Traders Business School."
      updated="Última actualización: 23 de septiembre de 2026"
    >
      <LegalSection id="objeto" title="1. Objeto y aceptación">
        <p>
          Estas condiciones regulan la contratación de cursos, programas, recursos
          digitales y demás servicios ofrecidos por TRADER BUSINESS SCHOOL, S.L.
          (&ldquo;TBS&rdquo;). Al realizar un pedido, el cliente declara haber leído y
          aceptado estas condiciones, el <Link href="/aviso-legal">Aviso legal</Link>
          , la <Link href="/politica-de-privacidad">Política de privacidad</Link> y
          la <Link href="/politica-de-cookies">Política de cookies</Link>.
        </p>
        <p>
          Las características concretas, alcance, duración, modalidad, precio y, en
          su caso, requisitos de cada formación serán los indicados en la página de
          producto o en la oferta particular aceptada por el cliente.
        </p>
      </LegalSection>

      <LegalSection id="contratacion" title="2. Proceso de contratación">
        <ol>
          <li>El cliente selecciona la formación y revisa el precio, moneda y condiciones aplicables.</li>
          <li>Completa los datos solicitados y elige uno de los métodos de pago disponibles.</li>
          <li>Antes de confirmar el pago, puede revisar y corregir los datos introducidos.</li>
          <li>La contratación queda confirmada cuando TBS recibe la confirmación del pago o, para pagos pendientes, según la confirmación del proveedor correspondiente.</li>
          <li>El cliente recibirá la confirmación del pedido por correo electrónico en la dirección facilitada.</li>
        </ol>
        <p>
          TBS podrá no aceptar o cancelar un pedido cuando existan errores manifiestos
          de precio o disponibilidad, indicios razonables de fraude, imposibilidad de
          procesar el pago o incumplimiento de estas condiciones. En tal caso, se
          informará al cliente y, cuando proceda, se tramitará el reembolso.
        </p>
      </LegalSection>

      <LegalSection id="precios" title="3. Precios, impuestos y pagos">
        <p>
          Los precios, la moneda aplicable y cualquier descuento vigente se muestran
          antes de la compra. Salvo que se indique expresamente lo contrario, los
          importes incluyen los impuestos aplicables. TBS puede ofrecer métodos de
          pago de terceros; sus condiciones de financiación, aprobación o cobro se
          regirán también por los términos del proveedor elegido.
        </p>
        <p>
          El pago se procesa en entornos seguros de los proveedores habilitados.
          TBS no almacena los datos completos de tarjetas bancarias. Si se selecciona
          una modalidad de pago aplazado o financiado, la decisión y las condiciones
          de crédito corresponden al proveedor financiero.
        </p>
      </LegalSection>

      <LegalSection id="acceso" title="4. Acceso a las formaciones">
        <p>
          Una vez confirmado el pago, el cliente obtendrá acceso a los contenidos
          digitales conforme a la modalidad contratada. El acceso es personal,
          intransferible y limitado al cliente que realizó la compra, salvo que la
          oferta indique otra cosa.
        </p>
        <p>
          El cliente es responsable de disponer de conexión a internet, un dispositivo
          compatible y una dirección de correo válida. TBS podrá realizar ajustes
          razonables en la plataforma, contenidos, profesores o calendario cuando
          resulten necesarios para la correcta prestación del servicio, respetando en
          todo caso el valor esencial de la formación contratada.
        </p>
      </LegalSection>

      <LegalSection id="desistimiento" title="5. Derecho de desistimiento">
        <p>
          Cuando el cliente tenga la condición de consumidor, podrá ejercer los
          derechos que le reconozca la normativa aplicable. En la contratación de
          contenidos digitales no suministrados en soporte material, el derecho de
          desistimiento puede perderse cuando la ejecución haya comenzado con el
          consentimiento previo y expreso del consumidor y su reconocimiento de dicha
          pérdida, conforme al artículo 103.m) del Real Decreto Legislativo 1/2007.
        </p>
        <div className="legal-callout">
          <p>
            Antes de habilitar el acceso inmediato a una formación digital, se solicitará
            la aceptación expresa que corresponda. Si tienes dudas sobre tu pedido,
            escríbenos antes de iniciar el acceso al contenido.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="conducta" title="6. Uso de los contenidos">
        <p>
          Las formaciones se proporcionan para el aprendizaje personal del cliente.
          No está permitido compartir credenciales, grabar, copiar, distribuir,
          revender, publicar o poner a disposición de terceros los contenidos, salvo
          autorización previa y escrita de TBS.
        </p>
        <p>
          TBS podrá suspender o revocar el acceso cuando detecte un uso fraudulento,
          compartido o contrario a estas condiciones, sin perjuicio de las acciones
          legales que pudieran corresponder.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" title="7. Naturaleza formativa y responsabilidad">
        <p>
          Los programas de TBS tienen una finalidad exclusivamente educativa. No
          garantizan resultados económicos, rentabilidad, empleo ni la consecución de
          objetivos individuales. Las decisiones de inversión son responsabilidad
          exclusiva de quien las toma y deben adaptarse a su perfil, conocimientos y
          tolerancia al riesgo.
        </p>
        <p>
          Nada de lo publicado en las formaciones constituye asesoramiento financiero,
          de inversión, fiscal o jurídico personalizado. Los mercados financieros y
          los criptoactivos implican riesgos, incluida la posible pérdida total del
          capital invertido.
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="8. Contacto, reclamaciones y modificaciones">
        <p>
          Para consultas, incidencias o reclamaciones relacionadas con una compra,
          puedes escribir a <a href="mailto:info@tradersbusinessschool.com">info@tradersbusinessschool.com</a>.
          TBS responderá en el plazo razonable que corresponda a la naturaleza de la
          solicitud.
        </p>
        <p>
          TBS podrá actualizar estas condiciones para futuras contrataciones. La
          versión aplicable a cada pedido será la que estuviera publicada y aceptada
          en el momento de formalizarlo.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
