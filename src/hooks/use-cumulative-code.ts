import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
  return useTypedSelector(state => {
    const { data, order } = state.cells;
    const orderedCells = order.map((id: string) => data[id]);
  
    const showFunc = 
    `
      import __React__ from "react";
      import __ReactDOM__ from "react-dom";
      var show = (value) => {
        const root = document.querySelector("#root");
        if (typeof value === 'object'){
          if (value.$$typeof && value.props){
            __ReactDOM__.render(value, root);
          } else{
            root.innerHTML = JSON.stringify(value);
          }
        } else {
          root.innerHTML = value;
        }
      };
    `;
    const showFuncNoop = `var show = () => {}`
    const cumulativeCode = [];
    for (let c of orderedCells){
      if (c.type === "code"){
        if (c.id === cellId){
          cumulativeCode.push(showFunc);
        } else {
          cumulativeCode.push(showFuncNoop);
        }
        cumulativeCode.push(c.content);
      }
      if (c.id === cellId){
        break;
      }
    }
  
    return cumulativeCode;
  }).join("\n");
}
