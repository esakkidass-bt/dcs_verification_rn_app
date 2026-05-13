import * as turf from '@turf/turf';

export async function combineSubDivisionNumbers(subDivisionPolygonList: any[]) {
  return turf.dissolve(turf.featureCollection(subDivisionPolygonList));
}
