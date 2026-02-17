import { ListingsTable, ThemeToolbar } from "./_components";
import { Tabs, Container, Stack } from "@mantine/core";
import HowToStart from "./_components/listings/how-to-start";

function App() {
  return (
    <Stack>
      <ThemeToolbar />

      <Container
        fluid
        style={{ width: "90%", margin: "0 auto", maxWidth: "none" }}
      >
        <Tabs defaultValue="listings">
          <Tabs.List>
            <Tabs.Tab value="listings">Listings</Tabs.Tab>
            <Tabs.Tab value="howto">How to Start</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="listings" pt="xs">
            <ListingsTable />
          </Tabs.Panel>

          <Tabs.Panel value="howto" pt="xs">
            <HowToStart />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Stack>
  );
}

export default App;
