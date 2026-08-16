import Link from "next/link";
import { Home } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          padding: "40px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className="text-center" style={{ width: "100%" }}>
            <h1 className="h1-title" style={{ fontSize: "5rem", marginBottom: "1rem" }}>
              404
            </h1>
            <p className="subhead" style={{ marginBottom: "2rem" }}>
              The page you're looking for doesn't exist.
              <br />
              If you were looking for short link, then it was not found or has expired.
            </p>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Link href="/" className="read-docs-btn" style={{ marginTop: 0 }}>
                <Home size={18} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
