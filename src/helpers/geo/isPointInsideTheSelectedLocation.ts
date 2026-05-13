import {StateContextProps} from '../../context/StateContext/type';
import {ICordinates} from '../../@types/geoJson';
import {geo} from '../index';

export async function isPointInsideTheSelectedLocation(
  state: StateContextProps,
  location: ICordinates,
) {
  let polygon: any;
  let errorMsg: string | null = null;
  let warningMsg: string | null = null;

  // console.log(
  //   'state.selectedFeatures?.village main',
  //   state.selectedFeatures?.village[0],
  // );
  // Check if there are any land features selected
  if (state.selectedFeatures.land?.length > 0 || state.selectedFeatures.village?.length > 0) {
    // Try to find the polygon for the selected sub-division number
    const subDivisionPolygon =
      state.selectedFeatures.land?.find(
        e =>
          e.properties.sub_division_number ==
          state.selectedLocationData?.subDivisionNumber,
      ) || null;

    // If a sub-division polygon is found, assign it to the polygon variable
    if (subDivisionPolygon) {
      console.log('subDivisionPolygon', subDivisionPolygon);
      polygon = subDivisionPolygon;
    } else {
      // if (state.selectedLocationData?.subDivisionNumber) {
      //   warningMsg =
      //     'sub division polygon not found but you can survey within the survey number boundary';
      // }
      // If no sub-division polygon is found, try to find the survey number polygon
      const surveyNumberPolygon =
        state.selectedFeatures.land?.find(
          e => e.properties.sub_division_number === null,
        ) || null;

      // If a survey number polygon is found, assign it to the polygon variable
      if (surveyNumberPolygon) {
        polygon = surveyNumberPolygon;
        console.log('surveyNumberPolygon', surveyNumberPolygon);
      } else {
        // if (state.selectedLocationData?.subDivisionNumber) {
        //   warningMsg =
        //     'Survey Number polygon not found but you can survey within the village boundary';
        // }
        // If no specific land polygon is found, fall back to the village boundary

        polygon = state.selectedFeatures?.village[0];
        console.log('state.selectedFeatures?.village', polygon);
      }
    }
  }
  if (!polygon) {
    // errorMsg = 'Village boundary not found. Please contact TNeGA';
    return {isInside: false, polygon: null, errorMsg};
  }
  const isInside = await geo.isPointInPolygon(location, polygon);

  return {isInside, polygon, warningMsg};
}
