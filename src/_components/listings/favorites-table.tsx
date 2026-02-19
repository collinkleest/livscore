import { useState } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
} from "mantine-react-table";
import { Badge, Button, Anchor } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { formatCurrency, detectColumnType, sanitizeKey } from "./helpers";
import type { Listing } from "./helpers";

interface FavoritesTableProps {
  favorites: Listing[];
  onRemove: (index: number) => void;
  allHeaders: string[];
  desired: Set<string>;
}

export function FavoritesTable({
  favorites,
  onRemove,
  allHeaders,
  desired,
}: FavoritesTableProps) {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const columns: MRT_ColumnDef<Listing>[] = [
    {
      accessorKey: "favorite_action",
      header: "Action",
      enableSorting: false,
      enableColumnFilter: false,
      size: 60,
      Cell: ({ row }: { row: { index: number } }) => (
        <Button
          size="xs"
          color="red"
          variant="light"
          leftSection={<IconTrash size={14} />}
          onClick={() => onRemove(row.index)}
        >
          Remove
        </Button>
      ),
    },
    ...allHeaders.map((header) => {
      const type = detectColumnType(header, favorites.slice(0, 50));
      const safeKey = sanitizeKey(header);

      return {
        accessorKey: safeKey,
        header: header,
        accessorFn: (row: Listing) => row[header as string],
        filterVariant:
          type === "number" || type === "currency"
            ? ("range" as const)
            : ("text" as const),
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
    }),
  ];

  // Build column visibility: show only desired columns (by original header name),
  // and show all URL columns.
  const columnVisibility: Record<string, boolean> = {};
  for (const h of allHeaders) {
    const safe = sanitizeKey(h);
    const type = detectColumnType(h, favorites.slice(0, 50));
    columnVisibility[safe] =
      desired.has(String(h).toLowerCase()) || type === "url";
  }

  return (
    <MantineReactTable
      columns={columns}
      data={favorites}
      enableRowNumbers
      manualFiltering={false}
      manualSorting={false}
      onColumnFiltersChange={setColumnFilters}
      onSortingChange={setSorting}
      state={{
        columnFilters,
        sorting,
      }}
      initialState={{
        density: "xs",
        columnVisibility: columnVisibility,
      }}
    />
  );
}
