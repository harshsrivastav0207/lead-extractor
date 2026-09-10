"use client";

import { useState } from "react";
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
        body: JSON.stringify({ queries }),
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      (e.ctrlKey || e.metaKey)
    ) {
      e.preventDefault();
      handleSearch();
    }
  };

  // ---------- EXPORT ----------

  const buildExportRows = () => {
    return results.map((lead) => ({
      "S.No": lead.serial,
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

    const firstLine =
      lines[0] || "leads";

    const safeQuery =
      firstLine
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "leads";

    const date = new Date()
      .toISOString()
      .split("T")[0];

    const prefix =
      lines.length > 1
        ? "multi"
        : safeQuery;

    return `leads-${prefix}-${date}.${extension}`;
  };

  const exportJSON = () => {
    if (results.length === 0) return;

    const dataStr = JSON.stringify(
      buildExportRows(),
      null,
      2
    );

    const blob = new Blob(
      [dataStr],
      { type: "application/json" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      buildFilename("json");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (results.length === 0) return;

    const worksheet =
      XLSX.utils.json_to_sheet(
        buildExportRows()
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leads"
    );

    XLSX.writeFile(
      workbook,
      buildFilename("csv"),
      { bookType: "csv" }
    );
  };

  const exportExcel = () => {
    if (results.length === 0) return;

    const worksheet =
      XLSX.utils.json_to_sheet(
        buildExportRows()
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leads"
    );

    XLSX.writeFile(
      workbook,
      buildFilename("xlsx")
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-6xl mt-12">

        <h1 className="text-5xl font-bold text-center text-slate-800 mb-2">
          🔍 LeadExtractor
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Find businesses, schools, institutes, and more — anywhere in the world
        </p>

        <Card className="shadow-lg border-0 mb-6">
          <CardContent className="p-6">

            <Textarea
              placeholder={`Enter one search per line, e.g.:
Schools in Noida
Schools in Delhi
Schools in Gurgaon`}
              className="min-h-[120px] text-base mb-3 resize-y"
              value={queryText}
              onChange={(e) =>
                setQueryText(e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              <Button
                className="h-12 px-8 text-base font-medium sm:ml-auto"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading
                  ? "Searching…"
                  : "🔍 Search"}
              </Button>

            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              One query per line. Use{" "}
              <strong>Ctrl+Enter</strong>{" "}
              (or Cmd+Enter) to search.
              <br />
              Try: &quot;Schools in Noida&quot;
              &bull; &quot;Clinics in London&quot;
              &bull; &quot;Gyms in Toronto&quot;
            </p>

          </CardContent>
        </Card>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">

            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>

            <p className="text-slate-500 text-sm">
              Fetching results… This can take 30–90 seconds for multiple queries.
            </p>

          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading &&
          !error &&
          searched &&
          results.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No results found. Try a different search.
            </div>
          )}

        {!loading &&
          !error &&
          results.length > 0 && (
            <Card className="shadow-lg border-0">

              <CardContent className="p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

                  <div>

                    <h2 className="text-lg font-semibold text-slate-800">
                      Results: {results.length} businesses found
                    </h2>

                    <span className="text-xs text-slate-400">
                      Source: Google Maps via Apify
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportJSON}
                    >
                      📥 JSON
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCSV}
                    >
                      📥 CSV
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportExcel}
                    >
                      📥 Excel
                    </Button>

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <Table>

                    <TableHeader>

                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Postal Code</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Latitude</TableHead>
                        <TableHead>Longitude</TableHead>
                      </TableRow>

                    </TableHeader>

                    <TableBody>

                      {results.map((lead) => (

                        <TableRow key={lead.serial}>

                          <TableCell className="font-medium">
                            {lead.serial}
                          </TableCell>

                          <TableCell className="font-medium">
                            {lead.name || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.phone || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.email || "—"}
                          </TableCell>

                          <TableCell
                            className="max-w-xs truncate"
                            title={lead.address || ""}
                          >
                            {lead.address || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.city || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.state || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.country || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.postalCode || "—"}
                          </TableCell>

                          <TableCell>

                            {lead.website ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Visit
                              </a>
                            ) : (
                              "—"
                            )}

                          </TableCell>

                          <TableCell>
                            {lead.category || "—"}
                          </TableCell>

                          <TableCell>
                            {lead.latitude ?? "—"}
                          </TableCell>

                          <TableCell>
                            {lead.longitude ?? "—"}
                          </TableCell>

                        </TableRow>

                      ))}

                    </TableBody>

                  </Table>

                </div>

              </CardContent>

            </Card>
          )}

      </div>
    </main>
  );
}