import { useState, useCallback } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
} from "mantine-react-table";
import { Badge, Container, Title, Text } from "@mantine/core";
import { CsvUpload } from "./csv-upload";

// Since we don't know the exact shape, use Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listing = Record<string, any>;

// -------------------------------------------------------------------
// helpers moved outside component to avoid stale closures
// -------------------------------------------------------------------

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to detect column type based on data
const detectColumnType = (
  header: string,
  sampleData: Listing[],
): "currency" | "number" | "date" | "string" => {
  let isCurrency = true;
  let isNumber = true;
  let isDate = true;

  let samplesChecked = 0;

  for (const row of sampleData) {
    const val = row[header];
    if (val === undefined || val === null || val === "") continue;
    samplesChecked++;

    const strVal = String(val).trim();

    // Check currency
    if (!/^\$?\s?[\d,]+(\.\d+)?$/.test(strVal)) {
      isCurrency = false;
    }
    // check number (allow commas)
    if (isNaN(Number(strVal.replace(/[$,]/g, "")))) {
      isNumber = false;
      isCurrency = false; // if not number, not currency
    }

    // Check date (simple check)
    if (isNaN(Date.parse(strVal))) {
      isDate = false;
    }
  }

  if (samplesChecked === 0) return "string";

  if (isCurrency && header.toLowerCase().includes("price")) return "currency";
  if (isNumber) return "number";
  if (isDate) return "date";

  return "string";
};

export function ListingsTable() {
  const [data, setData] = useState<Listing[]>([]);
  const [columns, setColumns] = useState<MRT_ColumnDef<Listing>[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDataLoaded = useCallback(
    (loadedData: Listing[], headers: string[]) => {
      console.log("Data loaded from CSV:", loadedData);
      console.log("Headers:", headers);
      setLoading(true);

      const newColumns: MRT_ColumnDef<Listing>[] = headers.map((header) => {
        const type = detectColumnType(header, loadedData.slice(0, 50));

        return {
          accessorKey: header,
          header: header,
          filterVariant:
            type === "number" || type === "currency" ? "range" : "text",
          Cell: ({ cell }: { cell: MRT_Cell<Listing> }) => {
            const val = cell.getValue<string | number>();
            if (val === null || val === undefined) return "";

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
              } catch {
                return String(val);
              }
            }

            return String(val);
          },
        };
      });

      setColumns(newColumns);
      setData(loadedData);
      setLoading(false);
    },
    [],
  );

  return (
    <Container size="xl" py="xl">
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
            state={{ showProgressBars: loading }}
            initialState={{ density: "xs" }}
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
