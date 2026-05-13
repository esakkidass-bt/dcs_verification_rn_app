//?  function for converting camel case to snake case
export const toSnakeCase = (str: string) => {
  return str.replace(/([A-Z])/g, g => `_${g[0].toLowerCase()}`);
};

//? function for converting snake case to camel case
export const toCamelCase = (str: string) => {
  return str.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};
