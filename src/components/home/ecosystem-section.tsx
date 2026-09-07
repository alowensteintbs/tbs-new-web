import Image from "next/image";
import { cn } from "@/lib/utils";

type EcosystemCardProps = {
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  title: string;
  description: string;
  tall?: boolean;
  titleClassName?: string;
};

function EcosystemCard({
  logo,
  logoAlt,
  logoWidth,
  logoHeight,
  title,
  description,
  tall = false,
  titleClassName,
}: EcosystemCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[220px] flex-col justify-between rounded-[24px] border-0 border-b-[3px] border-b-[#0066ff] bg-[#f0f0f0] p-6",
        tall ? "xl:h-[445px]" : "xl:min-h-0 xl:h-[143px] xl:flex-row",
      )}
    >
      <div className={cn("order-2 mt-12 xl:mt-0", !tall && "xl:order-1 xl:max-w-[338px]")}> 
        <h3 className={cn("font-space text-2xl font-bold leading-5 text-[#323436]", titleClassName)}>
          {title}
        </h3>
        <p
          className={cn(
            "mt-3 font-space text-xl leading-6 tracking-[-0.4px] text-[#323436]",
            !tall && "xl:leading-5",
          )}
        >
          {description}
        </p>
      </div>

      <Image
        src={logo}
        alt={logoAlt}
        width={logoWidth}
        height={logoHeight}
        className={cn("order-1 h-auto max-w-full object-contain object-left-top", !tall && "xl:order-2")}
      />
    </article>
  );
}

export function EcosystemSection() {
  return (
    <section className="tbs-grid-light relative z-10 rounded-[36px] px-4 py-20 xl:flex xl:h-[1132px] xl:items-center xl:px-10 xl:py-0">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="max-w-[998px] xl:w-[998px]">
          <h2 className="font-space text-5xl font-bold leading-[0.98] tracking-[-1px] text-tbs-ink xl:text-[82px] xl:leading-[80px] xl:tracking-[-1.64px]">
            Más que una escuela,
            <br />
            un ecosistema financiero.
          </h2>
          <p className="mt-[18px] max-w-[635px] font-raleway text-lg leading-5 text-tbs-ink xl:text-xl">
            Trabajamos junto a entidades referentes del sector para ofrecer una formación práctica,
            actualizada y conectada con la realidad.
          </p>
        </header>

        <div className="mt-[60px] grid gap-2 xl:grid-cols-2">
          <div className="grid gap-2 xl:grid-cols-2">
            <EcosystemCard
              tall
              logo="/home/ecosystem/renta4.svg"
              logoAlt="Renta 4 Banco"
              logoWidth={246}
              logoHeight={31}
              title="Socio estratégico"
              description="Aporta su experiencia y visión como uno de los referentes en el sector financiero de España."
            />
            <EcosystemCard
              tall
              logo="/home/ecosystem/utamed.svg"
              logoAlt="Universidad UTAMED"
              logoWidth={173}
              logoHeight={40}
              title="Certificación universitaria"
              description="Algunas formaciones cuentan con respaldo universitario, uniendo nuestro enfoque práctico con el reconocimiento."
            />
          </div>

          <div className="grid gap-2">
            <EcosystemCard
              logo="/home/ecosystem/zumitow.svg"
              logoAlt="Zumitow"
              logoWidth={127}
              logoHeight={26}
              title="Colaboración"
              description="Acercamos conocimiento a su newsletter para seguir haciendo de las inversiones algo accesible."
            />
            <EcosystemCard
              logo="/home/ecosystem/tradingview.svg"
              logoAlt="TradingView"
              logoWidth={184}
              logoHeight={24}
              title="Partner Educativo"
              description="Colaboramos con una de las plataformas de análisis financiero más utilizada en todo el mundo."
            />
            <EcosystemCard
              logo="/home/ecosystem/taxdown.svg"
              logoAlt="TaxDown"
              logoWidth={159}
              logoHeight={24}
              title="Colaboración"
              description="Contamos con sus expertos para impartir los módulos de fiscalidad incluidos en nuestros cursos."
            />
          </div>
        </div>

        <div className="mt-[60px] w-full overflow-hidden xl:hidden" aria-label="Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista">
          <div className="tbs-recognitions-track">
            {[0, 1, 2].map((copy) => (
              <Image
                key={copy}
                src="/home/ecosystem/reconocimientos.svg"
                alt={copy === 0 ? "Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista" : ""}
                aria-hidden={copy !== 0}
                width={1005}
                height={58}
                className="h-auto w-[700px] shrink-0 grayscale brightness-[0.35]"
              />
            ))}
          </div>
        </div>

        <div className="mt-[60px] hidden items-start gap-6 overflow-hidden xl:flex xl:items-center">
          <p className="shrink-0 font-playfair text-2xl italic leading-[18px] tracking-[-0.96px] text-tbs-ink">
            Reconocimientos:
          </p>
          <Image
            src="/home/ecosystem/reconocimientos.svg"
            alt="Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista"
            width={1005}
            height={58}
            className="h-auto w-[700px] max-w-none grayscale brightness-[0.35] xl:w-[1005px]"
          />
        </div>
      </div>
    </section>
  );
}
