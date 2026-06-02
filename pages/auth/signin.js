import Head from "next/head";
import { signIn } from "next-auth/react";

const allowedDomains = ["allwhitelaser.com", "titaniumhero.com"];

export default function SignIn({ callbackUrl, error }) {
  return (
    <>
      <Head>
        <title>Sign in | AW3 Marketing Reporting</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="signin-page">
        <section className="signin-panel" aria-labelledby="signin-title">
          <div className="brand">
            <picture>
              <source srcSet="/auth/aw3-logo-white.png" media="(prefers-color-scheme: dark)" />
              <img src="/auth/aw3-logo-black.png" alt="AW3" />
            </picture>
          </div>

          <p className="eyebrow">AW3 Marketing Reporting</p>
          <h1 id="signin-title">Sign in to view the monthly growth report.</h1>
          <p className="copy">
            Access is restricted to approved Google Workspace accounts for AW3 reporting.
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

        .signin-panel {
          width: min(560px, 100%);
          border: 1px solid #e2e2e2;
          background: #ffffff;
          padding: clamp(28px, 6vw, 54px);
          box-shadow: 0 24px 80px rgb(0 0 0 / 10%);
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

        @media (prefers-color-scheme: dark) {
          :global(body) {
            background: #0f1115;
            color: #f4f6f8;
          }

          .signin-page {
            background:
              linear-gradient(90deg, #000000 0 88px, transparent 88px),
              radial-gradient(circle at 85% 12%, rgb(255 255 255 / 8%), transparent 28%),
              #0f1115;
          }

          .signin-panel {
            border-color: #30343c;
            background: #151820;
            box-shadow: 0 24px 80px rgb(0 0 0 / 38%);
          }

          .eyebrow,
          .copy {
            color: #a9b0bc;
          }

          .signin-button {
            border-color: #f4f6f8;
            background: #f4f6f8;
            color: #050505;
          }

          .signin-button:hover,
          .signin-button:focus-visible {
            background: transparent;
            color: #f4f6f8;
          }

          .error {
            background: #2a1517;
            color: #ffb3b3;
          }

          .domains span {
            border-color: #30343c;
            background: #1d2027;
            color: #a9b0bc;
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
        }

        @media (max-width: 620px) and (prefers-color-scheme: dark) {
          .signin-page {
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
