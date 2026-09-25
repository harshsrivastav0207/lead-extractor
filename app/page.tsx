"use client";

import { useState, type KeyboardEvent } from "react";
import * as XLSX from "xlsx";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Lead = {
  serial: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  category: string | null;
  source: string | null;
  sourceUrl: string | null;
};

export default function Home() {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [maxResults, setMaxResults] = useState("10");

  const handleSearch = async () => {
    const queries = queryText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (queries.length === 0) {
      setError("Please enter at least one search query.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queries, maxResults }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch {
      setError("Network error. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSearch();
    }
  };

  const buildExportRows = () => {
    return results.map((lead, index) => ({
      "S.No": index + 1,
      "Business Name": lead.name || "",
      Phone: lead.phone || "",
      Email: lead.email || "",
      Address: lead.address || "",
      City: lead.city || "",
      State: lead.state || "",
      Country: lead.country || "",
      "Postal Code": lead.postalCode || "",
      Website: lead.website || "",
      Category: lead.category || "",
      Latitude: lead.latitude ?? "",
      Longitude: lead.longitude ?? "",
      Source: lead.source || "",
      "Source URL": lead.sourceUrl || "",
    }));
  };

  const buildFilename = (extension: string) => {
    const lines = queryText
      .split("\n")
      .filter((line) => line.trim());

    const firstLine = lines[0] || "leads";

    const safeQuery =
      firstLine
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "leads";

    const date = new Date().toISOString().split("T")[0];

    const prefix = lines.length > 1 ? "multi" : safeQuery;

    return `leads-${prefix}-${date}.${extension}`;
  };

  const exportJSON = () => {
    if (results.length === 0) return;

    const dataStr = JSON.stringify(buildExportRows(), null, 2);

    const blob = new Blob([dataStr], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = buildFilename("json");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (results.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(buildExportRows());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    XLSX.writeFile(workbook, buildFilename("csv"), {
      bookType: "csv",
    });
  };

  const exportExcel = () => {
    if (results.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(buildExportRows());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    XLSX.writeFile(workbook, buildFilename("xlsx"));
  };

  const useExample = (example: string) => {
    setQueryText(example);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute right-[-150px] top-[400px] h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8">
        {/* NAVBAR */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-lg shadow-slate-900/10">
              L
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-tight text-slate-950">
                LeadExtractor
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Lead Discovery
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              ● Live Business Data
            </span>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-4xl pb-10 pt-16 text-center sm:pt-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Business intelligence, simplified
          </div>

          <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl">
            Find your next
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              business leads.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Discover real businesses by category and location, enrich available
            contact details, and export your leads in seconds.
          </p>

          {/* FEATURES */}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {[
              "Real Business Data",
              "Email Enrichment",
              "Multi-Location",
              "Excel & CSV Export",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </section>

        {/* SEARCH CARD */}
        <section className="mx-auto max-w-5xl">
          <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
            <CardContent className="p-5 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Search for businesses
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter one location per line for multiple searches.
                  </p>
                </div>

                <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 sm:block">
                  Ctrl + Enter
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                <Textarea
                  placeholder={`Schools in Mumbai
Clinics in Delhi
Gyms in Toronto`}
                  className="min-h-[135px] resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-7 shadow-none focus-visible:ring-0"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />

                <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 px-3 pt-3">
                  <span className="text-xs text-slate-400">
                    One query per line
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={maxResults}
                      onChange={(e) => setMaxResults(e.target.value)}
                      disabled={loading}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                    >
                      <option value="10">10 leads</option>
                      <option value="25">25 leads</option>
                      <option value="50">50 leads</option>
                      <option value="100">100 leads</option>
                    </select>

                    <Button
                      className="h-10 rounded-lg bg-slate-950 px-5 text-sm font-semibold shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Searching...
                        </span>
                      ) : (
                        "Search leads →"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* EXAMPLES */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-slate-400">
                  Try:
                </span>

                {[
                  "Schools in Mumbai",
                  "Clinics in London",
                  "Gyms in Toronto",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => useExample(example)}
                    disabled={loading}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* STATUS / ERROR */}
        {loading && (
          <section className="mx-auto mt-8 max-w-5xl">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-950">
                    Finding your leads...
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Searching businesses, collecting available contact
                    information, and organizing the results.
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      Searching businesses
                    </span>
                    <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      Enriching contacts
                    </span>
                    <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      Cleaning results
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {error && !loading && (
          <section className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  !
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-red-900">
                    Something went wrong
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && searched && results.length === 0 && (
          <section className="mx-auto mt-8 max-w-5xl">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  —
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-950">
                  No leads found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Try a broader business category or a different location.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* RESULTS */}
        {!loading && !error && results.length > 0 && (
          <section className="mx-auto mt-10 max-w-[1400px]">
            {/* RESULTS HEADER */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Your leads
                  </h2>

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                    {results.length}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  Business data collected and organized for your search.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportJSON}
                  className="rounded-lg border-slate-200 bg-white font-medium shadow-sm hover:bg-slate-50"
                >
                  JSON
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCSV}
                  className="rounded-lg border-slate-200 bg-white font-medium shadow-sm hover:bg-slate-50"
                >
                  CSV
                </Button>

                <Button
                  size="sm"
                  onClick={exportExcel}
                  className="rounded-lg bg-slate-950 font-medium shadow-sm hover:bg-slate-800"
                >
                  Export Excel
                </Button>
              </div>
            </div>

            {/* RESULTS CARD */}
            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_45px_-30px_rgba(15,23,42,0.3)]">
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-slate-700">
                  Lead database
                </div>

                <div className="text-xs text-slate-400">
                  Source: {results[0]?.source || "Google Maps via Apify"}
                </div>
              </div>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="w-14 px-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          #
                        </TableHead>

                        <TableHead className="min-w-[220px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Business
                        </TableHead>

                        <TableHead className="min-w-[155px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Phone
                        </TableHead>

                        <TableHead className="min-w-[230px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Email
                        </TableHead>

                        <TableHead className="min-w-[280px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Address
                        </TableHead>

                        <TableHead className="min-w-[130px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          City
                        </TableHead>

                        <TableHead className="min-w-[150px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          State
                        </TableHead>

                        <TableHead className="min-w-[110px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Country
                        </TableHead>

                        <TableHead className="min-w-[110px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Postal
                        </TableHead>

                        <TableHead className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Website
                        </TableHead>

                        <TableHead className="min-w-[150px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Category
                        </TableHead>

                        <TableHead className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Latitude
                        </TableHead>

                        <TableHead className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Longitude
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {results.map((lead, index) => (
                        <TableRow
                          key={`${lead.name}-${lead.address}-${index}`}
                          className="border-slate-100 transition-colors hover:bg-indigo-50/30"
                        >
                          <TableCell className="px-5 text-xs font-semibold text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </TableCell>

                          <TableCell className="max-w-[240px]">
                            <div
                              className="truncate font-semibold text-slate-800"
                              title={lead.name || ""}
                            >
                              {lead.name || "—"}
                            </div>
                          </TableCell>

                          <TableCell>
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-indigo-600"
                              >
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>

                          <TableCell className="max-w-[250px]">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="block truncate text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
                                title={lead.email}
                              >
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>

                          <TableCell
                            className="max-w-[300px] truncate text-sm text-slate-500"
                            title={lead.address || ""}
                          >
                            {lead.address || "—"}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">
                            {lead.city || "—"}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">
                            {lead.state || "—"}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">
                            {lead.country || "—"}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">
                            {lead.postalCode || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.website ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                Visit ↗
                              </a>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>

                          <TableCell>
                            {lead.category ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {lead.category}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>

                          <TableCell className="font-mono text-xs text-slate-500">
                            {lead.latitude ?? "—"}
                          </TableCell>

                          <TableCell className="font-mono text-xs text-slate-500">
                            {lead.longitude ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* RESULTS FOOTER */}
            <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {results.length} lead{results.length === 1 ? "" : "s"} displayed
              </span>

              <span>
                Missing information is shown as{" "}
                <span className="font-medium text-slate-500">—</span>
              </span>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-200/70 pt-6 text-center text-xs text-slate-400">
          LeadExtractor · Business lead discovery and data export
        </footer>
      </div>
    </main>
  );
}