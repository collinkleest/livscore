import { Group, FileInput } from "@mantine/core";

interface Listing {
  id: number;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
}

interface CsvUploadProps {
  onDataLoaded: (data: Listing[]) => void;
}

export function CsvUpload({ onDataLoaded }: CsvUploadProps) {
  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const parsed: Listing[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(",").map((v) => v.trim());
            return {
              id: index + 1,
              address: values[headers.indexOf("address")] || "",
              price: parseFloat(values[headers.indexOf("price")] || "0"),
              beds: parseInt(values[headers.indexOf("beds")] || "0"),
              baths: parseInt(values[headers.indexOf("baths")] || "0"),
              sqft: parseInt(values[headers.indexOf("sqft")] || "0"),
            };
          });

        onDataLoaded(parsed);
      } catch (error) {
        alert("Error parsing CSV file: " + error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Group mb="md">
      <FileInput
        label="Upload CSV"
        placeholder="Click to upload CSV file"
        accept=".csv"
        onChange={(file) => {
          handleFileUpload(file);
          // Reset input
          const input = document.querySelector(
            'input[type="file"]',
          ) as HTMLInputElement;
          if (input) input.value = "";
        }}
      />
    </Group>
  );
}
