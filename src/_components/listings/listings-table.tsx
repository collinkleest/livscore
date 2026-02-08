import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { Badge, Container, Title } from "@mantine/core";

interface Listing {
  id: number;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
}

const mockListings: Listing[] = [
  {
    id: 1,
    address: "123 Oak Street, San Francisco, CA",
    price: 1250000,
    beds: 3,
    baths: 2,
    sqft: 2100,
  },
  {
    id: 2,
    address: "456 Maple Avenue, Oakland, CA",
    price: 850000,
    beds: 2,
    baths: 1,
    sqft: 1400,
  },
  {
    id: 3,
    address: "789 Pine Road, Berkeley, CA",
    price: 1500000,
    beds: 4,
    baths: 3,
    sqft: 2800,
  },
  {
    id: 4,
    address: "321 Elm Boulevard, San Jose, CA",
    price: 950000,
    beds: 3,
    baths: 2,
    sqft: 1800,
  },
  {
    id: 5,
    address: "654 Cedar Lane, Palo Alto, CA",
    price: 2100000,
    beds: 4,
    baths: 3,
    sqft: 3200,
  },
];

export function ListingsTable() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const columns = useMemo<MRT_ColumnDef<Listing>[]>(
    () => [
      {
        accessorKey: "address",
        header: "Address",
        size: 200,
      },
      {
        accessorKey: "price",
        header: "Price",
        Cell: ({ cell }) => (
          <Badge color="green" variant="light">
            {formatPrice(cell.getValue<number>())}
          </Badge>
        ),
      },
      {
        accessorKey: "beds",
        header: "Bedrooms",
        size: 100,
        Cell: ({ cell }) => `${cell.getValue()} bd`,
      },
      {
        accessorKey: "baths",
        header: "Bathrooms",
        size: 100,
        Cell: ({ cell }) => `${cell.getValue()} ba`,
      },
      {
        accessorKey: "sqft",
        header: "Square Feet",
        Cell: ({ cell }) => `${cell.getValue<number>().toLocaleString()} sq ft`,
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: mockListings,
    enableRowNumbers: true,
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">
        Available Listings
      </Title>
      <MantineReactTable table={table} />
    </Container>
  );
}
