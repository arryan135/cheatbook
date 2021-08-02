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
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;

      return state;
    case ActionType.FETCH_CELLS_COMPLETE:
      state.order = action.payload.map(cell => cell.id);
      state.data = action.payload.reduce((acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      }, {} as CellsState["data"]);

      return state;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;

      return state;
    case ActionType.MOVE_CELL: 
      const { direction } = action.payload;
      const index = state.order.findIndex(id => id === action.payload.id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      
      // if invalid cell move is requested
      if (targetIndex < 0 || targetIndex > state.order.length - 1){
        return state;
      }

      // swap the cells in the order array
      state.order[index] = state.order[targetIndex];
      // place the updated cell after changing order
      state.order[targetIndex] = action.payload.id; 

      return state;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return state;
    case ActionType.INSERT_CELL_AFTER:
      const cell: Cell = {
        content: "",
        type: action.payload.type,
        id: randomId()
      }

      // add cell to data object
      state.data[cell.id] = cell;

      // find the index before which we have to insert the new cell. 
      const foundIndex = state.order.findIndex(id => id === action.payload.id);

      // if no id was provided foundIndex is -1.
      // add new cell to the start of the order array
      if (foundIndex < 0){
        state.order.unshift(cell.id);
      } else{
        state.order.splice(foundIndex + 1, 0, cell.id);
      } // if valid cell id was provided

      return state;
    case ActionType.DELETE_CELL:
      delete state.data[action.payload];
      state.order = state.order.filter(id => id !== action.payload);
      return state;
    default:  
      return state;
  }
}, initialState);

const randomId = () => {
  // base 36 - all numbers from 0-9 and all letters from a-z
  return Math.random().toString(36).substr(2, 5);
}

export default reducer;