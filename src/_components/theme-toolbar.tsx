import {
  ActionIcon,
  Group,
  useMantineColorScheme,
  useComputedColorScheme,
  Text,
  Paper,
} from "@mantine/core";
import { IconSun, IconMoon, IconHome } from "@tabler/icons-react";

export function ThemeToolbar() {
  const { setColorScheme } = useMantineColorScheme();
  // default to dark when no preference is stored
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <Paper
      radius={0}
      p="xs"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        width: "90%",
        margin: "0 auto",
      }}
    >
      <Group justify="space-between" px="md">
        <Group>
          <IconHome size={20} />
          <Text fw={700}>LivScore</Text>
        </Group>

        <ActionIcon
          onClick={() =>
            setColorScheme(computedColorScheme === "light" ? "dark" : "light")
          }
          variant="default"
          size="lg"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === "light" ? (
            <IconMoon stroke={1.5} />
          ) : (
            <IconSun stroke={1.5} />
          )}
        </ActionIcon>
      </Group>
    </Paper>
  );
}
