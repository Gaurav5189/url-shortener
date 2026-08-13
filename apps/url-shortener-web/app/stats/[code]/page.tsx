import type { Metadata } from "next";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { StatsWidget } from "../../../components/StatsWidget";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Analytics for /${code} — LinkCut`,
    description: `Real-time click statistics and performance analytics for shortened URL /${code}.`,
  };
}

export default async function StatsPage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="w-full flex-col min-h-screen" style={{ display: "flex" }}>
      {/* Shared Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-col items-center w-full" style={{ display: "flex", flex: 1 }}>
        <div
          className="container flex-col items-center"
          style={{ display: "flex", width: "100%" }}
        >
          {/* Hero */}
          <div className="text-center" style={{ marginTop: "64px", marginBottom: "40px", width: "100%" }}>
            <h1 className="h1-title">
              Link <span className="h1-pill">analytics</span>
            </h1>
            <p className="subhead" style={{ marginBottom: "0px", marginTop: "16px" }}>
              Real-time performance metrics and click tracking for short link{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                /{code}
              </code>
              .
            </p>
          </div>

          {/* Stats Widget */}
          <StatsWidget code={code} />
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
