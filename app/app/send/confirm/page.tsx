"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      router.replace(`/app/send?ref=${ref}`);
    } else {
      router.replace("/app/send");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
