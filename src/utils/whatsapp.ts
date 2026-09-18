import { CartItem } from "@/context/CartContext";

export function getWhatsAppCheckoutUrl(cart: CartItem[], phoneNumber: string = "919520042719") {
  if (cart.length === 0) return "";

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let message = "Hi Baby Bloom! 🌸\n\nI would like to place an order for the following items:\n\n";
  
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Size/Age: ${item.ageGroup}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ₹${item.price} (Total: ₹${item.price * item.quantity})\n\n`;
  });
  
  message += `*Total Order Value: ₹${total}*\n\n`;
  message += "Please let me know the payment details and delivery process! 🎀";

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
