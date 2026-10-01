"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body
        style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1rem", textAlign: "center" }}
      >
        <h1 style={{ fontSize: "1.25rem" }}>Etwas ist schiefgelaufen.</h1>
        <p style={{ color: "#5f5b53" }}>Die Anwendung konnte nicht geladen werden.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1.5rem", padding: "0.5rem 1rem" }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
