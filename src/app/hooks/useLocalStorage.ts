import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { devFlags } from "../utils";

const getStorageValue = <S>(key: string, defaultValue: S): S => {
  // getting stored value
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

export const useLocalStorage = <S>(key: string, defaultValue: S): [S, Dispatch<SetStateAction<S>>] => {

  const [value, setValue] = useState<S>(
    devFlags.disableLocalStorage ?
    defaultValue :
    () => getStorageValue(key, defaultValue)
  );

  useEffect(() => {
    if (!devFlags.disableLocalStorage) {
      // storing input name
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};