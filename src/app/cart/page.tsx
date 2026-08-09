import CartView from "./CartView";
import { getSiteSettings } from "@/lib/settings";

export default async function CartPage() {
  const settings = await getSiteSettings();
  return <CartView showPrice={settings.show_prices} />;
}
