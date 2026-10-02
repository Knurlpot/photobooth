export type FilterId =
  | "original"
  | "noir"
  | "sepia"
  | "vivid"
  | "cool"
  | "warm"
  | "fade"
  | "soft";

export interface FilterPreset {
  id: FilterId;
  label: string;
  // CSS filter string used for the instant client-side preview.
  // Kept close to the Pillow implementation of the same name on the
  // backend, which is what actually gets baked into the download.
  css: string;
  // Representative color for the swatch dot in the filter picker.
  swatch: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "original", label: "Original", css: "none", swatch: "#FCEFCB" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.25)", swatch: "#2A2420" },
  { id: "sepia", label: "Sepia", css: "sepia(0.75) contrast(1.05)", swatch: "#8A6A45" },
  { id: "vivid", label: "Vivid", css: "saturate(1.55) contrast(1.12)", swatch: "#E5342A" },
  { id: "cool", label: "Cool", css: "saturate(1.05) hue-rotate(-8deg) brightness(1.02)", swatch: "#4C6B8A" },
  { id: "warm", label: "Warm", css: "saturate(1.1) hue-rotate(8deg) brightness(1.03)", swatch: "#D98A3D" },
  { id: "fade", label: "Fade", css: "saturate(0.7) contrast(0.85) brightness(1.1)", swatch: "#D9CBA3" },
  { id: "soft", label: "Soft", css: "brightness(1.05) contrast(0.95) blur(0.3px)", swatch: "#E7B8B0" },
];

export type LayoutId = "strip" | "grid";

export interface LayoutPreset {
  id: LayoutId;
  label: string;
  columns: 1 | 2;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "strip", label: "Strip", columns: 1 },
  { id: "grid", label: "Grid", columns: 2 },
];

export const STRIP_COLORS = [
  { id: "black", label: "Black", hex: "#000000" },
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "red", label: "Red", hex: "#E5342A" },
  { id: "orange", label: "Orange", hex: "#F28C28" },
  { id: "yellow", label: "Yellow", hex: "#F4D03F" },
  { id: "blue", label: "Blue", hex: "#2878D0" },
  { id: "violet", label: "Violet", hex: "#7B3FB2" },
  { id: "pink", label: "Pink", hex: "#E86A9A" },
] as const;

export type StripColor = (typeof STRIP_COLORS)[number]["id"];
