import { Dispatch } from "redux";
import { Action } from "../actions";
import { ActionType } from "../action-types";
import { saveCells } from "../action-creators";
import { RootState } from "../reducers";

// the argument is an object similar to my redux store
export const persistMiddleware = ({ dispatch, getState }: { dispatch: Dispatch<Action>, getState: () => RootState}) => {
  // next is how we take an action and forward it along to different reducers
  return (next: (action: Action) => void) => {
    // the kind of action we are looking at
    return (action: Action) => {
      next(action);

      if ([ActionType.MOVE_CELL, ActionType.UPDATE_CELL, ActionType.INSERT_CELL_AFTER, ActionType.DELETE_CELL].includes(action.type)){
        saveCells()(dispatch, getState);
      }
    }
  }
}