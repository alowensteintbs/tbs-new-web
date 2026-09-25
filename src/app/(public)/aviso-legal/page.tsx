import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Información legal y condiciones generales de uso de Traders Business School.",
};

export default function AvisoLegalPage() {
  return (
    <LegalPage
      eyebrow="Información legal"
      title="Aviso legal"
      description="Información general, reglas de uso y condiciones aplicables a la navegación por Traders Business School."
      updated="Última actualización: 23 de septiembre de 2026"
    >
      <LegalSection id="titularidad" title="1. Titularidad del sitio web">
        <p>
          En cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la
          sociedad de la información y de comercio electrónico, se informa de que
          este sitio web es titularidad de <strong>TRADER BUSINESS SCHOOL, S.L.</strong>
          , con NIF <strong>B90424938</strong>.
        </p>
        <ul>
          <li><strong>Domicilio:</strong> Avenida República Argentina, 15, planta 9, 41011 Sevilla, España.</li>
          <li><strong>Inscripción registral:</strong> Registro Mercantil de Sevilla, tomo 6691, folio 85, inscripción 1, hoja SE121280.</li>
          <li><strong>Correo electrónico:</strong> <a href="mailto:tradersbusinessschool@gmail.com">tradersbusinessschool@gmail.com</a>.</li>
          <li><strong>Dominio:</strong> tradersbusinessschool.com.</li>
        </ul>
      </LegalSection>

      <LegalSection id="objeto" title="2. Objeto y acceso al sitio">
        <p>
          Este sitio web tiene por objeto presentar la oferta formativa, los
          contenidos y los servicios de Traders Business School, así como facilitar
          la contratación de formaciones y el acceso a recursos educativos.
        </p>
        <p>
          El acceso al sitio es, con carácter general, libre y gratuito. La
          contratación de productos o servicios, el acceso al aula virtual y otros
          recursos podrán estar sujetos a condiciones particulares, precio o registro
          previo, que se pondrán a disposición del usuario antes de su contratación.
        </p>
      </LegalSection>

      <LegalSection id="uso" title="3. Uso correcto del sitio">
        <p>
          Al navegar por este sitio adquiere la condición de usuario y acepta este
          aviso legal. El usuario se compromete a utilizar los contenidos, formularios
          y servicios de forma diligente, lícita y respetuosa con la normativa,
          los derechos de terceros y el orden público.
        </p>
        <ul>
          <li>No podrá emplear el sitio para introducir software malicioso, interferir en su funcionamiento o acceder sin autorización a sistemas, cuentas o datos.</li>
          <li>La información remitida mediante formularios deberá ser veraz, exacta y actualizada.</li>
          <li>El usuario será responsable de custodiar sus credenciales de acceso y de comunicar cualquier uso no autorizado.</li>
          <li>El sitio no se dirige a menores de edad. El usuario declara disponer de capacidad jurídica suficiente para aceptar estas condiciones y, cuando corresponda, contratar.</li>
        </ul>
      </LegalSection>

      <LegalSection id="responsabilidad" title="4. Disponibilidad y responsabilidad">
        <p>
          Traders Business School procura que el sitio, sus contenidos y sus
          servicios estén disponibles y actualizados. Sin embargo, no garantiza la
          inexistencia de interrupciones, errores o elementos que puedan afectar a la
          disponibilidad del servicio, especialmente cuando dependan de redes de
          telecomunicaciones, dispositivos del usuario o terceros proveedores.
        </p>
        <p>
          Los contenidos educativos e informativos publicados en el sitio no
          constituyen asesoramiento financiero, de inversión, fiscal, legal ni una
          recomendación personalizada. Cada usuario deberá valorar su situación y,
          cuando sea necesario, recurrir a profesionales cualificados antes de tomar
          decisiones económicas o de inversión.
        </p>
      </LegalSection>

      <LegalSection id="enlaces" title="5. Enlaces externos">
        <p>
          El sitio puede incluir enlaces a páginas, plataformas o recursos de terceros
          para facilitar información o el acceso a determinados servicios. Traders
          Business School no controla sus contenidos, disponibilidad, políticas o
          condiciones, por lo que el acceso a dichos enlaces se realizará bajo la
          responsabilidad del usuario.
        </p>
        <p>
          La creación de enlaces hacia este sitio no autoriza a utilizar sus marcas,
          contenidos o elementos gráficos sin autorización previa y por escrito de
          Traders Business School.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title="6. Propiedad intelectual e industrial">
        <p>
          Los contenidos del sitio, incluidos textos, vídeos, imágenes, marcas,
          logotipos, diseños, código y materiales formativos, están protegidos por la
          normativa de propiedad intelectual e industrial. Corresponden a Traders
          Business School o a terceros que han autorizado su uso.
        </p>
        <p>
          Queda prohibida su reproducción, distribución, transformación, comunicación
          pública o explotación comercial, total o parcial, sin autorización previa y
          por escrito. El usuario podrá utilizarlos únicamente para fines personales y
          conforme a los derechos de acceso que, en su caso, haya contratado.
        </p>
      </LegalSection>

      <LegalSection id="ley" title="7. Ley aplicable y jurisdicción">
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier
          controversia relacionada con el sitio web, serán competentes los juzgados y
          tribunales que correspondan conforme a la normativa aplicable, sin perjuicio
          de los derechos que la legislación de consumidores reconozca al usuario.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
