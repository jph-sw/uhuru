import { Button } from "#/components/ui/button";
import { useTheme } from "#/hooks/theme";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const next: Record<string, "light" | "dark" | "system"> = {
		light: "dark",
		dark: "system",
		system: "light",
	};

	const label: Record<string, string> = {
		light: "Light",
		dark: "Dark",
		system: "System",
	};

	return (
		<Button variant="outline" onClick={() => setTheme(next[theme])}>
			{label[theme]}
		</Button>
	);
}
