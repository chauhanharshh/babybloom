export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
      <h1 className="text-5xl font-bold text-primary mb-6 text-center font-script">Shop All</h1>
      <p className="text-center text-text/70 mb-12 max-w-2xl mx-auto">Browse our complete collection of premium baby and kids wear.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="aspect-[3/4] bg-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary/30">
          <p className="text-text/50 font-medium">Products coming soon</p>
        </div>
      </div>
    </div>
  );
}
