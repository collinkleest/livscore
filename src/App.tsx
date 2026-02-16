import "./App.css";
import { ListingsTable, ThemeToolbar } from "./_components";
import { Stack } from "@mantine/core";

function App() {
  return (
    <Stack>
      <ThemeToolbar />
      <ListingsTable />
    </Stack>
  );
}

export default App;