import type { Metadata } from "next";
import Booth from "@/components/Booth";

export const metadata: Metadata = { title: "Selfie Booth" };

export default function BoothPage() {
  return <Booth />;
}
