import { signOut } from "@/app/admin/(auth)/login/actions";
import { getUser } from "@/lib/auth/dal";

export async function Topbar({ title }: { title: string }) {
  const user = await getUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {user?.name?.charAt(0).toUpperCase() ?? "A"}
        </div>

        {/* Logout */}
        <form action={signOut}>
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            title="Cerrar sesión"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
