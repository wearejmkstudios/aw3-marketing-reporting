const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR", "AUD", "CAD"];
const DEFAULT_SYMBOLS = SUPPORTED_CURRENCIES.filter((currency) => currency !== "GBP");

function normaliseCurrency(value, fallback = "GBP") {
  const code = String(value || "").trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(code) ? code : fallback;
}

function normaliseSymbols(value, base) {
  const requested = String(value || "")
    .split(",")
    .map((currency) => normaliseCurrency(currency, ""))
    .filter((currency) => currency && currency !== base);
  return requested.length > 0 ? [...new Set(requested)] : DEFAULT_SYMBOLS.filter((currency) => currency !== base);
}

export default async function handler(req, res) {
  const base = normaliseCurrency(req.query.base);
  const symbols = normaliseSymbols(req.query.symbols, base);
  const endpoint = new URL("https://api.frankfurter.dev/v1/latest");

  endpoint.searchParams.set("base", base);
  endpoint.searchParams.set("symbols", symbols.join(","));

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Frankfurter responded with ${response.status}`);
    }

    const data = await response.json();
    const rates = { [base]: 1 };

    symbols.forEach((currency) => {
      const rate = Number(data.rates?.[currency]);
      if (Number.isFinite(rate) && rate > 0) {
        rates[currency] = rate;
      }
    });

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({
      base,
      rates,
      date: data.date || null,
      updatedAt: new Date().toISOString(),
      source: "Frankfurter",
    });
  } catch (error) {
    res.status(502).json({
      error: "FX_RATE_UNAVAILABLE",
      message: error.message,
      base,
      rates: { [base]: 1 },
      updatedAt: new Date().toISOString(),
      source: "Frankfurter",
    });
  }
}
