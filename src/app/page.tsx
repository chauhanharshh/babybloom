import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0; // Always fetch fresh data

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CartDrawer />
      
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden relative w-full">
        <div className="absolute top-0 right-10 opacity-20">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" fill="#f08fa4"/>
          </svg>
        </div>
        <div className="absolute bottom-10 left-10 opacity-20">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" fill="#a82b54"/>
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-8">
          <div>
            <div className="inline-block bg-secondary/10 px-4 py-2 rounded-full mb-6 border border-secondary/20 backdrop-blur-sm shadow-sm">
              <span className="text-primary font-semibold text-sm tracking-wide">♡ PREMIUM BABY & KIDS WEAR</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary leading-tight">
              <span className="font-script text-6xl md:text-8xl text-secondary block -mb-4 tracking-wide font-normal">Little</span>
              LOOKS,<br />
              BIG <span className="font-script text-6xl md:text-8xl text-primary font-normal">Smiles</span>
            </h1>
            
            <p className="mt-8 text-xl md:text-2xl text-text/80 leading-relaxed font-medium">
              Everyday outfits for your <span className="text-primary font-bold">little trendsetters.</span>
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-[0_4px_14px_0_rgb(168,43,84,0.39)] hover:shadow-[0_6px_20px_rgba(168,43,84,0.23)] hover:-translate-y-1 transition-all duration-300">
                Shop Collection
              </button>
              <button className="bg-white text-primary px-8 py-4 rounded-full font-bold shadow-sm border border-secondary/20 hover:bg-secondary/5 transition-all duration-300">
                View Newborn
              </button>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full hidden lg:block">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-10 w-1/2 h-1/2 bg-primary/20 rounded-full blur-3xl"></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full p-4">
               <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                 <Image 
                   src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80" 
                   alt="Cute baby clothes" 
                   fill 
                   className="object-cover"
                 />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex-1 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text">New Arrivals</h2>
            <p className="text-secondary mt-2 font-script text-2xl tracking-wide">Fresh looks for the season</p>
          </div>
          <Link href="/shop" className="hidden sm:block text-primary font-semibold hover:underline">
            View All →
          </Link>
        </div>
        
        {dbProducts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="aspect-[3/4] bg-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary/30 col-span-full">
              <p className="text-text/50 font-medium">No products yet — add some from the Admin panel!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {dbProducts.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  id: product.id.toString(),
                  imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600',
                }}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Decorative wavy border bottom */}
      <div className="w-full h-16 bg-white border-t-0" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', marginTop: 'auto', borderBottom: 'none' }}></div>
      <Footer />
    </main>
  );
}
