// "use client";

// import GoogleTranslate from "./GoogleTranslate";
// import LanguagePopup from "./LanguagePopup";

// export default function ClientProviders({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <>
//       <GoogleTranslate />
//       <LanguagePopup />
//       {children}
//     </>
//   );
// }





"use client";

import GoogleTranslate from "./GoogleTranslate";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleTranslate />
      {children}
    </>
  );
}
