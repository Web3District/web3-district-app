import { getPublicSiteUrl } from "@/lib/site-url";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cat?: string; error?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === "true";
  const category = params.cat ?? "all";
  const error = params.error;
  const siteUrl = getPublicSiteUrl();

  const categoryLabels: Record<string, string> = {
    all: "all emails",
    social: "social notifications",
    digest: "digest emails",
    marketing: "marketing emails",
    streak_reminders: "streak reminders",
    transactional: "transactional emails",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0e",
        fontFamily: "'Silkscreen', monospace",
        color: "#f0f0f0",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          textAlign: "center",
          background: "#0a0a0e",
          padding: "40px 32px",
          border: "1px solid #1c1c20",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            letterSpacing: 4,
            color: "#ed0584",
            marginTop: 0,
          }}
        >
          WEB3 DISTRICT
        </h1>

        <div
          style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, #ed0584, transparent)",
            margin: "20px 0",
          }}
        />

        {error ? (
          <>
            <p style={{ fontSize: 18, color: "#ff6b6b" }}>Invalid or expired link</p>
            <p style={{ color: "#666", fontSize: 14 }}>
              This unsubscribe link may have expired or is invalid.
              You can manage your notifications from your Web3 District settings.
            </p>
          </>
        ) : success ? (
          <>
            <p style={{ fontSize: 18 }}>
              You&apos;ve been unsubscribed from{" "}
              <strong style={{ color: "#ed0584" }}>
                {categoryLabels[category] ?? category}
              </strong>
              .
            </p>
            <p style={{ color: "#666", fontSize: 14 }}>
              You can re-enable notifications anytime from your Web3 District settings.
            </p>
          </>
        ) : (
          <p style={{ color: "#666", fontSize: 14 }}>
            Use the link in your email to manage your notification preferences.
          </p>
        )}

        <div
          style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, #1c1c20, transparent)",
            margin: "20px 0",
          }}
        />

        <a
          href={siteUrl}
          style={{ color: "#ed0584", fontSize: 14, textDecoration: "underline" }}
        >
          Back to Web3 District
        </a>
      </div>
    </div>
  );
}
