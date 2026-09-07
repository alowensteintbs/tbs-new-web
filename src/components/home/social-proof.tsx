import Image from "next/image";

function RatingBadge() {
  return (
    <div className="flex h-[44px] w-[175px] shrink-0 items-center gap-[10px] rounded-[12px] border border-tbs-ink px-3 py-1.5 font-raleway text-tbs-ink xl:h-[55px] xl:w-auto xl:gap-3 xl:rounded-[14px] xl:px-4 xl:py-2">
      <div className="flex flex-col items-center gap-1">
        <strong className="text-[17.57px] leading-[16px] tracking-[-0.7px] xl:text-[21.47px] xl:leading-[20px] xl:tracking-[-0.86px]">
          Google
        </strong>
        <div className="flex h-[12px] items-center gap-[0.7px] xl:h-[14px] xl:gap-[0.85px]">
          <Image src="/home/estrella-inicial.svg" alt="" width={13} height={14} className="h-full w-[11px] xl:w-[13px]" />
          {[0, 1, 2].map((star) => (
            <Image key={star} src="/home/estrella.svg" alt="" width={13} height={14} className="h-full w-[11px] xl:w-[13px]" />
          ))}
          <Image src="/home/media-estrella.svg" alt="" width={6} height={12} className="h-[11px] w-[5px] xl:h-[12px] xl:w-[6px]" />
        </div>
      </div>

      <span className="relative h-[31px] w-px xl:h-[39px]" aria-hidden="true">
        <span
          className="absolute left-1/2 top-1/2 h-px w-[31px] -translate-x-1/2 -translate-y-1/2 rotate-90 bg-[length:100%_100%] xl:w-[39px]"
          style={{ backgroundImage: "url('/home/separador-rating.svg')" }}
        />
      </span>

      <div className="flex flex-col items-center gap-1">
        <strong className="text-[17.57px] leading-[16px] tracking-[-0.7px] xl:text-[21.47px] xl:leading-[20px] xl:tracking-[-0.86px]">
          Trustpilot
        </strong>
        <span className="block h-[14px] w-[63px] overflow-hidden">
          <Image
            src="/home/trustpilot-estrellas.svg"
            alt="Cuatro estrellas y media en Trustpilot"
            width={63}
            height={14}
            className="block h-[14px] w-[63px] max-w-none"
          />
        </span>
      </div>
    </div>
  );
}

function StudentCount() {
  return (
    <div className="relative h-[65px] w-[177px] shrink-0 font-bold text-tbs-ink xl:flex xl:h-auto xl:w-auto xl:items-center xl:gap-2">
      <strong className="absolute left-0 top-0 whitespace-nowrap font-space text-[52.8px] leading-[46px] tracking-[-2.1px] xl:static xl:text-[56px] xl:leading-[49px] xl:tracking-[-2.24px]">
        + 7.000
      </strong>
      <span className="absolute bottom-0 right-0 whitespace-nowrap font-raleway text-[clamp(19px,5.85vw,23px)] leading-4 xl:static xl:text-[24.4px]">
        alumnos.
      </span>
    </div>
  );
}

export function SocialProof() {
  return (
    <div className="flex h-[65px] w-[361px] max-w-none origin-left items-center justify-between gap-0 max-[389px]:scale-[.95] xl:h-auto xl:w-auto xl:justify-center xl:gap-[22px]">
      <div className="order-2 xl:order-1">
        <StudentCount />
      </div>
      <div className="order-1 xl:order-2">
        <RatingBadge />
      </div>
    </div>
  );
}
