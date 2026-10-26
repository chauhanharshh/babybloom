import prisma from "./prisma";

export interface StoreProfileData {
  id?: number;
  storeName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  instagramUrl: string;
  facebookUrl: string;
  aboutText: string;

  // Payment methods
  codEnabled: boolean;
  codNote: string;
  upiEnabled: boolean;
  upiId: string;
  upiQrUrl: string;
  cardEnabled: boolean;
  netbankingEnabled: boolean;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export const DEFAULT_STORE_PROFILE: StoreProfileData = {
  id: 1,
  storeName: "Baby Bloom",
  tagline: "Everyday outfits for your little trendsetters",
  ownerName: "Harsh Chauhan",
  phone: "+91 95200 42719",
  whatsappNumber: "919520042719",
  email: "babybloom.bb2024@gmail.com",
  addressLine1: "Khanna Nagar, House no. 41",
  addressLine2: "Opposite Kaushik Academy",
  city: "Haridwar",
  state: "Uttarakhand",
  pincode: "249401",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  aboutText: "Everyday outfits for your little trendsetters. Premium baby and kids wear for ages 0 to 6 years.",

  // Payment methods
  codEnabled: true,
  codNote: "Pay in cash when order arrives at your doorstep.",
  upiEnabled: true,
  upiId: "9520042719@upi",
  upiQrUrl: "",
  cardEnabled: true,
  netbankingEnabled: true,
  bankName: "State Bank of India",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "Baby Bloom Store",
};

export async function getStoreProfile(): Promise<StoreProfileData> {
  try {
    let profile = await prisma.storeProfile.findUnique({
      where: { id: 1 },
    });

    if (!profile) {
      try {
        profile = await prisma.storeProfile.create({
          data: {
            id: 1,
            storeName: DEFAULT_STORE_PROFILE.storeName,
            tagline: DEFAULT_STORE_PROFILE.tagline,
            ownerName: DEFAULT_STORE_PROFILE.ownerName,
            phone: DEFAULT_STORE_PROFILE.phone,
            whatsappNumber: DEFAULT_STORE_PROFILE.whatsappNumber,
            email: DEFAULT_STORE_PROFILE.email,
            addressLine1: DEFAULT_STORE_PROFILE.addressLine1,
            addressLine2: DEFAULT_STORE_PROFILE.addressLine2,
            city: DEFAULT_STORE_PROFILE.city,
            state: DEFAULT_STORE_PROFILE.state,
            pincode: DEFAULT_STORE_PROFILE.pincode,
            instagramUrl: DEFAULT_STORE_PROFILE.instagramUrl,
            facebookUrl: DEFAULT_STORE_PROFILE.facebookUrl,
            aboutText: DEFAULT_STORE_PROFILE.aboutText,
            codEnabled: DEFAULT_STORE_PROFILE.codEnabled,
            codNote: DEFAULT_STORE_PROFILE.codNote,
            upiEnabled: DEFAULT_STORE_PROFILE.upiEnabled,
            upiId: DEFAULT_STORE_PROFILE.upiId,
            upiQrUrl: DEFAULT_STORE_PROFILE.upiQrUrl,
            cardEnabled: DEFAULT_STORE_PROFILE.cardEnabled,
            netbankingEnabled: DEFAULT_STORE_PROFILE.netbankingEnabled,
            bankName: DEFAULT_STORE_PROFILE.bankName,
            accountNumber: DEFAULT_STORE_PROFILE.accountNumber,
            ifscCode: DEFAULT_STORE_PROFILE.ifscCode,
            accountHolderName: DEFAULT_STORE_PROFILE.accountHolderName,
          },
        });
      } catch {
        // In case another process created it concurrently
        profile = await prisma.storeProfile.findUnique({ where: { id: 1 } });
      }
    }

    if (!profile) {
      return DEFAULT_STORE_PROFILE;
    }

    return {
      id: profile.id,
      storeName: profile.storeName || DEFAULT_STORE_PROFILE.storeName,
      tagline: profile.tagline || DEFAULT_STORE_PROFILE.tagline,
      ownerName: profile.ownerName || DEFAULT_STORE_PROFILE.ownerName,
      phone: profile.phone || DEFAULT_STORE_PROFILE.phone,
      whatsappNumber: profile.whatsappNumber || DEFAULT_STORE_PROFILE.whatsappNumber,
      email: profile.email || DEFAULT_STORE_PROFILE.email,
      addressLine1: profile.addressLine1 || "",
      addressLine2: profile.addressLine2 || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
      instagramUrl: profile.instagramUrl || "",
      facebookUrl: profile.facebookUrl || "",
      aboutText: profile.aboutText || "",

      codEnabled: profile.codEnabled ?? true,
      codNote: profile.codNote || DEFAULT_STORE_PROFILE.codNote,
      upiEnabled: profile.upiEnabled ?? true,
      upiId: profile.upiId || "",
      upiQrUrl: profile.upiQrUrl || "",
      cardEnabled: profile.cardEnabled ?? true,
      netbankingEnabled: profile.netbankingEnabled ?? true,
      bankName: profile.bankName || "",
      accountNumber: profile.accountNumber || "",
      ifscCode: profile.ifscCode || "",
      accountHolderName: profile.accountHolderName || "",
    };
  } catch (error) {
    console.warn("Could not fetch store profile from DB, using defaults:", error);
    return DEFAULT_STORE_PROFILE;
  }
}

export async function updateStoreProfile(data: Partial<StoreProfileData>): Promise<StoreProfileData> {
  const profile = await prisma.storeProfile.upsert({
    where: { id: 1 },
    update: {
      storeName: data.storeName,
      tagline: data.tagline,
      ownerName: data.ownerName,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      email: data.email,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      instagramUrl: data.instagramUrl,
      facebookUrl: data.facebookUrl,
      aboutText: data.aboutText,

      codEnabled: data.codEnabled,
      codNote: data.codNote,
      upiEnabled: data.upiEnabled,
      upiId: data.upiId,
      upiQrUrl: data.upiQrUrl,
      cardEnabled: data.cardEnabled,
      netbankingEnabled: data.netbankingEnabled,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountHolderName: data.accountHolderName,
    },
    create: {
      id: 1,
      storeName: data.storeName || DEFAULT_STORE_PROFILE.storeName,
      tagline: data.tagline || DEFAULT_STORE_PROFILE.tagline,
      ownerName: data.ownerName || DEFAULT_STORE_PROFILE.ownerName,
      phone: data.phone || DEFAULT_STORE_PROFILE.phone,
      whatsappNumber: data.whatsappNumber || DEFAULT_STORE_PROFILE.whatsappNumber,
      email: data.email || DEFAULT_STORE_PROFILE.email,
      addressLine1: data.addressLine1 || DEFAULT_STORE_PROFILE.addressLine1,
      addressLine2: data.addressLine2 || DEFAULT_STORE_PROFILE.addressLine2,
      city: data.city || DEFAULT_STORE_PROFILE.city,
      state: data.state || DEFAULT_STORE_PROFILE.state,
      pincode: data.pincode || DEFAULT_STORE_PROFILE.pincode,
      instagramUrl: data.instagramUrl || DEFAULT_STORE_PROFILE.instagramUrl,
      facebookUrl: data.facebookUrl || DEFAULT_STORE_PROFILE.facebookUrl,
      aboutText: data.aboutText || DEFAULT_STORE_PROFILE.aboutText,

      codEnabled: data.codEnabled ?? DEFAULT_STORE_PROFILE.codEnabled,
      codNote: data.codNote || DEFAULT_STORE_PROFILE.codNote,
      upiEnabled: data.upiEnabled ?? DEFAULT_STORE_PROFILE.upiEnabled,
      upiId: data.upiId || DEFAULT_STORE_PROFILE.upiId,
      upiQrUrl: data.upiQrUrl || DEFAULT_STORE_PROFILE.upiQrUrl,
      cardEnabled: data.cardEnabled ?? DEFAULT_STORE_PROFILE.cardEnabled,
      netbankingEnabled: data.netbankingEnabled ?? DEFAULT_STORE_PROFILE.netbankingEnabled,
      bankName: data.bankName || DEFAULT_STORE_PROFILE.bankName,
      accountNumber: data.accountNumber || DEFAULT_STORE_PROFILE.accountNumber,
      ifscCode: data.ifscCode || DEFAULT_STORE_PROFILE.ifscCode,
      accountHolderName: data.accountHolderName || DEFAULT_STORE_PROFILE.accountHolderName,
    },
  });

  return {
    id: profile.id,
    storeName: profile.storeName,
    tagline: profile.tagline || "",
    ownerName: profile.ownerName || "",
    phone: profile.phone,
    whatsappNumber: profile.whatsappNumber,
    email: profile.email,
    addressLine1: profile.addressLine1 || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
    instagramUrl: profile.instagramUrl || "",
    facebookUrl: profile.facebookUrl || "",
    aboutText: profile.aboutText || "",

    codEnabled: profile.codEnabled,
    codNote: profile.codNote || "",
    upiEnabled: profile.upiEnabled,
    upiId: profile.upiId || "",
    upiQrUrl: profile.upiQrUrl || "",
    cardEnabled: profile.cardEnabled,
    netbankingEnabled: profile.netbankingEnabled,
    bankName: profile.bankName || "",
    accountNumber: profile.accountNumber || "",
    ifscCode: profile.ifscCode || "",
    accountHolderName: profile.accountHolderName || "",
  };
}
