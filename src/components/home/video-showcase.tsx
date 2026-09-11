import Image from "next/image";
import { YoutubeVideoEmbed } from "./youtube-video-embed";

export function PartnersStrip() {
  return (
    <div className="relative h-[18px] w-full shrink-0 overflow-hidden xl:h-[27px]" aria-label="Empresas colaboradoras">
      <div className="tbs-partners-track h-[18px] xl:h-[27px]">
        {[0, 1, 2, 3, 4].map((copy) => (
          <div
            key={copy}
            className="relative h-[18px] w-[570px] shrink-0 overflow-hidden xl:h-[27px] xl:w-[843px]"
          >
            <Image
              src="/home/alianzas.svg"
              alt={copy === 0 ? "ED, Taxdown, Zumitow, Renta4Banco, TradingView y UTAMED" : ""}
              aria-hidden={copy !== 0}
              width={2478}
              height={27}
              className="absolute left-0 top-0 h-[18px] w-[1676px] max-w-none xl:h-[27px] xl:w-[2478px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoShowcase({
  showPartners = true,
  poster = "https://i.ytimg.com/vi/4nfPF4XUc7M/sddefault.jpg",
  className = "",
}: {
  showPartners?: boolean;
  poster?: string;
  className?: string;
}) {
  return (
    <section className={`flex h-[521px] w-full flex-col gap-[10px] rounded-[40px] bg-white/10 p-2 backdrop-blur-sm xl:h-auto xl:gap-5 ${className}`}>
      <div className="relative h-[477px] w-full shrink-0 overflow-hidden rounded-[32px] xl:h-auto xl:aspect-[1424/801]">
        <YoutubeVideoEmbed poster={poster} />
      </div>
      {showPartners && <PartnersStrip />}
    </section>
  );
}
