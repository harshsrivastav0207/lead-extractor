import { NextResponse } from "next/server";

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

    // Validate the selected result limit.
    const allowedLimits = ["10", "25", "50", "100", "all"];
    const selectedLimit = allowedLimits.includes(String(maxResults))
      ? String(maxResults)
      : "10";

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
        language: "en",
        scrapeContacts: true,
        maximumLeadsEnrichmentRecords: 0,
        maxReviews: 0,
        maxImages: 0,
        includeWebResults: false,
        scrapeDirectories: false,
        scrapePlaceDetailPage: false,
        enableCompetitorAnalysis: false,
      };

      // Apply selected lead limit.
      // "all" means we leave the field empty so Apify can return
      // all available places for the search.
      if (selectedLimit !== "all") {
        apifyInput.maxCrawledPlacesPerSearch = Number(selectedLimit);
      }

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
      phone: item.phone || item.phoneUnformatted || null,
      email:
        item.email ||
        (Array.isArray(item.emails) ? item.emails[0] : null) ||
        null,
      address: item.address || item.street || null,
      city: item.city || null,
      state: item.state || null,
      country: item.country || item.countryCode || null,
      postalCode: item.postalCode || null,
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
      sourceUrl: item.url || null,
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