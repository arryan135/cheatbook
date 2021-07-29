import {useTypedSelector} from "../hooks/use-typed-selector"
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell"

const CellList: React.FC = () => {

  const cells = useTypedSelector( ({cells: {order, data}}) => order.map((id: string) => data[id]));

  const renderedCells = cells.map(cell => 
    <>
      <AddCell nextCellId = {cell.id}/>
      <CellListItem key = {cell.id} cell = {cell}/>
    </>)

  return (
    <div>
      {renderedCells}
      <AddCell nextCellId = {null}/>
    </div>
  );
}

export default CellList;