import { useState } from "react";

const useToggle = (initialState: boolean) => {
  const [state, setState] = useState(initialState);
  const toggle = (_p0: boolean) => setState(!state);
  return [state, toggle] as const;
};

export default useToggle;
