import CategoryListingSkeleton from "@/components/skeletons/CategoryListingSkeleton";

export default function ShopLoading() {
  return <CategoryListingSkeleton titlePlaceholder="All Collections" count={8} />;
}
