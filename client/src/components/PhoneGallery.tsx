import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cpu, HardDrive, Monitor, Battery, Camera } from "lucide-react";
import type { MobileAPIPhonesResponse } from "@shared/schema";

export function PhoneGallery() {
  const { data: phonesData, isLoading } = useQuery<MobileAPIPhonesResponse>({
    queryKey: ["/api/phones"],
  });

  const phones = phonesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-phones" />
      </div>
    );
  }

  if (!phones || phones.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground text-lg" data-testid="text-no-phones">
          No iPhone models available from the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" data-testid="text-gallery-title">
          iPhone Catalog
        </h2>
        <Badge className="bg-primary text-primary-foreground" data-testid="badge-phone-count">
          {phones.length} models
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phones.map((phone, index) => (
          <Card 
            key={`${phone.name}-${index}`}
            className="overflow-hidden hover-elevate active-elevate-2 transition-all"
            data-testid={`card-phone-${index}`}
          >
            <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center">
              {phone.image ? (
                <img
                  src={phone.image}
                  alt={phone.name}
                  className="w-full h-full object-contain p-8"
                  data-testid={`img-phone-${index}`}
                />
              ) : (
                <div className="text-center p-6">
                  <span className="material-icons text-5xl text-muted-foreground">smartphone</span>
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg" data-testid={`text-phone-name-${index}`}>
                {phone.name}
              </CardTitle>
              {phone.releaseDate && (
                <p className="text-sm text-muted-foreground" data-testid={`text-release-date-${index}`}>
                  Released: {phone.releaseDate}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                {phone.specs.cpu && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-cpu-${index}`}>
                    <Cpu className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">CPU:</span> {phone.specs.cpu}
                    </div>
                  </div>
                )}

                {phone.specs.display && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-display-${index}`}>
                    <Monitor className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Display:</span> {phone.specs.display}
                    </div>
                  </div>
                )}

                {phone.specs.ram && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-ram-${index}`}>
                    <HardDrive className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">RAM:</span> {phone.specs.ram}
                    </div>
                  </div>
                )}

                {phone.specs.storage && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-storage-${index}`}>
                    <HardDrive className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Storage:</span> {phone.specs.storage}
                    </div>
                  </div>
                )}

                {phone.specs.battery && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-battery-${index}`}>
                    <Battery className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Battery:</span> {phone.specs.battery}
                    </div>
                  </div>
                )}

                {phone.specs.camera && (
                  <div className="flex items-start gap-2 text-sm" data-testid={`spec-camera-${index}`}>
                    <Camera className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Camera:</span> {phone.specs.camera}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
