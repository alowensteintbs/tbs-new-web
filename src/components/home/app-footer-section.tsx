import Image from "next/image";

const linkColumns = [
  { title: "Escuela de finanzas 360º", links: ["Curso de Acciones Avanzado", "Curso de Criptomonedas Avanzado", "Curso Trading Avanzado", "Máster en trading algorítmico con IA", "Pack de Inversión Premium", "Ver todos los cursos"] },
  { title: "Nuestras clases gratuitas", links: ["Curso de Finanzas Personales", "Curso de Trading gratis", "Curso de Trading Algorítmico gratis", "Curso de Bolsa gratis", "Curso de Criptomonedas gratis"] },
  { title: "Avisos & otros", links: ["Opiniones de Traders Business School", "Aviso legal", "Privacidad", "Cookies", "Términos y condiciones", "Resolución de litigios en línea", "Aviso Legal de Criptomonedas"] },
];

const footerSocialLinks = [
  { name: "Instagram", icon: "instagram", href: "https://www.instagram.com/traders_business_school" },
  { name: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@tradersbs" },
  { name: "YouTube", icon: "youtube", href: "https://www.youtube.com/@tradersbusinessschool7149" },
  { name: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/company/traders-business-school" },
  { name: "Telegram", icon: "telegram", href: "#" },
];

function StoreBadge({ store }: { store: "app-store" | "google-play" }) {
  const isAppStore = store === "app-store";

  return (
    <a
      href={
        isAppStore
          ? "https://apps.apple.com/il/app/traders-business-school/id6785884608"
          : "https://play.google.com/store/apps/details?id=es.tbsweb.tbs_mobile_app&hl=es_AR"
      }
      target="_blank"
      rel="noreferrer"
      aria-label={isAppStore ? "Descargar en App Store" : "Descargar en Google Play"}
      className="inline-flex h-7 items-center gap-1.5 rounded-[4px] border border-[#f7f7f7] bg-[#f7f7f7]/20 px-2.5 font-space text-[11px] font-bold leading-none text-[#f7f7f7]"
    >
      <Image
        src={isAppStore ? "/home/app-store.svg" : "/home/google-play-color.svg"}
        alt=""
        width={13}
        height={isAppStore ? 13 : 15}
        className={isAppStore ? "size-[13px]" : "h-[15px] w-[13px]"}
      />
      {isAppStore ? "Apple Store" : "Play Store"}
    </a>
  );
}

type AppFooterSectionProps = {
  showAppPromo?: boolean;
};

export function AppFooterSection({ showAppPromo = true }: AppFooterSectionProps) {
  return (
    <>
      {showAppPromo && <section className="px-4 pt-20 xl:h-[965px] xl:px-10 xl:pt-[60px]">
        <div className="mx-auto max-w-[1200px] text-center">
          <span className="inline-flex h-7 items-center rounded-full bg-[#e1ff3b] px-3 font-mono text-xs font-bold uppercase text-[#101012]">App gratis</span>
          <h2 className="mx-auto mt-9 max-w-[720px] font-space text-[32px] font-bold leading-[.92] tracking-[-1.2px] text-[#e6f0ff] xl:text-[66px] xl:leading-[56px]">
            Lo que necesitas para<br />entender cómo invertir,<br /><em className="font-playfair font-normal">en una sola app.</em>
          </h2>
          <div className="mt-9 flex flex-col items-center gap-4 font-space text-white xl:flex-row xl:justify-center xl:gap-2">
            <div className="order-2 flex items-center gap-2 xl:order-1">
              <strong className="text-xl">5,0</strong><span className="text-xl tracking-[2px] text-[#ffbe0a]">★★★★★</span>
            </div>
            <div className="order-1 flex items-center gap-2 xl:order-2">
              <StoreBadge store="app-store" />
              <StoreBadge store="google-play" />
            </div>
          </div>
          <div className="tbs-checkerboard mt-12 h-[300px] rounded-[40px] xl:h-[459px]" aria-label="Vista previa de la aplicación" />
        </div>
      </section>}

      <footer className="px-4 pb-[100px] pt-[100px] xl:h-[666px] xl:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-7 border-b border-white pb-6 md:flex-row md:items-center md:justify-between">
            <Image src="/home/logo-traders.svg" alt="Traders Business School" width={153} height={40} className="h-10 w-[153px]" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-[29px] w-[162px] items-center justify-center gap-1 rounded-[8px] border border-[#ff0a54] bg-[#ff0a54]/20 px-2 py-1.5 font-space text-[11px] font-bold text-[#ff0a54]">Descarga nuestra app</span>
              <nav aria-label="Redes sociales" className="flex items-center gap-3">
                {footerSocialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.name}
                    className="grid size-4 place-items-center transition-opacity hover:opacity-75"
                  >
                    <Image src={`/home/footer-social/${social.icon}.svg`} alt="" width={16} height={16} className="size-4 object-contain" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {linkColumns.map((column) => (
              <section
                key={column.title}
                className="min-h-[284px] rounded-[20px] bg-black/40 p-5"
              >
                <h3 className="font-raleway text-base font-semibold text-white">{column.title}</h3>
                <ul className="mt-5 space-y-2">
                  {column.links.map((link) => <li key={link} className="font-raleway text-sm font-semibold leading-4 text-white">{link}</li>)}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[892px] font-raleway text-xs leading-3 text-white">
              La inversión en criptoactivos no está regulada, puede no ser adecuada para inversores minoristas y perderse la totalidad del importe invertido.<br />Es importante leer y comprender los riesgos de esta inversión que se explican detalladamente en <span className="text-[#ff0a54]">esta ubicación.</span>
            </p>
            <div className="flex items-end gap-4">
              <Image src="/home/app-footer/aen.png" alt="AEN" width={142} height={59} className="h-auto w-[142px]" />
              <Image src="/home/app-footer/euphe.png" alt="EUPHE" width={126} height={57} className="h-auto w-[126px]" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
