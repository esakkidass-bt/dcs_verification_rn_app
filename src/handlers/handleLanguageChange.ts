import {asyncStorage} from '../helpers/asyncStorage';
import {LanguageCodeTypes} from '../hooks/useDict/type';

const handleLanguageChange = async (languageCode: LanguageCodeTypes) => {
  await asyncStorage.storeString('languageCode', languageCode);
};

export default handleLanguageChange;
