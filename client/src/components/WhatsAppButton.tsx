import { SiWhatsapp } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import type { AdminSettings } from "@shared/schema";

export function WhatsAppButton() {
  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const whatsappNumber = settings?.whatsappNumber || "919876543210";

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#22b55a] shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{ zIndex: 9999 }}
      data-testid="button-whatsapp"
      aria-label="Contact us on WhatsApp"
    >
      <SiWhatsapp className="h-7 w-7 text-white" />
    </button>
  );
}
