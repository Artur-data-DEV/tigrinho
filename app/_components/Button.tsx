import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "indigo" | "green" | "red";
  loading?: boolean;
}

const colors = {
  indigo: "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50",
  green: "bg-green-600 hover:bg-green-700 disabled:opacity-50",
  red: "bg-red-600 hover:bg-red-700",
};

export default function Button({
  color = "indigo",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full py-3 rounded text-white ${colors[color]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
}
