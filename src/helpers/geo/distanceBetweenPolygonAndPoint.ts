import * as turf from '@turf/turf';
import {ICordinates} from '../../@types/geoJson';

const distanceBetweenPolygonAndPoint = async (
  coordinate: ICordinates,
  polygonFeature: any,
) => {
  let distance = 0;
  if (polygonFeature?.geometry?.type === 'Polygon') {
    const polygonEdges = turf.multiLineString(
      polygonFeature.geometry.coordinates,
    );
    //  console.debug('polygonFeature > ', await turf.multiLineString(polygonFeature.geometry.coordinates))
    const nearestPoint = turf.nearestPointOnLine(
      polygonEdges,
      turf.point([coordinate.longitude, coordinate.latitude]),
    );
    distance = nearestPoint.properties.dist || 0;
  } else if (polygonFeature?.geometry?.type === 'MultiPolygon') {
    const polygonEdges = turf.multiLineString(
      polygonFeature.geometry.coordinates[0],
    );
    const nearestPoint = turf.nearestPointOnLine(
      polygonEdges,
      turf.point([coordinate.longitude, coordinate.latitude]),
    );
    distance = nearestPoint.properties.dist || 0;
  }
  return distance;
};

export default distanceBetweenPolygonAndPoint;
