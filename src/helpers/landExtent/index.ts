interface LandExtentProps {
  value: string;
  to: 'hectaresAres' | 'ares';
}

// const hectaresAres = (value: string) => {
//   // convert hectares ares to ares
//   return parseFloat(value) * 10000;
// };

const landExtent = (props: LandExtentProps) => {
  const parsedValue = parseFloat(parseFloat(props.value).toFixed(4));
  if (props.to === 'hectaresAres') {
    return (parsedValue * 10000).toFixed(4);
  }
  return (parsedValue / 10000).toFixed(4);
};

const parseLandExtent = (value: string) => {
  // return an object with hectare and ares
  const _temp = parseFloat(value).toFixed(4);
  const s = _temp.split('.');
  const [ares, subAres] = (parseFloat(s[1]) / 100).toString().split('.');
  const parsedAresVal = ares ? (ares?.length > 1 ? ares : `0${ares}`) : '00';
  const parsedSubAresVal = subAres
    ? subAres?.length > 1
      ? subAres
      : `${subAres}0`
    : '00';
  if (s.length > 1) {
    return {
      hectaresAres: parseFloat(s[0]) || 0,
      ares: parsedAresVal,
      subAres: parsedSubAresVal,
      value: `${parseFloat(s[0]) || 0}.${parsedAresVal}${parsedSubAresVal}`,
      landExtendValueString: `${parseFloat(
        s[0],
      )} ha. ${parsedAresVal}.${parsedSubAresVal} ares`,
    };
  } else {
    return {
      hectaresAres: parseFloat(s[0]) || 0,
      value: `${parseFloat(s[0]) || 0}.${parsedAresVal}${parsedSubAresVal}`,
      ares: parsedSubAresVal,
      subAres: parsedSubAresVal,
      landExtendValueString: `${parseFloat(s[0])} ha. ${0} ares`,
    };
  }
};

export default landExtent;
export {parseLandExtent};
