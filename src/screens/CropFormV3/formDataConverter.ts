import {ICropFormProps, ICropFormV2Props, ICropSurvey} from '../../@types';
import {ICropDataForm, ICropFormV3CameraProps, ISubDivision} from './type';

export default async function formV3ToV1Converter(data: {
  cropData: ICropDataForm;
  surveys: ISubDivision[];
  imageData: ICropFormV3CameraProps;
}): Promise<ICropFormProps> {
  let baseCropFormData: ICropFormProps = {
    season: data.cropData.season,
    method: data.cropData.method,
    masterSeasonId: data.cropData.masterSeasonId,
    surveys: [],
    gpsAccuracy: '0',
    formType: 'surveyNumberForm',
  };
  for (const [iIndex, subDivision] of Object.values(
    data['surveys'],
  ).entries()) {
    const addSurvey = (data: ICropSurvey) => {
      baseCropFormData.surveys.push(data);
    };
    if (
      subDivision.remainingLandExtent &&
      parseFloat(subDivision.remainingLandExtent) > 0
    ) {
      addSurvey({
        ...data.imageData,
        id: `${new Date().getTime().toString()}${
          data.cropData.surveynumber
        }${iIndex}`,
        cropCount: '0',
        cropNameId: data.cropData.cropNameId,
        cropTypeId: data.cropData.cropTypeId,

        districtCode: data.cropData.districtCode,
        villageCode: data.cropData.villageCode,
        surveyNumber: data.cropData.surveynumber,
        talukCode: data.cropData.talukCode,
        expectedHarvestDate: data.cropData.expectedHarvestDate,

        // // disabled for oct28 changes
        irrigationSourceId: data.cropData.irrigationSourceId||null,

        sownDate: data.cropData.sownDate,
        isBorderOrRowCrop: '',
        cropClassificationId: data.cropData.cropClassificationId,
        cropSeasonType: data.cropData.cropSeasonType,
        cropLandExtent: subDivision.remainingLandExtent,
        cultivatorId: subDivision.cultivatorId,
        cultivatorTypeId: subDivision.cultivatorTypeId,
        subDivisionNumber: subDivision.subDivisionNumber,
        cultivatorName: subDivision.cultivatorName,

        // // disabled for oct28 changes
        // theervai: subDivision.theervai||'0',
      } as ICropSurvey);
    }

    // // common form for sub division
    for (const [jIndex, j] of subDivision['surveys'].entries()) {
      // const id = UUID.v4().toString()
      // const id = new Date().getTime().toString()
      if (j.extent && parseFloat(j.extent) > 0) {
        addSurvey({
          ...data.imageData,
          id: `${new Date().getTime().toString()}${
            data.cropData.surveynumber
          }${iIndex}${jIndex}`,

          cropCount: '0',
          cropAge: data.cropData.cropAge || '',

          // // disabled for oct28 changes
          // orupogaIrupogaNanjai: data.cropData.orupogaIrupogaNanjai||'0',

          cropNameId: data.cropData.cropNameId,
          cropTypeId: data.cropData.cropTypeId,

          districtCode: data.cropData.districtCode,
          villageCode: data.cropData.villageCode,
          surveyNumber: data.cropData.surveynumber,
          talukCode: data.cropData.talukCode,
          expectedHarvestDate: data.cropData.expectedHarvestDate,

          // // disabled for oct28 changes
          irrigationSourceId: data.cropData.irrigationSourceId,

          sownDate: data.cropData.sownDate,
          isBorderOrRowCrop: '',
          cropClassificationId: j.cropClassificationId,
          cropSeasonType: j.cropSeasonType,
          cropLandExtent: j.extent,

          // // disabled for oct28 changes
          // theervai: subDivision.theervai||'0',
          //
          cultivatorId: subDivision.cultivatorId,
          cultivatorTypeId: subDivision.cultivatorTypeId,
          subDivisionNumber: subDivision.subDivisionNumber,
          cultivatorName: subDivision.cultivatorName,
        } as ICropSurvey);
      }
    }
  }

  return baseCropFormData;
}
