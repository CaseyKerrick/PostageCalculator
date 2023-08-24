import React, { useState, useEffect } from 'react';
import { InputAdornment, TextField, List, ListItem, Button } from '@mui/material';
import './App.css';

function App() {
  const DEFAULT_STAMP_DENOMINATIONS = [4, 5, 10, 18, 20, 22, 24, 29, 33, 34, 50, 51, 66, 87, 100, 111];
  const DEFAULT_POSTAGE_COST = 51;
  const DEFAULT_STAMP_MAX = 4;

  const sortInts = (a: number, b: number) => a - b;

  const generateSolutions = () => {
    const integerDenominations = stampDenominations.split(',').map((item: string) => Number.parseInt(item)).reverse();

    let sols: any = [];
    for (let x = 0; x < integerDenominations.length; x++) {
      const current = integerDenominations[x];

      if (current <= postageCost) {
        const solution = generateIndividualSolution([current], postageCost - current, integerDenominations);

        if (solution && solution.length > 0) {
          sols = [...solution, ...sols];
        }
      }
    }

    setSolutions(sortAndRemoveSolutionDuplicates(sols));
  };

  const sortAndRemoveSolutionDuplicates = (arr: number[][]) => {
    const sortedStrArrays = arr.map(solution => {
      const sorted = solution.sort(sortInts);
      return sorted.toString();
    });
    const duplicatesRemoved = new Set(sortedStrArrays);
    return Array.from(duplicatesRemoved).map(entry => entry.split(',')).reverse();
  }

  const generateIndividualSolution = (stamps: number[], remainingAmount: number, remainingStamps: number[]) => {
    if (remainingAmount === 0) {
      return [stamps];
    } else if (remainingAmount < remainingStamps[remainingStamps.length - 1] || stamps.length >= maxStamps) {
      return [];
    }

    let newSolutions: any = [];
    for (let x = 0; x < remainingStamps.length; x++) {
      const current = remainingStamps[x];
      if (remainingAmount >= current) {
        const deeperSolutions = generateIndividualSolution([current, ...stamps], remainingAmount - current, remainingStamps.slice(x));
        newSolutions = [...deeperSolutions, ...newSolutions];
      }
    }

    return newSolutions;
  };

  const drawStamps = (stamps: number[]) => {
    return (
      <div>
        { stamps.map((stamp: number, index: number) =>
          (<div className="stampContainer"><div key={'' + stamp + index} className="stamp">{stamp}</div></div>)
        )}
      </div>
    );
  };

  const [stampDenominations, setStampDenominations] = useState(DEFAULT_STAMP_DENOMINATIONS.toString());
  const [postageCost, setPostageCost] = useState(DEFAULT_POSTAGE_COST);
  const [maxStamps, setMaxStamps] = useState(DEFAULT_STAMP_MAX);
  const [solutions, setSolutions] = useState(new Array());

  useEffect(() => {
    const storedPostageCost = localStorage.getItem('postageCost');
    if (storedPostageCost) {
      setPostageCost(Number.parseInt(storedPostageCost));
    }

    const storedMaxStamps = localStorage.getItem('maxStamps');
    if (storedMaxStamps) {
      setMaxStamps(Number.parseInt(storedMaxStamps));
    }

    const storedDenominations = localStorage.getItem('stampDenominations');
    if (storedDenominations) {
      setStampDenominations(storedDenominations);
    }
  }, [setPostageCost, setMaxStamps, setStampDenominations]);

  return (
    <div className='mainList'>
      <div className='dataEntry'>
        <TextField
          label="Postage Cost in Cents"
          className='totalCostCents'
          value={postageCost}
          InputProps={{
            endAdornment: <InputAdornment position="end">¢</InputAdornment>,
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const newPostageCost = Number.parseInt(event.target.value) || 0;
            localStorage.setItem('postageCost', newPostageCost.toString());
            setPostageCost(newPostageCost);
          }}
        />
        <TextField
          label="Max # of Stamps"
          className='maxStamps'
          value={maxStamps}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            localStorage.setItem('maxStamps', event.target.value);
            setMaxStamps(Number.parseInt(event.target.value) || 0);
          }}
        />
        <TextField
          label="Stamp Values Available"
          className='stampValues'
          value={stampDenominations}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStampDenominations(event.target.value || '')}
          onBlur={() => {
            const intStampDenoms = stampDenominations.split(',').map(strDenom => Number.parseInt(strDenom.trim()));
            const strSortedStampDenoms = intStampDenoms.sort(sortInts).toString();

            localStorage.setItem('stampDenominations', strSortedStampDenoms);
            setStampDenominations(strSortedStampDenoms);
          }}
        />
        <Button
          variant="contained"
          onClick={() => generateSolutions()}
          className="generateSolution"
        >
          Generate Solutions
        </Button>
      </div>
      <hr className='divider' />
      <List className='displayPostageSolution'>
        { solutions.map((sol: number[]) => (
          <ListItem key={sol.toString()} className='postageSolution'>{drawStamps(sol)}</ListItem>
        ))}
      </List>
    </div>
  );
}

export default App;
