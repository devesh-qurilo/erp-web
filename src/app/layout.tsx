
// src/app/layout.tsx
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
  
       {children}
   
      </body>
    </html>
  );
}

