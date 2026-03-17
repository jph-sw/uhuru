import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type Field = {
	id: string;
	key: string | null;
	content: string | null;
	siteId: string | null;
	language?: string | null;
};

export function groupFields(fields: Field[]): Record<string, Field[]> {
	const groups: Record<string, Field[]> = {};
	for (const field of fields) {
		const top = field.key?.split(".")[0] ?? "ungrouped";
		groups[top] ??= [];
		groups[top].push(field);
	}
	return groups;
}
