import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>;
}

/**
 * Labeled form field with built-in error display. Wraps a single input
 * (`<input>` by default) and shows the matching Zod field error.
 */
export function Field({
  label,
  name,
  errors,
  children,
  ...inputProps
}: {
  label: string;
  name: string;
  errors?: string[];
  children?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children ?? <input name={name} className={inputCls} {...inputProps} />}
      <FieldError errors={errors} />
    </div>
  );
}
