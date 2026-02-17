import { Title, Text, Anchor, List } from "@mantine/core";

export function HowToStart() {
  return (
    <div>
      <Title order={2} mb="md">
        How to get listings into LivScore
      </Title>

      <Text mb="sm">
        Install the Chrome extension linked below, use it to extract Zillow
        search results, export as CSV, then upload the CSV on the Listings tab.
      </Text>

      <List spacing="sm" withPadding>
        <List.Item>
          <Anchor
            href="https://chromewebstore.google.com/detail/jdidjlghecfpaedabjinjfpdlcioeklo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Install the Chrome extension from the Chrome Web Store
          </Anchor>
        </List.Item>
        <List.Item>
          Open Zillow and run your search (city, neighborhood, filters).
        </List.Item>
        <List.Item>
          Use the extension to extract the listings from the search results.
        </List.Item>
        <List.Item>Export the extracted data as a CSV file.</List.Item>
        <List.Item>
          Return to the <strong>Listings</strong> tab and upload the CSV using
          the file picker.
        </List.Item>
      </List>

      <Text mt="md" c="dimmed">
        Note: the tool expects the CSV to include columns like Price, Short
        Address, Beds, Baths and Footage. If the CSV has a Price Per Sq. Ft.
        column it will be shown; otherwise LivScore will compute it when
        possible.
      </Text>
    </div>
  );
}

export default HowToStart;
