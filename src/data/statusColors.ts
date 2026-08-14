// Status Color System - Auto-generated
// Generated on 2026-08-14

export interface StatusColor {
  type: string;
  ring: string;
  badge: string;
  hex: string;
  filled: string;
  text: string;
}

export const eventColors: StatusColor[] = [
  { type: "Pickup", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "Drop", ring: "border-orange-700", badge: "text-orange-800 bg-orange-50 border-orange-300", hex: "#C2410C", filled: "bg-orange-700", text: "text-orange-700" },
  { type: "Hook", ring: "border-amber-400", badge: "text-amber-600 bg-amber-50 border-amber-200", hex: "#FBBF24", filled: "bg-amber-400", text: "text-amber-400" },
  { type: "Border", ring: "border-cyan-500", badge: "text-cyan-700 bg-cyan-50 border-cyan-200", hex: "#06B6D4", filled: "bg-cyan-500", text: "text-cyan-500" },
  { type: "Unload", ring: "border-fuchsia-600", badge: "text-fuchsia-800 bg-fuchsia-50 border-fuchsia-300", hex: "#C026D3", filled: "bg-fuchsia-600", text: "text-fuchsia-600" },
  { type: "Load", ring: "border-violet-500", badge: "text-violet-700 bg-violet-50 border-violet-200", hex: "#8B5CF6", filled: "bg-violet-500", text: "text-violet-500" },
  { type: "Delivery", ring: "border-green-500", badge: "text-green-700 bg-green-50 border-green-200", hex: "#22C55E", filled: "bg-green-500", text: "text-green-500" },
  { type: "Checkall", ring: "border-slate-500", badge: "text-slate-700 bg-slate-50 border-slate-200", hex: "#64748B", filled: "bg-slate-500", text: "text-slate-500" },
  { type: "Gatepass", ring: "border-indigo-500", badge: "text-indigo-700 bg-indigo-50 border-indigo-200", hex: "#6366F1", filled: "bg-indigo-500", text: "text-indigo-500" },
  { type: "Pay", ring: "border-lime-500", badge: "text-lime-700 bg-lime-50 border-lime-200", hex: "#84CC16", filled: "bg-lime-500", text: "text-lime-500" },
  { type: "Acquire", ring: "border-purple-700", badge: "text-purple-800 bg-purple-50 border-purple-300", hex: "#7E22CE", filled: "bg-purple-700", text: "text-purple-700" },
  { type: "Release", ring: "border-emerald-700", badge: "text-emerald-800 bg-emerald-50 border-emerald-300", hex: "#047857", filled: "bg-emerald-700", text: "text-emerald-700" },
  { type: "Deadhead", ring: "border-stone-500", badge: "text-stone-700 bg-stone-50 border-stone-200", hex: "#78716C", filled: "bg-stone-500", text: "text-stone-500" },
  { type: "ReRoute", ring: "border-rose-500", badge: "text-rose-700 bg-rose-50 border-rose-200", hex: "#F43F5E", filled: "bg-rose-500", text: "text-rose-500" },
];

export const transitStatusColors: StatusColor[] = [
  { type: "Assigned", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "AtDelivery", ring: "border-green-500", badge: "text-green-700 bg-green-50 border-green-200", hex: "#22C55E", filled: "bg-green-500", text: "text-green-500" },
  { type: "AtPickup", ring: "border-indigo-500", badge: "text-indigo-700 bg-indigo-50 border-indigo-200", hex: "#6366F1", filled: "bg-indigo-500", text: "text-indigo-500" },
  { type: "Dropped", ring: "border-orange-700", badge: "text-orange-800 bg-orange-50 border-orange-300", hex: "#C2410C", filled: "bg-orange-700", text: "text-orange-700" },
  { type: "Loaded", ring: "border-violet-500", badge: "text-violet-700 bg-violet-50 border-violet-200", hex: "#8B5CF6", filled: "bg-violet-500", text: "text-violet-500" },
  { type: "OnDock", ring: "border-amber-400", badge: "text-amber-600 bg-amber-50 border-amber-200", hex: "#FBBF24", filled: "bg-amber-400", text: "text-amber-400" },
  { type: "OnRouteDelivery", ring: "border-emerald-700", badge: "text-emerald-800 bg-emerald-50 border-emerald-300", hex: "#047857", filled: "bg-emerald-700", text: "text-emerald-700" },
  { type: "OnRouteDrop", ring: "border-yellow-800", badge: "text-yellow-900 bg-yellow-50 border-yellow-300", hex: "#854D0E", filled: "bg-yellow-800", text: "text-yellow-800" },
  { type: "OnRoutePickup", ring: "border-cyan-500", badge: "text-cyan-700 bg-cyan-50 border-cyan-200", hex: "#06B6D4", filled: "bg-cyan-500", text: "text-cyan-500" },
  { type: "Unassigned", ring: "border-slate-400", badge: "text-slate-600 bg-slate-50 border-slate-200", hex: "#94A3B8", filled: "bg-slate-400", text: "text-slate-400" },
  { type: "Pending", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "Completed", ring: "border-emerald-500", badge: "text-emerald-700 bg-emerald-50 border-emerald-200", hex: "#10B981", filled: "bg-emerald-500", text: "text-emerald-500" },
  { type: "InTransit", ring: "border-sky-500", badge: "text-sky-700 bg-sky-50 border-sky-200", hex: "#0EA5E9", filled: "bg-sky-500", text: "text-sky-500" },
  { type: "Delayed", ring: "border-red-500", badge: "text-red-700 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "Cancelled", ring: "border-red-800", badge: "text-red-900 bg-red-50 border-red-300", hex: "#991B1B", filled: "bg-red-800", text: "text-red-800" },
  { type: "Dispatched", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
  { type: "Arrived", ring: "border-lime-500", badge: "text-lime-700 bg-lime-50 border-lime-200", hex: "#84CC16", filled: "bg-lime-500", text: "text-lime-500" },
];

export const legStatusColors: StatusColor[] = [
  { type: "Not Ready", ring: "border-slate-400", badge: "text-slate-600 bg-slate-50 border-slate-200", hex: "#94A3B8", filled: "bg-slate-400", text: "text-slate-400" },
  { type: "Ready to Assign", ring: "border-sky-500", badge: "text-sky-700 bg-sky-50 border-sky-200", hex: "#0EA5E9", filled: "bg-sky-500", text: "text-sky-500" },
  { type: "Driver Assigned", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "Driver Confirmed", ring: "border-indigo-500", badge: "text-indigo-700 bg-indigo-50 border-indigo-200", hex: "#6366F1", filled: "bg-indigo-500", text: "text-indigo-500" },
  { type: "Planned", ring: "border-violet-500", badge: "text-violet-700 bg-violet-50 border-violet-200", hex: "#8B5CF6", filled: "bg-violet-500", text: "text-violet-500" },
  { type: "Dispatched", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
  { type: "Completed", ring: "border-emerald-500", badge: "text-emerald-700 bg-emerald-50 border-emerald-200", hex: "#10B981", filled: "bg-emerald-500", text: "text-emerald-500" },
];

export const driverAssignmentSubStatusColors: StatusColor[] = [
  { type: "Pending", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "Sent for Confirmation", ring: "border-blue-400", badge: "text-blue-600 bg-blue-50 border-blue-200", hex: "#60A5FA", filled: "bg-blue-400", text: "text-blue-400" },
  { type: "Confirmed", ring: "border-emerald-500", badge: "text-emerald-700 bg-emerald-50 border-emerald-200", hex: "#10B981", filled: "bg-emerald-500", text: "text-emerald-500" },
  { type: "Rejected", ring: "border-red-500", badge: "text-red-700 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "Expired", ring: "border-stone-500", badge: "text-stone-700 bg-stone-50 border-stone-200", hex: "#78716C", filled: "bg-stone-500", text: "text-stone-500" },
];

export const poStatusColors: StatusColor[] = [
  { type: "Cancelled", ring: "border-red-800", badge: "text-red-900 bg-red-50 border-red-300", hex: "#991B1B", filled: "bg-red-800", text: "text-red-800" },
  { type: "TONU", ring: "border-emerald-700", badge: "text-emerald-800 bg-emerald-50 border-emerald-300", hex: "#047857", filled: "bg-emerald-700", text: "text-emerald-700" },
  { type: "Dispatched", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
  { type: "Pending", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "Delivered", ring: "border-emerald-700", badge: "text-emerald-800 bg-emerald-50 border-emerald-300", hex: "#047857", filled: "bg-emerald-700", text: "text-emerald-700" },
];

export const trailerDispatchColors: StatusColor[] = [
  { type: "Available", ring: "border-slate-400", badge: "text-slate-600 bg-slate-50 border-slate-200", hex: "#94A3B8", filled: "bg-slate-400", text: "text-slate-400" },
  { type: "Assigned", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "Dispatched", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
];

export const truckStatusColors: StatusColor[] = [
  { type: "Available", ring: "border-slate-400", badge: "text-slate-600 bg-slate-50 border-slate-200", hex: "#94A3B8", filled: "bg-slate-400", text: "text-slate-400" },
  { type: "Assigned", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "Dispatched", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
];

export const trailerLoadStateColors: StatusColor[] = [
  { type: "Empty", ring: "border-neutral-400", badge: "text-neutral-600 bg-neutral-50 border-neutral-200", hex: "#A3A3A3", filled: "bg-neutral-400", text: "text-neutral-400" },
  { type: "Loaded", ring: "border-green-500", badge: "text-green-700 bg-green-50 border-green-200", hex: "#22C55E", filled: "bg-green-500", text: "text-green-500" },
  { type: "SuspenseLoad", ring: "border-amber-500", badge: "text-amber-700 bg-amber-50 border-amber-200", hex: "#F59E0B", filled: "bg-amber-500", text: "text-amber-500" },
  { type: "WaitingForLoad", ring: "border-sky-500", badge: "text-sky-700 bg-sky-50 border-sky-200", hex: "#0EA5E9", filled: "bg-sky-500", text: "text-sky-500" },
  { type: "WaitingForUnload", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
];

export const equipmentStatusColors: StatusColor[] = [
  { type: "Active", ring: "border-green-500", badge: "text-green-700 bg-green-50 border-green-200", hex: "#22C55E", filled: "bg-green-500", text: "text-green-500" },
  { type: "AvailableForSale", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "OutOfService", ring: "border-red-500", badge: "text-red-700 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "Storage", ring: "border-slate-500", badge: "text-slate-700 bg-slate-50 border-slate-200", hex: "#64748B", filled: "bg-slate-500", text: "text-slate-500" },
];

export const tagColors: StatusColor[] = [
  { type: "Critical Probill", ring: "border-red-700", badge: "text-red-800 bg-red-100 border-red-300", hex: "#B91C1C", filled: "bg-red-700", text: "text-red-700" },
  { type: "IsCustomerCritical", ring: "border-rose-500", badge: "text-rose-700 bg-rose-50 border-rose-200", hex: "#F43F5E", filled: "bg-rose-500", text: "text-rose-500" },
  { type: "Expedite", ring: "border-purple-500", badge: "text-purple-700 bg-purple-50 border-purple-200 italic", hex: "#A855F7", filled: "bg-purple-500", text: "text-purple-500" },
  { type: "Damaged", ring: "border-red-500", badge: "text-red-700 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "Overweight", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "Out of Service", ring: "border-red-500", badge: "text-red-700 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "RED LIGHT", ring: "border-red-600", badge: "text-red-800 bg-red-50 border-red-300", hex: "#DC2626", filled: "bg-red-600", text: "text-red-600" },
  { type: "DOOR NOT CLOSED", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "Border Customs Hold", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "CBP ISSUE", ring: "border-orange-500", badge: "text-orange-600 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "CBP INSPECTION", ring: "border-orange-600", badge: "text-orange-800 bg-orange-100 border-orange-300", hex: "#EA580C", filled: "bg-orange-600", text: "text-orange-600" },
  { type: "CBP CONDITIONAL RELEASE", ring: "border-amber-500", badge: "text-amber-700 bg-amber-50 border-amber-200", hex: "#F59E0B", filled: "bg-amber-500", text: "text-amber-500" },
  { type: "CBP SYSTEM DOWN", ring: "border-red-500", badge: "text-red-600 bg-red-50 border-red-200", hex: "#EF4444", filled: "bg-red-500", text: "text-red-500" },
  { type: "CTPAT 800 INSPECTION", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "X RAYS INSPECTION", ring: "border-orange-600", badge: "text-orange-800 bg-orange-100 border-orange-300", hex: "#EA580C", filled: "bg-orange-600", text: "text-orange-600" },
  { type: "ENTRY NOT ON FILE", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "INCORRECT DODA", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "INCORRECT ENTRY/BOND", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "INCORRECT MANIFEST", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "SCAC ISSUE", ring: "border-orange-500", badge: "text-orange-600 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "Seal Mismatch", ring: "border-red-300", badge: "text-red-500 bg-red-50 border-red-200", hex: "#FCA5A5", filled: "bg-red-300", text: "text-red-300" },
  { type: "BROKEN SEAL", ring: "border-red-600", badge: "text-red-700 bg-red-100 border-red-300", hex: "#DC2626", filled: "bg-red-600", text: "text-red-600" },
  { type: "COMMODITY DISCREPANCY", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "FDA Inspection", ring: "border-lime-600", badge: "text-lime-800 bg-lime-50 border-lime-300", hex: "#65A30D", filled: "bg-lime-600", text: "text-lime-600" },
  { type: "MET/FDA PROCESS", ring: "border-lime-500", badge: "text-lime-700 bg-lime-50 border-lime-200", hex: "#84CC16", filled: "bg-lime-500", text: "text-lime-500" },
  { type: "WaitingForPO", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "ReturnLoadMissing", ring: "border-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200", hex: "#F97316", filled: "bg-orange-500", text: "text-orange-500" },
  { type: "YELLOW LIGHT", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "CONTINGENCY", ring: "border-amber-600", badge: "text-amber-800 bg-amber-50 border-amber-300", hex: "#D97706", filled: "bg-amber-600", text: "text-amber-600" },
  { type: "Under Claim", ring: "border-purple-500", badge: "text-purple-700 bg-purple-50 border-purple-200", hex: "#A855F7", filled: "bg-purple-500", text: "text-purple-500" },
  { type: "Yard Not Allowed", ring: "border-stone-500", badge: "text-stone-700 bg-stone-50 border-stone-200", hex: "#78716C", filled: "bg-stone-500", text: "text-stone-500" },
  { type: "Spot", ring: "border-violet-500", badge: "text-violet-700 bg-violet-50 border-violet-200", hex: "#8B5CF6", filled: "bg-violet-500", text: "text-violet-500" },
  { type: "Asset", ring: "border-sky-500", badge: "text-sky-700 bg-sky-50 border-sky-200", hex: "#0EA5E9", filled: "bg-sky-500", text: "text-sky-500" },
  { type: "Brokerage", ring: "border-indigo-500", badge: "text-indigo-700 bg-indigo-50 border-indigo-200", hex: "#6366F1", filled: "bg-indigo-500", text: "text-indigo-500" },
  { type: "Probill", ring: "border-blue-500", badge: "text-blue-700 bg-blue-50 border-blue-200", hex: "#3B82F6", filled: "bg-blue-500", text: "text-blue-500" },
  { type: "CDL", ring: "border-blue-600", badge: "text-blue-800 bg-blue-50 border-blue-300", hex: "#2563EB", filled: "bg-blue-600", text: "text-blue-600" },
  { type: "B1", ring: "border-blue-400", badge: "text-blue-600 bg-blue-50 border-blue-200", hex: "#60A5FA", filled: "bg-blue-400", text: "text-blue-400" },
  { type: "Documents Pending", ring: "border-yellow-500", badge: "text-yellow-700 bg-yellow-50 border-yellow-200", hex: "#EAB308", filled: "bg-yellow-500", text: "text-yellow-500" },
  { type: "Document Issues", ring: "border-fuchsia-500", badge: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200", hex: "#D946EF", filled: "bg-fuchsia-500", text: "text-fuchsia-500" },
  { type: "DOCS. READY", ring: "border-emerald-500", badge: "text-emerald-700 bg-emerald-50 border-emerald-200", hex: "#10B981", filled: "bg-emerald-500", text: "text-emerald-500" },
  { type: "DISPATCHED", ring: "border-teal-500", badge: "text-teal-700 bg-teal-50 border-teal-200", hex: "#14B8A6", filled: "bg-teal-500", text: "text-teal-500" },
  { type: "REPAIRED", ring: "border-emerald-500", badge: "text-emerald-700 bg-emerald-50 border-emerald-200", hex: "#10B981", filled: "bg-emerald-500", text: "text-emerald-500" },
];

export function getColorByType(arr: StatusColor[], type: string): StatusColor | undefined {
  return arr.find(c => c.type === type);
}
