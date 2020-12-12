import React, { useState, useEffect } from 'react';
import './App.css';
import { useWindowSize } from './useWindowSize'

const R = require('ramda');

function App() {

  const createRow = cols => (R.range(0, cols)).map(cell => Math.random() < ALIVE_PROBABILITY);
  const ALIVE_PROBABILITY = 0.30;
  const INTERVAL = 1000;
  const DIE_WITH_LESS = 2;
  const DIE_WITH_MORE = 3;
  const BORN = 3;

  const size = useWindowSize();
  const [grid, setGrid] = useState([[]]);
  const [rows] = useState(parseInt((window.innerHeight - 300) / 10, 10));
  const [cols] = useState(parseInt(window.innerWidth / 10, 10));
  const [tickCount, setTickCount] = useState(0);

  const adjustCoordinates = coord => {
    if (coord.row >= rows) coord.row = 0;
    if (coord.row < 0) coord.row = rows-1;
    if (coord.col >= cols) coord.col = 0;
    if (coord.col < 0) coord.col = cols-1;
    return coord;
  }

  const getNeighbors = coord => {
    let count = 0;
    for (let rowDelta = -1; rowDelta <= 1; rowDelta++) {
      for (let colDelta = -1; colDelta <= 1; colDelta++) {
        if (rowDelta !== 0 && colDelta !== 0) {
          let _coord = adjustCoordinates({row: coord.row+rowDelta, col: coord.col+colDelta})
          if (grid[_coord.row][_coord.col]) count++;
        }
      }
    }
    return count;
  }

  useEffect(() => {
    const createGrid = (rows, cols) => (R.range(0, rows)).map(row => createRow(cols));
    let grid = createGrid(rows, cols);
    setGrid(grid);
  }, [size, rows, cols]);

  useEffect(() => {
    const update = () => {
      let _grid = R.clone(grid);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let neighbors = getNeighbors({row, col});
          if (_grid[row][col]) {
            if (neighbors < DIE_WITH_LESS || neighbors > DIE_WITH_MORE) {
              _grid[row][col] = false;
            }
          } else {
            if (neighbors === BORN) {
              _grid[row][col] = true;
            }
          }
        }
      }
      setGrid(_grid);
    };
    if (grid && grid.length === rows && grid[0].length === cols) {
      update();
    }
  }, [tickCount, rows, cols])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickCount(tickCount + 1);
    }, INTERVAL);
    return () => {
      clearTimeout(timer);
    };
  }, [tickCount]);

  return (
    <div className="game">
      <header className="game-header">
        <h2>Conway's Game of Life</h2>
      </header>
      <table>
        <tbody>
        {
          grid.map((row, rowIdx) => {
            return (
              <tr key={'r'+rowIdx}>
                {
                  row.map((cell, colIdx) => {
                    return <td key={'r'+rowIdx+'c'+colIdx} className={cell ? 'live' : 'dead'}></td>
                  })
                }
              </tr>
            )
          })
        }
        </tbody>
      </table>
    </div>
  );
}

export default App;
