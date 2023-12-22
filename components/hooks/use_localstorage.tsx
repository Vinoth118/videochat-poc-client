import { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react';

const useLocalStorage = <T,>(key: string): [null | T, Dispatch<SetStateAction<T | null>>] => {
    const [value, setValue] = useState<null | T>(() => {
      try {
        const value = window.localStorage.getItem(key);
  
        if (value) {
          return JSON.parse(value);
        } else {
          window.localStorage.setItem(key, JSON.stringify(null));
          return null;
        }
      } catch (err) {
        return null;
      }
    })

    const set = (newValue: any) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (err) {}
      setValue(newValue);
    };
  
    return [value, set]
  }

export default useLocalStorage;