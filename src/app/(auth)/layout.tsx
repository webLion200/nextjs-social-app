import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    redirect("/");
  }

  return <>{children}</>;
}
