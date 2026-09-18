import { MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-secondary/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-script text-3xl text-secondary mr-2">Baby Bloom</span>
            </div>
            <p className="text-text/70 text-sm leading-relaxed">
              Everyday outfits for your little trendsetters. Premium baby and kids wear for ages 1 to 6 years.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-primary hover:text-secondary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-primary hover:text-secondary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary hover:text-secondary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-text mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-text/70 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/shop" className="text-sm text-text/70 hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link href="/boys" className="text-sm text-text/70 hover:text-primary transition-colors">Boys</Link></li>
              <li><Link href="/girls" className="text-sm text-text/70 hover:text-primary transition-colors">Girls</Link></li>
              <li><Link href="/newborn" className="text-sm text-text/70 hover:text-primary transition-colors">Newborn</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-bold text-text mb-4">Customer Care</h3>
            <ul className="space-y-3">
              <li><Link href="/shipping-returns" className="text-sm text-text/70 hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/size-guide" className="text-sm text-text/70 hover:text-primary transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="text-sm text-text/70 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-text/70 hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-text mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
                <span className="text-sm text-text/70">
                  Old Ranipur More<br />
                  Haridwar, Uttarakhand<br />
                  India
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary mr-3 flex-shrink-0" />
                <span className="text-sm text-text/70">+91 95200 42719</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary mr-3 flex-shrink-0" />
                <span className="text-sm text-text/70">hello@babybloom.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-secondary/20 text-center flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text/50">
            © {new Date().getFullYear()} Baby Bloom. All rights reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0 text-sm text-text/50">
            Made with <span className="text-primary">♥</span> for little ones
          </div>
        </div>
      </div>
    </footer>
  );
}
