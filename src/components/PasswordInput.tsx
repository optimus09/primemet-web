"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";

export default function PasswordInput({
  className,
  autoComplete,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoComplete={autoComplete ?? "current-password"}
        {...props}
        type={visible ? "text" : "password"}
        className={`${className ?? ""} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted hover:text-foreground"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
