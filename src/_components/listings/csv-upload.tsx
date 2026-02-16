import { useState, useEffect, useCallback } from "react";
import { Group, FileInput, Text, Button, Alert, Loader, Stack, Paper } from "@mantine/core";
import { IconUpload, IconFileText, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import Papa from "papaparse";
import pako from "pako";

interface CsvMeta {
  name: string;
  size: number;
  lastModified: number;
  uploadTimestamp: string;
}

interface CsvUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataLoaded: (data: any[], headers: string[], meta: CsvMeta | null) => void;
}

const STORAGE_KEY_CONTENT = "house-scoring-csv-content";
const STORAGE_KEY_META = "house-scoring-csv-meta";

export function CsvUpload({ onDataLoaded }: CsvUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CsvMeta | null>(null);

  const parseCsv = useCallback((csvText: string, metaData: CsvMeta) => {
    console.log("Parsing CSV content length:", csvText.length);
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Papa Parse Results:", results);
        if (results.data && results.data.length > 0) {
            // Extract headers from the first row keys
            const headers = results.meta.fields || Object.keys(results.data[0] as object);
            console.log("Extracted headers:", headers);
            onDataLoaded(results.data, headers, metaData);
        } else {
             console.warn("No data found in CSV parse results");
             setError("No data found in CSV file.");
             onDataLoaded([], [], null);
        }
        setLoading(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (err: any) => {
        console.error("Papa Parse Error:", err);
        setError("Error parsing CSV: " + (err.message || String(err)));
        setLoading(false);
      }
    });
  }, [onDataLoaded]);

  useEffect(() => {
    const loadFromStorage = () => {
        try {
        const storedMeta = localStorage.getItem(STORAGE_KEY_META);
        const storedContent = localStorage.getItem(STORAGE_KEY_CONTENT);

        if (storedMeta && storedContent) {
            const parsedMeta: CsvMeta = JSON.parse(storedMeta);
            setMeta(parsedMeta);
            
            // Decompress
            const binaryString = atob(storedContent);
            const charData = binaryString.split('').map(x => x.charCodeAt(0));
            const binData = new Uint8Array(charData);
            const data = pako.inflate(binData, { to: 'string' });

            parseCsv(data, parsedMeta);
        }
        } catch (err) {
        console.error("Failed to load from storage", err);
        // specific error handling if needed
        }
    };
    loadFromStorage();
  }, [parseCsv]);

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    console.log("File uploaded:", file.name, file.size);
    setError(null);
    setLoading(true);

    // Hard limit: 4MB
    if (file.size > 4 * 1024 * 1024) {
      setError("File too large (max 4 MB). Please try a smaller file.");
      setLoading(false);
      return;
    }

    // Soft warning handled by UI text, but we proceed.

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        console.log("File read successfully, content length:", csvContent.length);
        
        // Compress
        const compressed = pako.deflate(csvContent);
        
        // Convert to base64 for storage (safe for large files)
        let binary = '';
        const len = compressed.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(compressed[i]);
        }
        const base64 = btoa(binary);

        const newMeta: CsvMeta = {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          uploadTimestamp: new Date().toISOString(),
        };

        try {
            localStorage.setItem(STORAGE_KEY_CONTENT, base64);
            localStorage.setItem(STORAGE_KEY_META, JSON.stringify(newMeta));
            setMeta(newMeta);
            parseCsv(csvContent, newMeta);
        } catch (storageErr) {
            console.warn("Storage failed", storageErr);
            setError("Storage failed (likely quota exceeded). Data loaded but not saved.");
            // Still load the data even if storage fails
            setMeta(newMeta); 
            parseCsv(csvContent, newMeta); 
        }

      } catch (err) {
        setError("Error processing file: " + err);
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY_CONTENT);
    localStorage.removeItem(STORAGE_KEY_META);
    setMeta(null);
    onDataLoaded([], [], null);
  };

  return (
    <Stack mb="md">
        {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setError(null)}>
                {error}
            </Alert>
        )}
        
      <Group align="flex-end">
        <FileInput
          label="Upload Listings CSV"
          description="Max 4MB. Persists locally."
          placeholder={meta ? "Replace current CSV" : "Select CSV file"}
          accept=".csv"
          leftSection={<IconUpload size={14} />}
          onChange={handleFileUpload}
          disabled={loading}
          style={{ flex: 1 }}
        />
        {meta && (
            <Button color="red" variant="light" onClick={clearData} leftSection={<IconTrash size={14} />}>
                Clear Data
            </Button>
        )}
      </Group>

      {loading && <Loader size="sm" />}

      {meta && !loading && (
        <Paper p="xs" withBorder bg="var(--mantine-color-gray-0)">
            <Group gap="xs">
                <IconFileText size={16} color="gray" />
                <Text size="sm" c="dimmed">
                    Loaded: <b>{meta.name}</b> ({(meta.size / 1024).toFixed(1)} KB) • {new Date(meta.uploadTimestamp).toLocaleString()}
                </Text>
            </Group>
        </Paper>
      )}
    </Stack>
  );
}