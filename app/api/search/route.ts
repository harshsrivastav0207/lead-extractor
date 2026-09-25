import { NextResponse } from "next/server";
import { getDemoLeads } from "@/data/demo-leads";

function parseSearchQuery(query: string) {
  const cleaned = query.trim();

  const match = cleaned.match(/^(.+?)\s+in\s+(.+)$/i);

  if (match) {
    return {
      searchTerm: match[1].trim(),
      location: match[2].trim(),
    };
  }

  return {
    searchTerm: cleaned,
    location: "",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queries, maxResults } = body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: "Please enter at least one search query." },
        { status: 400 }
      );
    }

    const cleanedQueries = queries
      .map((q: unknown) => (typeof q === "string" ? q.trim() : ""))
      .filter((q: string) => q.length > 0);

    if (cleanedQueries.length === 0) {
      return NextResponse.json(
        { error: "Please enter at least one valid search query." },
        { status: 400 }
      );
    }

    /*
     * SAFETY LIMIT
     *
     * The API will NEVER request more than 100 results
     * for a single search query.
     */
    const allowedLimits = [10, 25, 50, 100];

    const requestedLimit = Number(maxResults);

    const selectedLimit = allowedLimits.includes(requestedLimit)
      ? requestedLimit
      : 10;

    // ================================================================
    // DEMO MODE — FAIL-SAFE DEFAULT
    //
    // Demo mode is ON by default. Real Apify mode is only used when
    // DEMO_MODE is explicitly set to "false", "0", or "no".
    //
    // This means: even if the env var is missing, misconfigured, or
    // has trailing whitespace, the app falls back to demo data
    // instead of making a real Apify request.
    // ================================================================
    const demoModeRaw = process.env.DEMO_MODE ?? "(undefined)";
    const demoMode = String(demoModeRaw).trim().toLowerCase();

    console.log(
      `[DEMO MODE DEBUG] raw="${demoModeRaw}" normalized="${demoMode}"`
    );

    const isDemoMode =
      demoMode !== "false" && demoMode !== "0" && demoMode !== "no";

    if (isDemoMode) {
      const demoResults = getDemoLeads(selectedLimit);

      return NextResponse.json({
        count: demoResults.length,
        queries: cleanedQueries,
        results: demoResults,
      });
    }

    // ================================================================
    // REAL MODE — only reached when DEMO_MODE is explicitly false.
    // ================================================================
    const apiToken = process.env.APIFY_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: "Server configuration error: API token missing." },
        { status: 500 }
      );
    }

    const actorId = "compass~crawler-google-places";

    const apifyUrl =
      `https://api.apify.com/v2/acts/${actorId}` +
      `/run-sync-get-dataset-items?token=${apiToken}`;

    const allResults: any[] = [];

    for (const query of cleanedQueries) {
      const { searchTerm, location } = parseSearchQuery(query);

      const apifyInput: Record<string, unknown> = {
        searchStringsArray: [searchTerm],

        // HARD SAFETY LIMIT: maximum 100
        maxCrawledPlacesPerSearch: selectedLimit,

        language: "en",

        // Email enrichment
        scrapeContacts: true,
        maximumLeadsEnrichmentRecords: 0,

        // Reduce unnecessary data/cost
        maxReviews: 0,
        maxImages: 0,
        includeWebResults: false,
        scrapeDirectories: false,
        scrapePlaceDetailPage: false,
        enableCompetitorAnalysis: false,
      };

      if (location) {
        apifyInput.locationQuery = location;
      }

      const apifyResponse = await fetch(apifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apifyInput),
      });

      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text();

        console.error("Apify error:", errorText);

        return NextResponse.json(
          { error: `Failed to fetch data for: ${query}` },
          { status: 502 }
        );
      }

      const rawData = await apifyResponse.json();

      if (Array.isArray(rawData)) {
        allResults.push(...rawData);
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped: any[] = [];

    for (const item of allResults) {
      const name = (item.title || item.name || "")
        .toLowerCase()
        .trim();

      const phone = (
        item.phone ||
        item.phoneUnformatted ||
        ""
      ).trim();

      const address = (item.address || "")
        .toLowerCase()
        .trim();

      const key = `${name}|${phone || address}`;

      if (name && !seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }

    const normalizedResults = deduped.map((item, index) => ({
      serial: index + 1,

      name: item.title || item.name || null,

      phone:
        item.phone ||
        item.phoneUnformatted ||
        null,

      email:
        item.email ||
        (Array.isArray(item.emails)
          ? item.emails[0]
          : null) ||
        null,

      address:
        item.address ||
        item.street ||
        null,

      city: item.city || null,

      state: item.state || null,

      country:
        item.country ||
        item.countryCode ||
        null,

      postalCode:
        item.postalCode ||
        null,

      latitude:
        item.location?.lat ??
        item.latitude ??
        null,

      longitude:
        item.location?.lng ??
        item.longitude ??
        null,

      website:
        item.website ||
        item.webSite ||
        item.web_site ||
        null,

      category:
        item.categoryName ||
        (Array.isArray(item.categories)
          ? item.categories[0]
          : item.category) ||
        null,

      source: "Google Maps via Apify",

      sourceUrl:
        item.url ||
        null,
    }));

    return NextResponse.json({
      count: normalizedResults.length,
      queries: cleanedQueries,
      results: normalizedResults,
    });
  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}