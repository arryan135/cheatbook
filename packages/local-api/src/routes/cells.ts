import express from "express";

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();

  router.get("/cells", async (req, res) => {
    // make sure that the cell storage file exists
    // if it does not exist add in a defualt list of cells

    // Read the file
    // Parse a list of cells out of it
    // Send list of cells back to browser
  });

  router.post("/cells", async (req, res) => {
    // make sure the file exists
    // If not, create it

    // Take the list of cells from the request obj 
    // serialize them
    // Write the cells into the file
  });

  return router;
}