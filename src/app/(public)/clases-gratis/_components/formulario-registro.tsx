import type { ClaseGratis } from "./contenido";

export function FormularioRegistro({ clase, ubicacion = "inicio" }: { clase: ClaseGratis; ubicacion?: string }) {
  const id = `registro-${clase.slug}-${ubicacion}`;

  return (
    <form
      className="w-full rounded-[32px] border-2 border-[#0066ff] bg-[#0066ff]/20 p-[22px] backdrop-blur-[2px] [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-offset-2 [&_input]:focus-visible:outline-white [&_select]:focus-visible:outline-2 [&_select]:focus-visible:outline-white"
      aria-label={`Inscripción a ${clase.nombre}`}
    >
      <div className="space-y-2">
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-nombre`}>
          Nombre y apellidos*
          <input id={`${id}-nombre`} name="nombre" autoComplete="name" className="mt-1 h-11 w-full rounded-lg border border-[#0066ff] bg-[#0066ff]/10 px-4 font-raleway font-normal text-white outline-none" />
        </label>
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-correo`}>
          Correo*
          <input id={`${id}-correo`} name="correo" type="email" autoComplete="email" className="mt-1 h-11 w-full rounded-lg border border-[#0066ff] bg-[#0066ff]/10 px-4 font-raleway font-normal text-white outline-none" />
        </label>
        <label className="block font-space text-xs font-bold tracking-[.03em] text-[#3f83ff]" htmlFor={`${id}-telefono`}>
          Número de teléfono*
          <span className="mt-1 flex h-11 overflow-hidden rounded-lg border border-[#0066ff] bg-[#0066ff]/10">
            <select aria-label="País del teléfono" defaultValue="+34" className="w-[118px] border-r border-[#0066ff] bg-transparent px-3 font-raleway font-semibold text-white outline-none">
              <option className="bg-[#121214]" value="+34">España</option>
              <option className="bg-[#121214]" value="+54">Argentina</option>
              <option className="bg-[#121214]" value="+52">México</option>
              <option className="bg-[#121214]" value="+57">Colombia</option>
              <option className="bg-[#121214]" value="+56">Chile</option>
            </select>
            <input id={`${id}-telefono`} name="telefono" type="tel" autoComplete="tel" placeholder="+34" className="min-w-0 flex-1 bg-transparent px-4 font-raleway font-normal text-white outline-none placeholder:text-white/45" />
          </span>
        </label>
      </div>

      <label className="my-8 flex items-center gap-2 font-raleway text-xs leading-4 text-white">
        <input type="checkbox" className="size-[18px] shrink-0 appearance-none rounded-[1px] border border-white bg-transparent checked:bg-[#0066ff]" />
        <span>He leído y acepto los <span className="underline">Términos y condiciones</span> y la <span className="underline">Política de privacidad</span>*</span>
      </label>

      <button
        type="button"
        aria-disabled="true"
        className="flex h-11 w-full items-center justify-center rounded-full bg-[#0066ff] font-raleway text-lg font-bold text-white"
      >
        Apuntarme ahora
      </button>
      <p className="sr-only">El envío de este formulario se conectará en una próxima etapa.</p>
    </form>
  );
}
