import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Baby & Kids Clothes – Frocks, Rompers, Co-ord Sets & More",
  description:
    "Search BabyBloom's collection of baby and kids clothing by style, category, or age group. Find cotton rompers, party frocks, boys sets, hoodies & winter wear.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Search Baby & Kids Clothes | BabyBloom",
    description:
      "Search BabyBloom's collection of baby and kids clothing by style, category, or age group.",
    url: "/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

