import { Fragment, useEffect } from "react";
import {useTypedSelector} from "../hooks/use-typed-selector"
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell";
import "./cell-list.css";
import { useActions } from "../hooks/use-actions";

const CellList: React.FC = () => {

  const cells = useTypedSelector( ({cells: {order, data}}) => order.map((id: string) => data[id]));

  const { fetchCells, saveCells } = useActions();

  useEffect(() => {
    fetchCells();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveCells();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(cells)]);

  const renderedCells = cells.map(cell => 
    <Fragment key = {cell.id}>
      <CellListItem cell = {cell}/>
      <AddCell previousCellId = {cell.id}/>
    </Fragment>)

  return (
    <div className = "cell-list">
      <AddCell forceVisible = {cells.length === 0} previousCellId = {null}/>
      {renderedCells}
    </div>
  );
}

export default CellList;