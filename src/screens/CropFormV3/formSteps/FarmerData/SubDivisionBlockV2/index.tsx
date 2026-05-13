import React from "react";
import { Box, Row, Text } from "native-base";

import { ICropDataForm } from "../../../type";
import useDict from "../../../../../hooks/useDict";

interface Props {
  subDivisionNumber: string;
  cropData: ICropDataForm;
}
export function SubDivisionBlockV2(props: Props) {
  const ln = useDict();

  function KeyValueLabel({ label, value }: { label: string; value: string | number }) {
    return (
      <Row space={"2"} alignItems={"center"}>
        <Text bold>{label}</Text>
        <Text>{value}</Text>
      </Row>
    );
  }

  return (
    <Box m={"2"} bg={"white"} py={"4"} px={"4"} borderRadius={"xl"}>
      <Text bold fontSize={"md"} color={"primary.900"}>
        {ln("Sub Division")}: {props.subDivisionNumber}
      </Text>
      <KeyValueLabel label={ln("Cropping Season Type")} value={props.cropData.labelCropSesonType} />
      <KeyValueLabel label={ln("Crop Type")} value={props.cropData.labelCropType} />
      <KeyValueLabel
        label={ln("Crop Classification")}
        value={props.cropData.labelCropClassification}
      />
      <KeyValueLabel label={ln("Crop Name")} value={props.cropData.labelCropName} />
      <KeyValueLabel label={ln("Tentative Tentative Sown Month")} value={props.cropData.sownDate} />
      <KeyValueLabel
        label={ln("Tentative Harvest Month")}
        value={props.cropData.expectedHarvestDate}
      />

      {/* // // disabled for oct28 changes */}
      {/* <KeyValueLabel label={ln("Crop Stage")}  value={props.cropData.labelCropStage}/> */}
      {/* // // disabled for oct28 changes */}
      {/* <KeyValueLabel label={ln("Irrigation Source")}  value={props.cropData.labelIrrigationSource}/> */}

      {/*<KeyValueLabel label={ln("Area")}  value={props.}/>*/}
      {/*<KeyValueLabel label={ln("Cultivable Area")}  value={props.cropData.labelIrrigationSource}/>*/}
    </Box>
  );
}
