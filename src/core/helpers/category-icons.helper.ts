import {
	Building2,
	Droplets,
	Hammer,
	Paintbrush,
	ShieldCheck,
	Sparkles,
	TreePine,
	Wind,
	Wrench,
	Zap,
	type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
	bolt: Zap,
	water: Droplets,
	hammer: Hammer,
	brush: Paintbrush,
	sparkles: Sparkles,
	wind: Wind,
	tool: Wrench,
	building: Building2,
	shield: ShieldCheck,
	tree: TreePine,
};

export function getCategoryIcon(iconName: string): LucideIcon {
	return CATEGORY_ICON_MAP[iconName] ?? Sparkles;
}
