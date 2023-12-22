import { DependencyList, EffectCallback, useEffect, useRef } from "react";

const useDidMountEffect = (func: EffectCallback, deps?: DependencyList | undefined) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
}

export default useDidMountEffect;