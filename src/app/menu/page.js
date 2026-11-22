import { Suspense } from "react";
import BrowseMenu from "@/components/menu/BrowseMenu";

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-12 text-center">
          Loading menu...
        </div>
      }
    >
      <BrowseMenu />
    </Suspense>
  );
}