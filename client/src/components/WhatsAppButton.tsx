import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/919876543210", "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 shadow-lg z-50"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  );
}
