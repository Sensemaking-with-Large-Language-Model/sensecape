import { useState, useEffect, Dispatch, SetStateAction } from "react";

const getStorageValue = <S>(key: string, defaultValue: S): S => {
  // getting stored value
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

export const useLocalStorage = <S>(key: string, defaultValue: S): [S, Dispatch<SetStateAction<S>>] => {

  const [value, setValue] = useState<S>(() => {
    return getStorageValue(key, defaultValue);
  });

  if (key === 'instanceMap') {
    console.log('value of instance', value);
  }

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};