import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
  columnsClassName?: string;
}

export default function ProductGridSkeleton({
  count = 6,
  columnsClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5",
}: ProductGridSkeletonProps) {
  return (
    <div className={columnsClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
