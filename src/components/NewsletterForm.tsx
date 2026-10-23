"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <div className="w-full lg:max-w-md">
      {subscribed ? (
        <div className="bg-white/90 text-[#ff2b75] font-bold text-xs sm:text-sm px-6 py-3 rounded-full text-center shadow-xs border border-pink-200">
          🎉 Thank you for subscribing to Babybloom!
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-pink-200"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email Address"
            className="flex-1 px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#ff2b75] hover:bg-[#e01d62] text-white px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors shadow-xs shrink-0"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
