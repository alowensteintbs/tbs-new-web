import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin — TBS",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex" style={{ background: "#000" }}>
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse at right center, #0066FFB8 0%, #000000 65%)" }}
        />

        {/* Diagonal lines pattern */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonals" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <line x1="0" y1="24" x2="24" y2="0" stroke="white" strokeWidth="0.5" strokeOpacity="0.07" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonals)" />
        </svg>

        {/* Content */}
        <div className="relative flex w-full flex-col justify-between p-12">
          <Image
            src="/Logo-white-1.svg"
            alt="Traders Business School"
            width={140}
            height={37}
            priority
          />
          <p className="text-xs text-[#ffffff33]">© {new Date().getFullYear()} Traders Business School</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex items-center justify-center rounded-xl bg-[#0D1424] px-6 py-3">
              <Image
                src="/Logo-white-1.svg"
                alt="Traders Business School"
                width={120}
                height={32}
                priority
              />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-gray-500">Ingresá con tu cuenta de administrador</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-gray-400">
            Acceso restringido al equipo de TBS
          </p>
        </div>
      </div>
    </main>
  );
}
