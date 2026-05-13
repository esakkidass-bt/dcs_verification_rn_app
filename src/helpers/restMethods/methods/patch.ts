import config from '../../../config';

interface patchProps {
  path: string;
  data: Object;
  token?: string;
}
const PATCH = async ({path, data, token}: patchProps) => {
  const res = await fetch(`${config?.api_url}${path}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/html',
    },
  })
    .then(async res => {
      const json = await res.json();
      return [res?.status, json];
    })
    .then(res => {
      return res;
    })
    .catch(error => {
      console.log(`error in patch ${path} >`, error);
      return [500, error];
    });
  return res;
};

export default PATCH;
