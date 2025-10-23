import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/919876543210", "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#22b55a] shadow-xl flex items-center justify-center transition-all"
      style={{ zIndex: 9999 }}
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </button>
  );
}
