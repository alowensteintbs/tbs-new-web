import Image from "next/image";

const courses = [
  { title: "Trading desde cero", image: "trading-symbol.png" },
  { title: "Cripto desde cero", image: "crypto-symbol.png" },
  { title: "Trading con IA", image: "ai-symbol.png" },
  { title: "Acciones y Bolsa", image: "stocks-symbol.png" },
];

export function FreeCoursesSection() {
  return (
    <section id="clases-gratis" className="px-4 pt-20 xl:h-[812px] xl:px-10 xl:pt-[160px]">
      <div className="mx-auto max-w-[1200px]">
        <span className="inline-flex h-7 items-center rounded-full border border-white bg-white/10 px-3 font-mono text-xs font-bold uppercase text-white">Clases gratuitas</span>
        <h2 className="mt-3 font-raleway text-4xl font-extrabold leading-none tracking-[-1px] text-[#f4f4f5] xl:text-[46px]">¿Quieres ver cómo enseñamos?</h2>
        <p className="mt-3 font-raleway text-xl leading-6 text-white">Empieza con una clase gratis.</p>
        <div className="tbs-course-track mt-[42px] flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory">
          {courses.map((course) => (
            <article
              key={course.title}
              className="relative h-[462px] w-[294px] shrink-0 snap-start overflow-hidden rounded-[28px] border-[6px] border-white/10 bg-clip-padding p-3 shadow-[0_11px_12px_rgba(0,0,0,.25)] backdrop-blur-[4px]"
              style={{
                backgroundImage: "linear-gradient(180deg, rgba(0, 0, 0, 0) 47.48%, #000000 100%), radial-gradient(100% 100% at 100% 0%, #11E07F 0%, rgba(9, 122, 69, 0) 100%), radial-gradient(100% 100% at 100% 0%, #11E07F 0%, rgba(9, 122, 69, 0) 100%)",
              }}
            >
              <Image src={`/home/courses/${course.image}`} alt="" width={294} height={230} className="absolute -left-[6px] -top-[6px] h-[230px] w-[294px] max-w-none" />
              <div className="absolute inset-x-[6px] bottom-[6px]">
                <span className="inline-flex h-7 items-center rounded-full border-2 border-[#92f1c4] px-[14px] font-space text-sm font-bold leading-4 uppercase text-[#92f1c4]">Gratis</span>
                <h3 className="mt-4 font-space text-[28px] font-bold leading-6 tracking-[-.5px] text-[#f4f4f5]">{course.title}</h3>
                <p className="mt-4 min-h-9 font-raleway text-xs leading-3 text-[#f4f4f5]">Accede al mundo de la inversión en bolsa y consigue moverte con soltura en este mercado diario.</p>
                <div className="mt-4 flex h-8 items-center justify-center rounded-full bg-[#f7f7f7] font-raleway text-base font-bold text-[#1f1e23]">Asistir al curso</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
