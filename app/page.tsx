import { Suspense } from "react";
import Home from "@/components/Home";

export default function Page() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
