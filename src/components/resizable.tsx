import { ResizableBox, ResizableBoxProps } from "react-resizable";
import { useEffect, useState } from "react";
import "./resizable.css";

interface ResizableProps {
  direction: "horizontal" | "vertical";
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  let resizableProps: ResizableBoxProps;
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const listener = () => {
      setInnerHeight(window.innerHeight);
      setInnerWidth(window.innerWidth);
    }
    // event triggered whenever we resize the browser window
    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    }
  }, []);

  if (direction === "horizontal"){
    resizableProps = {
      className: "resize-horizontal",
      height: Infinity,
      width: innerWidth * 0.75,
      resizeHandles: ['e'],
      minConstraints: [innerWidth * 0.2, Infinity],
      maxConstraints: [innerWidth * 0.75, Infinity]
    };
  } else{
    resizableProps = {
      height: 300,
      width: Infinity,
      resizeHandles: ['s'],
      minConstraints: [Infinity, 24],
      maxConstraints: [Infinity, innerHeight * 0.9]
    };
  }

  return (
    <ResizableBox {...resizableProps}>
      {children}
    </ResizableBox>);
};

export default Resizable;