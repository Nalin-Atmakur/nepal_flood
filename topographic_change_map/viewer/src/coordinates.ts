export interface GridReference {
  width: number;
  height: number;
  originX: number;
  originY: number;
  resolutionM: number;
}

export interface GridCell {
  col: number;
  row: number;
}

export function cellCenterToUtm(
  grid: GridReference,
  col: number,
  row: number,
): [number, number] {
  return [
    grid.originX + (col + 0.5) * grid.resolutionM,
    grid.originY - (row + 0.5) * grid.resolutionM,
  ];
}

export function utmToGridCell(
  grid: GridReference,
  east: number,
  north: number,
): GridCell | null {
  const col = Math.floor((east - grid.originX) / grid.resolutionM);
  const row = Math.floor((grid.originY - north) / grid.resolutionM);
  if (col < 0 || row < 0 || col >= grid.width || row >= grid.height) return null;
  return { col, row };
}

export function utmToScene(
  grid: GridReference,
  east: number,
  north: number,
): [number, number] {
  return [
    east - (grid.originX + (grid.width * grid.resolutionM) / 2),
    north - (grid.originY - (grid.height * grid.resolutionM) / 2),
  ];
}

export function sceneToUtm(
  grid: GridReference,
  x: number,
  y: number,
): [number, number] {
  return [
    x + grid.originX + (grid.width * grid.resolutionM) / 2,
    y + grid.originY - (grid.height * grid.resolutionM) / 2,
  ];
}
