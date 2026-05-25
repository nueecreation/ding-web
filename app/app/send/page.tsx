import { Suspense } from "react";
import { SendPage } from "@/components/app/SendPage";

export default function Send() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SendPage />
    </Suspense>
  );
}
