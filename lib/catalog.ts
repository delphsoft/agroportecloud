/** Tablas WSCPE. Códigos de grano = ConsultarTiposGrano. Provincia = ConsultarProvincias. */

export const GRANOS = [
  { cod: 23, label: "Soja" },
  { cod: 19, label: "Maíz" },
  { cod: 15, label: "Trigo Pan" },
  { cod: 14, label: "Trigo Candeal" },
  { cod: 2, label: "Girasol" },
  { cod: 17, label: "Cebada Cervecera" },
  { cod: 22, label: "Sorgo Granífero" },
  { cod: 101, label: "Maní" },
  { cod: 47, label: "Arveja" },
  { cod: 46, label: "Lenteja" },
  { cod: 102, label: "Poroto" },
] as const;

export const PROVINCIAS = [
  { cod: 0, label: "CABA" },
  { cod: 1, label: "Buenos Aires" },
  { cod: 3, label: "Córdoba" },
  { cod: 12, label: "Santa Fe" },
  { cod: 5, label: "Entre Ríos" },
  { cod: 21, label: "La Pampa" },
  { cod: 7, label: "Mendoza" },
  { cod: 14, label: "Tucumán" },
  { cod: 9, label: "Salta" },
  { cod: 16, label: "Chaco" },
] as const;

/** Subconjunto operativo (Córdoba / Santa Fe). El día ARCA se reemplaza por ConsultarLocalidadesPorProvincia. */
export const LOCALIDADES = [
  { cod: 140140, prov: 3, label: "Córdoba" },
  { cod: 140588, prov: 3, label: "Río Cuarto" },
  { cod: 140182, prov: 3, label: "Villa María" },
  { cod: 140077, prov: 3, label: "General Deheza" },
  { cod: 140091, prov: 3, label: "Marcos Juárez" },
  { cod: 140168, prov: 3, label: "Tancacha" },
  { cod: 140021, prov: 3, label: "Bell Ville" },
  { cod: 140105, prov: 3, label: "Oncativo" },
  { cod: 140049, prov: 3, label: "Laboulaye" },
  { cod: 140210, prov: 3, label: "San Francisco" },
  { cod: 82084, prov: 12, label: "Rosario" },
  { cod: 82063, prov: 12, label: "Venado Tuerto" },
  { cod: 82126, prov: 12, label: "Rufino" },
] as const;

export const COSECHAS = [
  { cod: 2026, label: "2025/2026" },
  { cod: 2025, label: "2024/2025" },
  { cod: 2024, label: "2023/2024" },
];

export const TIPO_CPE = { automotor: 74, ferroviaria: 75, fleteCorto: 274 } as const;

export function granoLabel(cod: number) {
  return GRANOS.find((g) => g.cod === cod)?.label || String(cod);
}
export function locLabel(cod: number) {
  return LOCALIDADES.find((l) => l.cod === cod)?.label || String(cod);
}
export function provLabel(cod: number) {
  return PROVINCIAS.find((p) => p.cod === cod)?.label || String(cod);
}
export function locsOf(prov: number) {
  return LOCALIDADES.filter((l) => l.prov === prov);
}
