import { useState, useCallback } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
} from "mantine-react-table";
import { Badge, Container, Title, Text, Anchor } from "@mantine/core";
import { CsvUpload } from "./csv-upload";
import { formatCurrency, detectColumnType, sanitizeKey } from "./helpers";
import type { Listing } from "./helpers";

// Listing type is exported from helpers

// -------------------------------------------------------------------
// helpers moved outside component to avoid stale closures
// -------------------------------------------------------------------

// helpers moved to ./helpers.ts

export function ListingsTable() {
  const [data, setData] = useState<Listing[]>([]);
  const [columns, setColumns] = useState<MRT_ColumnDef<Listing>[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialColumnVisibility, setInitialColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const handleDataLoaded = useCallback(
    (loadedData: Listing[], headers: string[]) => {
      console.log("Data loaded from CSV:", loadedData);
      console.log("Headers:", headers);
      setLoading(true);

      // Build column definitions for all headers so the data remains available,
      // but we'll compute a visibility map to hide everything except the desired columns.
      const desired = new Set(
        [
          "price",
          "short address",
          "beds",
          "baths",
          "footage",
          "price per sq. ft.",
          "url",
        ].map((s) => s.toLowerCase()),
      );

      const headerMap = new Map<string, string>();
      for (const h of headers) headerMap.set(String(h).toLowerCase(), h);

      const allColumns: MRT_ColumnDef<Listing>[] = headers.map((header) => {
        const type = detectColumnType(header, loadedData.slice(0, 50));
        const safeKey = sanitizeKey(header);

        return {
          accessorKey: safeKey,
          header: header,
          accessorFn: (row: Listing) => row[header as string],
          filterVariant:
            type === "number" || type === "currency" ? "range" : "text",
          Cell: ({ cell }: { cell: MRT_Cell<Listing> }) => {
            const val = cell.getValue<string | number>();
            if (val === null || val === undefined) return "";

            if (type === "url") {
              const urlStr = String(val).trim();
              return (
                <Anchor href={urlStr} target="_blank" rel="noopener noreferrer">
                  Link
                </Anchor>
              );
            }

            if (type === "currency") {
              const num = Number(String(val).replace(/[$,]/g, ""));
              if (!isNaN(num)) {
                return (
                  <Badge color="green" variant="light">
                    {formatCurrency(num)}
                  </Badge>
                );
              }
            }

            if (type === "date") {
              try {
                return new Date(String(val)).toLocaleDateString();
              } catch (e) {
                console.warn("Failed to parse date:", e);
                return String(val);
              }
            }

            return String(val);
          },
        };
      });

      // If we can detect both a price and a sqft column, add a derived "Price / sqft" column
      // Better detection for price and sqft-like columns:
      const lowHeaders = headers.map((h) => String(h).toLowerCase());

      // Prefer an exact "Price" column, otherwise any column containing 'price' but not 'price per' or 'per sqft'.
      const priceExact = lowHeaders.findIndex((h) => h.trim() === "price");
      const priceKey =
        priceExact >= 0
          ? headers[priceExact]
          : headers.find(
              (h) =>
                /price/i.test(String(h)) &&
                !/price\s*per|per\s*sq|per\s*sqft/i.test(String(h)),
            );

      // sqft-like detection - include 'footage' and variations; exclude columns that are already 'price per ...'
      const sqftRegex =
        /(footage|sq\.?\s*ft|sqft|sq ft|living area|lot area|area|living_area)/i;
      const sqftKey = headers.find(
        (h) =>
          sqftRegex.test(String(h)) &&
          !/price\s*per|per\s*sq|per\s*sqft/i.test(String(h)),
      );

      console.debug("Detected priceKey, sqftKey:", priceKey, sqftKey);

      // If the CSV already contains a `Price Per Sq. Ft.` column we showed it above.
      // Otherwise, if we can detect price and sqft columns, add a derived `Price Per Sq. Ft.` column.
      const csvHasPricePer = headerMap.has("price per sq. ft.");

      let derivedSafeKey: string | null = null;
      if (!csvHasPricePer && priceKey && sqftKey) {
        // create a safe accessor key for the derived column as well
        derivedSafeKey = `price_per_sqft__${priceKey}__${sqftKey}`.replace(
          /[^a-zA-Z0-9_]/g,
          "_",
        );

        const derivedCol: MRT_ColumnDef<Listing> = {
          accessorKey: derivedSafeKey,
          header: "Price Per Sq. Ft.",
          enableSorting: true,
          // compute value from row
          accessorFn: (row: Listing) => {
            const pRaw = row[priceKey as string];
            const sRaw = row[sqftKey as string];
            // strip non-numeric characters
            const p = Number(String(pRaw ?? "").replace(/[^0-9.-]/g, ""));
            const s = Number(String(sRaw ?? "").replace(/[^0-9.-]/g, ""));
            if (!isFinite(p) || !isFinite(s) || s === 0) return null;
            return p / s;
          },
          Cell: ({ cell }: { cell: MRT_Cell<Listing> }) => {
            const val = cell.getValue<number | null>();
            if (val === null || val === undefined || isNaN(Number(val)))
              return "";
            const num = Number(val);
            const decimals = Math.abs(num) < 1 ? 2 : 0;
            const formatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }).format(num);
            return `${formatted}/sqft`;
          },
        };
        // append derived column at the end of all columns so it's available
        allColumns.push(derivedCol);
      }

      // Build column visibility: show only desired columns (by original header name),
      // and show all URL columns and the derived column if present.
      const columnVisibility: Record<string, boolean> = {};
      for (const h of headers) {
        const safe = sanitizeKey(h);
        const type = detectColumnType(h, loadedData.slice(0, 50));
        columnVisibility[safe] =
          desired.has(String(h).toLowerCase()) || type === "url";
      }
      if (derivedSafeKey) columnVisibility[derivedSafeKey] = true;

      setColumns(allColumns);
      setInitialColumnVisibility(columnVisibility);
      setData(loadedData);
      // reset filters & sorting on new data load
      setColumnFilters([]);
      setSorting([]);
      setLoading(false);
    },
    [],
  );

  return (
    <Container
      fluid
      py="xl"
      style={{ width: "90%", margin: "0 auto", maxWidth: "none" }}
    >
      <Title order={2} mb="lg">
        House Scoring & Analysis
      </Title>

      <CsvUpload onDataLoaded={handleDataLoaded} />

      {data.length > 0 ? (
        <>
          <MantineReactTable
            columns={columns}
            data={data}
            enableRowNumbers
            manualFiltering={false}
            manualSorting={false}
            onColumnFiltersChange={setColumnFilters}
            onSortingChange={setSorting}
            state={{
              columnFilters,
              sorting,
              showProgressBars: loading,
            }}
            initialState={{
              density: "xs",
              columnVisibility: initialColumnVisibility,
            }}
          />
        </>
      ) : (
        <Text c="dimmed" fs="italic" mt="xl" ta="center">
          Upload a CSV file to view listings.
        </Text>
      )}
    </Container>
  );
}
