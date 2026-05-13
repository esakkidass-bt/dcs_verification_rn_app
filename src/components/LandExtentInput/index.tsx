import {Input} from 'native-base';
import {Row} from 'native-base';
import React, {useEffect, useState} from 'react';
import {parseLandExtent} from '../../helpers/landExtent';
import useDict from '../../hooks/useDict';

interface Props {
  value: string;
  onChangeText: (e: string) => void;
  previewMode: boolean;
}

export default function Index(props: Props) {
  const ln = useDict();
  const [formValues, setFormValues] = useState(parseLandExtent(props.value));

  const handleFormChange =
    (key: 'hectaresAres' | 'ares' | 'subAres') => (e: string) => {
      setFormValues((prevVal: any) => {
        return {...prevVal, [key]: e};
      });
    };

  useEffect(() => {
    props.onChangeText(
      parseLandExtent(
        `${formValues.hectaresAres}.${
          formValues.ares?.length > 1 ? formValues.ares : `0${formValues.ares}`
        }${formValues?.subAres}`,
      ).value,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  return (
    <Row flex="1" space="2">
      <Input
        flex={'1'}
        placeholder={ln('Enter Hectares')}
        py="1"
        px="2"
        mt="1"
        keyboardType="numeric"
        name="cropLandExtent"
        isDisabled={props.previewMode}
        value={formValues.hectaresAres.toString()}
        onChangeText={handleFormChange('hectaresAres')}
      />
      <Input
        flex={'1'}
        placeholder={ln('Enter Ares')}
        py="1"
        px="2"
        mt="1"
        keyboardType="numeric"
        maxLength={2}
        name="cropLandExtent"
        isDisabled={props.previewMode}
        value={formValues.ares.toString()}
        onChangeText={handleFormChange('ares')}
      />
      <Input
        flex={'1'}
        placeholder={ln('Enter Ares')}
        py="1"
        px="2"
        mt="1"
        keyboardType="numeric"
        maxLength={2}
        name="cropLandExtent"
        isDisabled={props.previewMode}
        value={formValues?.subAres?.toString()}
        onChangeText={handleFormChange('subAres')}
      />
    </Row>
  );
}
