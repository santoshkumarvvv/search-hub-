import Browser from "@/components/Browser";

export const metadata = {
  title: "Indexed Catalog",
  description: "Explore the live 52-record indexed catalog powered by Web Worker Okapi BM25 and typo-tolerant ranking.",
};

export default function CatalogPage() {
  return <Browser />;
}
