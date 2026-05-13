import AsyncStorage from '@react-native-async-storage/async-storage';
import { ILocalStorageProps } from '../../@types';


const storeString = async (key: keyof ILocalStorageProps, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

const storeObj = async (key: keyof ILocalStorageProps, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

const getString = async (key: keyof ILocalStorageProps, fallbackValue: string | null = null) :Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value || fallbackValue;
  } catch (e) {
    // error reading value
  }
};

const getObj = async (key: keyof ILocalStorageProps, fallbackValue: any = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : fallbackValue;
  } catch (e) {
    // error reading value
  }
};

export const asyncStorage = {
  storeString,
  storeObj,
  getString,
  getObj,
};
