import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Restaurant } from "@/types/database";

interface MainLayoutProps {
  children: ReactNode;
  restaurant?: Restaurant;
  tableNumber?: string;
}

export function MainLayout({
  children,
  restaurant,
  tableNumber,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header restaurant={restaurant} tableNumber={tableNumber} />

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <Footer restaurant={restaurant} />
    </div>
  );
}
