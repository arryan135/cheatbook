import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../state";

export const useActions = () => {
  const dispatch = useDispatch();

  // this ensure that action creators are bound one single time
  // useMemo is almost like useEffect and useState
  // when something changes inside the diapatch array the first callback function is run
  // the return value from the callback function is useMemo's return value
  // All this makes `createbundle` in code-cell.tsx a stable function.
  return useMemo(() => {
    return bindActionCreators(actionCreators, dispatch);
  }, [dispatch]);
}