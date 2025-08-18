import { Restaurant } from "@/types/database";

interface FooterProps {
  restaurant?: Restaurant;
}

export function Footer({ restaurant }: FooterProps) {
  return (
    <footer className="mt-auto border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            {restaurant ? (
              <div>
                <p className="font-medium">{restaurant.name}</p>
                <p>{restaurant.address}</p>
                {restaurant.phone && <p>Tel: {restaurant.phone}</p>}
              </div>
            ) : (
              <p>© 2025 QR Food Ordering System</p>
            )}
          </div>

          <div className="flex space-x-4 text-xs text-muted-foreground">
            <span>Powered by QR Food Order</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
