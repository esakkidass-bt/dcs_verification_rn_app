// function to convert json to FormData
const jsonToFormData = async (json: any) => {
  const formData = new FormData();
  Object.keys(json).forEach(key => {
    formData.append(key, json[key]);
  });
  return formData;
};

export default jsonToFormData;
