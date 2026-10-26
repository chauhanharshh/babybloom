import { MapPin, Mail, Phone, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getStoreProfile } from "@/lib/profile";

const Facebook = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YouTube = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default async function Footer() {
  const profile = await getStoreProfile();
  return (
    <footer className="bg-white border-t border-pink-100 flex flex-col">
      {/* Top Footer Columns (Hidden on mobile to match the app-like reference mockup) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-pink-100/60 shadow-2xs flex-shrink-0">
                <Image
                  src="/icons/apple-touch-icon.png"
                  alt="Babybloom Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold text-[#ff2b75]">Babybloom</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Everyday outfits for your little trendsetters. Premium baby and kids wear for ages 0 to 6 years with safe, gentle fabrics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 font-medium">
              <li><Link href="/" className="hover:text-[#ff2b75] transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-[#ff2b75] transition-colors">Shop All Collection</Link></li>
              <li><Link href="/newborn" className="hover:text-[#ff2b75] transition-colors">Baby Wear (Newborn)</Link></li>
              <li><Link href="/girls" className="hover:text-[#ff2b75] transition-colors">Girls Wear</Link></li>
              <li><Link href="/boys" className="hover:text-[#ff2b75] transition-colors">Boys Wear</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Customer Care</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 font-medium">
              <li><Link href="/shipping-returns" className="hover:text-[#ff2b75] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-[#ff2b75] transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="hover:text-[#ff2b75] transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#ff2b75] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#ff2b75] shrink-0 mt-0.5" />
                <span>
                  {[profile.addressLine1, profile.city, profile.state].filter(Boolean).join(", ") || "Haridwar, Uttarakhand, India"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#ff2b75] shrink-0" />
                <a href={`tel:${profile.phone}`} className="hover:text-[#ff2b75] transition-colors">
                  {profile.phone || "+91 95200 42719"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#ff2b75] shrink-0" />
                <a href={`mailto:${profile.email}`} className="hover:text-[#ff2b75] transition-colors">
                  {profile.email || "babybloom.bb2024@gmail.com"}
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Reference Image Pink Location & Social Bar (Single row with vertical divider matching mockup) */}
      <div className="bg-[#ff2b75] text-white py-2 px-3 sm:px-8 border-t border-pink-400/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 text-[10px] sm:text-xs">
          
          {/* Location info from image */}
          <div className="flex items-center gap-1.5 font-medium flex-1 truncate pr-2 border-r border-white/30">
            <MapPin size={13} className="text-white shrink-0" />
            <span className="truncate">
              {[profile.addressLine1, profile.addressLine2, profile.city].filter(Boolean).join(" | ") || "Khanna Nagar | House no. 41 | Opposite Kaushik Academy"}
            </span>
          </div>

          {/* Social Icons matching mockup */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pl-1">
            <span className="font-bold text-[10px] sm:text-xs whitespace-nowrap">Follow Us:</span>
            <div className="flex items-center gap-1.5">
              <a 
                href={profile.facebookUrl || "https://facebook.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="Facebook"
              >
                <Facebook size={11} />
              </a>
              <a 
                href={profile.instagramUrl || "https://instagram.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="Instagram"
              >
                <Instagram size={11} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FF0000] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                title="YouTube"
              >
                <YouTube size={11} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

