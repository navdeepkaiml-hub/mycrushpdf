import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Configurable ad placement. Renders NOTHING until AdSense is approved and a
// publisher ID is configured by an admin. Never shown next to upload/download
// controls. Keeps the layout clean and policy-compliant pre-approval.
export default function AdSlot({ slot = "content", className = "" }) {
  const [ads, setAds] = useState(null);
  useEffect(() => {
    api
      .get("/config/public")
      .then((r) => setAds(r.data.ads))
      .catch(() => setAds({ enabled: false }));
  }, []);

  if (!ads || !ads.enabled || !ads.publisher_id) return null;

  return (
    <div
      data-testid={`ad-slot-${slot}`}
      className={`my-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 ${className}`}
    >
      {/* Real AdSense <ins> markup is injected here only after approval. */}
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ads.publisher_id}
        data-ad-slot={ads.slots?.[slot] || ""}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
