import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#0a0f1e] px-6 text-center">
      <Image
        src="/Logo-white-1.svg"
        alt="Traders Business School"
        width={220}
        height={58}
        priority
      />
    
      <p className="max-w-md text-base text-gray-400">
        Estamos construyendo la nueva web.
      </p>
    </div>
  );
}
