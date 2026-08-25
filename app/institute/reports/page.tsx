import { redirect } from "next/navigation";

export default function InstituteReportsPage() {
  redirect("/institute/analytics?tab=reports");
}
