import { redirect } from "next/navigation";

export default function AdminRatesRedirect() {
  redirect("/admin/settings");
}
