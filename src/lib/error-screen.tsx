import { useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";

import { reportLovableError } from "@/lib/lovable-error-reporting";

export default function ErrorScreen({ error: errorUnknown, reset }: { error: unknown; reset: () => void }) {
  const error = errorUnknown instanceof Error ? errorUnknown : new Error(String(errorUnknown));
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">This page didn&apos;t load</h1>
        <p className="mt-3 text-sm text-muted-foreground">Something went wrong. Try again or head back to the store.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
          <Link to="/" className="rounded-sm border border-input px-4 py-2 text-sm">Go home</Link>
        </div>
      </div>
    </div>
  );
}
