import Head from "next/head";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const allowedDomains = ["allwhitelaser.com", "titaniumhero.com"];

export default function SignIn({ callbackUrl, error }) {
  const [themeMode, setThemeModeState] = useState("system");
  const [systemTheme, setSystemTheme] = useState("light");
  const effectiveTheme = themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    const stored = localStorage.getItem("aw3-theme-mode") || "system";
    setThemeModeState(["light", "dark", "system"].includes(stored) ? stored : "system");

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemTheme(query.matches ? "dark" : "light");
    syncSystemTheme();
    query.addEventListener("change", syncSystemTheme);

    return () => query.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    try {
      localStorage.setItem("aw3-theme-mode", themeMode);
    } catch {
      // Local storage can be unavailable in strict browser contexts.
    }
  }, [themeMode]);

  function setThemeMode(mode) {
    setThemeModeState(["light", "dark", "system"].includes(mode) ? mode : "system");
  }

  return (
    <>
      <Head>
        <title>Sign in | AW3® Marketing Reporting</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="signin-page">
        <div className="theme-switcher" role="radiogroup" aria-label="Theme mode">
          {["light", "dark", "system"].map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={themeMode === mode}
              className={themeMode === mode ? "active" : ""}
              onClick={() => setThemeMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <section className="signin-panel" aria-labelledby="signin-title">
          <div className="brand">
            <img
              src={effectiveTheme === "dark" ? "/auth/aw3-logo-white.png" : "/auth/aw3-logo-black.png"}
              alt="AW3®"
            />
          </div>

          <p className="eyebrow">AW3® Marketing Reporting</p>
          <h1 id="signin-title">Sign in to view the monthly growth report.</h1>
          <p className="copy">
            Access is restricted to approved Google Workspace accounts for AW3® reporting.
          </p>

          {error ? (
            <p className="error" role="alert">
              Sign-in failed. Use an account from allwhitelaser.com or titaniumhero.com.
            </p>
          ) : null}

          <button
            className="signin-button"
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </button>

          <div className="domains" aria-label="Allowed domains">
            {allowedDomains.map((domain) => (
              <span key={domain}>{domain}</span>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        :global(html),
        :global(body),
        :global(#__next) {
          min-height: 100%;
        }

        :global(body) {
          margin: 0;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #ffffff;
          color: #050505;
        }

        :global(html[data-theme="dark"] body) {
          background: #0f1115;
          color: #f4f6f8;
        }

        .signin-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          background:
            linear-gradient(90deg, #050505 0 88px, transparent 88px),
            radial-gradient(circle at 85% 12%, rgb(0 0 0 / 7%), transparent 28%),
            #ffffff;
        }

        :global(html[data-theme="dark"]) .signin-page {
          background:
            linear-gradient(90deg, #000000 0 88px, transparent 88px),
            radial-gradient(circle at 85% 12%, rgb(255 255 255 / 8%), transparent 28%),
            #0f1115;
        }

        .signin-panel {
          width: min(560px, 100%);
          border: 1px solid #e2e2e2;
          background: #ffffff;
          padding: clamp(28px, 6vw, 54px);
          box-shadow: 0 24px 80px rgb(0 0 0 / 10%);
        }

        :global(html[data-theme="dark"]) .signin-panel {
          border-color: #30343c;
          background: #151820;
          box-shadow: 0 24px 80px rgb(0 0 0 / 38%);
        }

        .theme-switcher {
          position: fixed;
          top: 22px;
          right: 22px;
          z-index: 2;
          display: flex;
          gap: 4px;
          padding: 4px;
          border: 1px solid #e2e2e2;
          background: #f6f6f6;
        }

        .theme-switcher button {
          border: 1px solid transparent;
          background: transparent;
          color: #050505;
          padding: 8px 10px;
          font: inherit;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .theme-switcher button:hover,
        .theme-switcher button:focus-visible,
        .theme-switcher button.active {
          background: #050505;
          color: #ffffff;
        }

        :global(html[data-theme="dark"]) .theme-switcher {
          border-color: #30343c;
          background: #1d2027;
        }

        :global(html[data-theme="dark"]) .theme-switcher button {
          color: #f4f6f8;
        }

        :global(html[data-theme="dark"]) .theme-switcher button:hover,
        :global(html[data-theme="dark"]) .theme-switcher button:focus-visible,
        :global(html[data-theme="dark"]) .theme-switcher button.active {
          border-color: #f4f6f8;
          background: #f4f6f8;
          color: #050505;
        }

        .brand {
          margin-bottom: 42px;
        }

        .brand img {
          width: min(320px, 84vw);
          height: auto;
          display: block;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #69707d;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0 0 16px;
          max-width: 490px;
          font-size: clamp(36px, 7vw, 64px);
          line-height: .94;
          letter-spacing: -.04em;
        }

        .copy {
          margin: 0 0 28px;
          max-width: 430px;
          color: #69707d;
          font-size: 15px;
          line-height: 1.55;
        }

        .signin-button {
          width: 100%;
          border: 1px solid #050505;
          background: #050505;
          color: #ffffff;
          padding: 15px 18px;
          font: inherit;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
        }

        .signin-button:hover,
        .signin-button:focus-visible {
          background: #ffffff;
          color: #050505;
        }

        .error {
          margin: 0 0 18px;
          border-left: 4px solid #d73737;
          background: #fff0f0;
          color: #9b1c1c;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.45;
        }

        .domains {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .domains span {
          border: 1px solid #e2e2e2;
          background: #f6f6f6;
          padding: 8px 10px;
          color: #69707d;
          font-size: 11px;
          font-weight: 850;
        }

        :global(html[data-theme="dark"]) .eyebrow,
        :global(html[data-theme="dark"]) .copy {
          color: #a9b0bc;
        }

        :global(html[data-theme="dark"]) .signin-button {
          border-color: #f4f6f8;
          background: #f4f6f8;
          color: #050505;
        }

        :global(html[data-theme="dark"]) .signin-button:hover,
        :global(html[data-theme="dark"]) .signin-button:focus-visible {
          background: transparent;
          color: #f4f6f8;
        }

        :global(html[data-theme="dark"]) .error {
          background: #2a1517;
          color: #ffb3b3;
        }

        :global(html[data-theme="dark"]) .domains span {
          border-color: #30343c;
          background: #1d2027;
          color: #a9b0bc;
        }

        @media (prefers-color-scheme: dark) {
          :global(html[data-theme="system"] body) {
            background: #0f1115;
            color: #f4f6f8;
          }

          :global(html[data-theme="system"]) .signin-page {
            background:
              linear-gradient(90deg, #000000 0 88px, transparent 88px),
              radial-gradient(circle at 85% 12%, rgb(255 255 255 / 8%), transparent 28%),
              #0f1115;
          }

          :global(html[data-theme="system"]) .signin-panel {
            border-color: #30343c;
            background: #151820;
            box-shadow: 0 24px 80px rgb(0 0 0 / 38%);
          }

          :global(html[data-theme="system"]) .eyebrow,
          :global(html[data-theme="system"]) .copy {
            color: #a9b0bc;
          }

          :global(html[data-theme="system"]) .signin-button {
            border-color: #f4f6f8;
            background: #f4f6f8;
            color: #050505;
          }

          :global(html[data-theme="system"]) .signin-button:hover,
          :global(html[data-theme="system"]) .signin-button:focus-visible {
            background: transparent;
            color: #f4f6f8;
          }

          :global(html[data-theme="system"]) .error {
            background: #2a1517;
            color: #ffb3b3;
          }

          :global(html[data-theme="system"]) .domains span {
            border-color: #30343c;
            background: #1d2027;
            color: #a9b0bc;
          }

          :global(html[data-theme="system"]) .theme-switcher {
            border-color: #30343c;
            background: #1d2027;
          }

          :global(html[data-theme="system"]) .theme-switcher button {
            color: #f4f6f8;
          }

          :global(html[data-theme="system"]) .theme-switcher button:hover,
          :global(html[data-theme="system"]) .theme-switcher button:focus-visible,
          :global(html[data-theme="system"]) .theme-switcher button.active {
            border-color: #f4f6f8;
            background: #f4f6f8;
            color: #050505;
          }
        }

        @media (max-width: 620px) {
          .signin-page {
            place-items: stretch;
            padding: 18px;
            background: #ffffff;
          }

          .signin-panel {
            align-self: center;
          }

          .theme-switcher {
            position: static;
            justify-self: end;
            margin-bottom: 18px;
          }
        }

        @media (max-width: 620px) and (prefers-color-scheme: dark) {
          :global(html[data-theme="system"]) .signin-page {
            background: #0f1115;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const requestedCallback = context.query.callbackUrl;
  const callbackUrl = Array.isArray(requestedCallback)
    ? requestedCallback[0]
    : requestedCallback;
  return {
    props: {
      callbackUrl: callbackUrl || "/report/index.html",
      error: context.query.error || null,
    },
  };
}
