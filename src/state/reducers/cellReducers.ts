import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";
import produce from "immer";

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell
  }
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {}
}

const reducer = produce((state: CellsState = initialState, action: Action): CellsState | void => {
  switch(action.type){
    case ActionType.MOVE_CELL: 
      const { direction } = action.payload;
      const index = state.order.findIndex(id => id === action.payload.id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      
      // if invalid cell move is requested
      if (targetIndex < 0 || targetIndex > state.order.length - 1){
        return;
      }

      // swap the cells in the order array
      state.order[index] = state.order[targetIndex];
      // place the updated cell after changing order
      state.order[targetIndex] = action.payload.id; 
      
      return;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return;
    case ActionType.INSERT_CELL_BEFORE:
      return state;
    case ActionType.DELETE_CELL:
      delete state.data[action.payload];
      state.order = state.order.filter(id => id !== action.payload);
      return;
    default:  
      return state;
  }
});

export default reducer;