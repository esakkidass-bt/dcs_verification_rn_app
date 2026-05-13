import {useStateContext} from '..';
import dict from '../../dict';
import {LanguageCodeTypes} from './type';

type WordTypes = keyof typeof dict.en | keyof typeof dict.ta;
const useDict = (languageCode?: LanguageCodeTypes) => {
  const globalState = useStateContext();
  const findWord = (word: WordTypes) => {
    const code: LanguageCodeTypes =
      languageCode || globalState?.languageCode || 'en';
    return dict?.[code]?.[word] || dict?.en?.[word] || word;
  };
  return findWord;
};

export default useDict;
