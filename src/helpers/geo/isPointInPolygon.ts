import * as turf from '@turf/turf';
import {ICordinates} from '../../@types/geoJson';

const isInsideGeoJsonPolygon = async (
  coordinate: ICordinates,
  polygon: any,
) => {
  let insidePoints: any = [];
  try {
    insidePoints = await turf.pointsWithinPolygon(
      turf.points([[coordinate.longitude, coordinate.latitude]]),
      polygon,
    );
    console.debug(
      'isInsideGeoJsonPolygon > ',
      insidePoints,
      insidePoints?.features[0]?.geometry?.coordinates?.length > 0,
    );
  } catch (err) {
    console.error(err);
  }
  return insidePoints?.features[0]?.geometry?.coordinates?.length > 0;
};

export default isInsideGeoJsonPolygon;
