import { Toaster } from "@/components/ui/toaster";
import Navigation from "./components/dashboard/Navigation";
import Navbar from "./components/dashboard/Navbar";

export const metadata = {
  title: "Family Expense Manager",
  description: "Manage your family expenses efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div>
        <Navigation />
      </div>
      <div className="flex flex-col w-full">
        <Navbar />
        {children}
      </div>
      <Toaster />
    </div>
  );
}
