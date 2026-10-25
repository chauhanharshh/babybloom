import CategoryListingSkeleton from "@/components/skeletons/CategoryListingSkeleton";

export default function DynamicCategoryLoading() {
  return <CategoryListingSkeleton titlePlaceholder="Category" count={8} />;
}
