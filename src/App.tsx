import React, { useState, useEffect } from 'react';
import { InputAdornment, TextField, List, ListItem } from '@mui/material';
import { Pressable, Text } from 'react-native';
import fullLogo from './FullLogo_Transparent.png';
import './App.css';

function App() {
  const DEFAULT_STAMP_DENOMINATIONS = '4, 5, 10, 18, 20, 22, 24, 29, 33, 34, 50, 51, 66, 87, 100, 111';
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
        { stamps.map((stamp: number, index: number) => (
          <div key={'container' + stamp + index} className="stampContainer"><div key={'' + stamp + index} className="stamp">{stamp}</div></div>
        ))}
      </div>
    );
  };

  const [stampDenominations, setStampDenominations] = useState(DEFAULT_STAMP_DENOMINATIONS);
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
    <>
      <div className="logoHeader">
        <img src={fullLogo} alt="Snail with an at symbol shell. Happy Mail Postage Calculator" className="logo" />
      </div>
      <div className='content'>
        <div className='dataEntry'>
          <TextField
            label="Postage Cost"
            className='smallDataEntry'
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
            label="Max Stamps Allowed"
            className='smallDataEntry'
            value={maxStamps}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              localStorage.setItem('maxStamps', event.target.value);
              setMaxStamps(Number.parseInt(event.target.value) || 0);
            }}
          />
          <TextField
            label="Stamp Values Available"
            className='largeDataEntry'
            value={stampDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStampDenominations(event.target.value || '')}
            onBlur={() => {
              const intStampDenoms = stampDenominations.split(',').map(strDenom => Number.parseInt(strDenom.trim()));
              const strSortedStampDenoms = intStampDenoms.sort(sortInts).toString();

              localStorage.setItem('stampDenominations', strSortedStampDenoms);
              setStampDenominations(strSortedStampDenoms);
            }}
          />
          <Pressable
            onPress={() => generateSolutions()}
            // className='generateSolution'
            aria-label='test test test'
          >
            <div className='generateSolution'><Text><div className='whiteTextButton'>Generate Solutions</div></Text></div>
          </Pressable>
        </div>
        <List className='displayPostageSolution'>
          { solutions.map((sol: number[], index: number) => (
            <ListItem key={sol.toString() + index.toString()} className='postageSolution'>{drawStamps(sol)}</ListItem>
          ))}
        </List>
      </div>
    </>
  );
}

export default App;
