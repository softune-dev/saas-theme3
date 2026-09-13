import type { Metadata } from "next";
import { NotFoundContent } from "@/components/ui/NotFoundContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Page Not Found | Ananya Lifestyle",
    description: "The page you are looking for does not exist.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Explicit404Page() {
  return <NotFoundContent />;
}
