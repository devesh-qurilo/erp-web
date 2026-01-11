"use client";

import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ur", label: "اردو" },
];

export default function LanguagePopup() {
  const [open, setOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
    setOpen(false);
  };

  return (
    <div className="lang-container">
      <button className="lang-fab" onClick={() => setOpen(!open)}>
        🌐
      </button>

      {open && (
        <div className="lang-popup">
          {languages.map((l) => (
            <button key={l.code} onClick={() => changeLanguage(l.code)}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
