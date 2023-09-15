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
    const cleanRequiredStamps = spliterate(desiredDenominations);
    const requiredStampsSum = sum(cleanRequiredStamps);

    if (postageCost === requiredStampsSum) {
      setSolutions(sortAndRemoveSolutionDuplicates([cleanRequiredStamps]));
      return;
    }

    const cleanStampDenoms = spliterate(stampDenominations);
    let rawSolutions: number[][] = scrySolutions([cleanRequiredStamps], postageCost, cleanStampDenoms, maxStamps - cleanRequiredStamps.length);

    setSolutions(sortAndRemoveSolutionDuplicates(rawSolutions));
  };

  const scrySolutions = (rawSolutions: number[][], maxPostage: number, availableDenominations: number[], stampSlotsRemaining: number): number[][] => {
    if (stampSlotsRemaining <= 0) {
      return rawSolutions;
    }

    let nextSolutions: number[][] = [];
    for (let x = 0; x < rawSolutions.length; x++) {
      const currentSum = sum(rawSolutions[x]);

      for (let y = 0; y < availableDenominations.length; y++) {
        if (currentSum + availableDenominations[y] > maxPostage) {
          break;
        }
        nextSolutions.push([...rawSolutions[x], availableDenominations[y]]);
      }
    }

    return scrySolutions([...rawSolutions, ...nextSolutions], maxPostage, availableDenominations, stampSlotsRemaining - 1);
  };

  const spliterate = (rawArr: string): number[] => {
    return rawArr.split(',').map((item: string) => Number.parseInt(item)).filter(item => !!item);
  };

  const sum = (arr: number[]): number => {
    return arr.length > 0 ? arr.reduce((total: number, curr: number) => total + curr) : 0;
  };

  const sortAndRemoveSolutionDuplicates = (arr: number[][]) => {
    const noEmptiesArr = arr.filter(item => item.length > 0 && sum(item) === postageCost);
    const sortedStrArrays = noEmptiesArr.map(solution => {
      const sorted = solution.sort(sortInts);
      return sorted.toString();
    });
    const duplicatesRemoved = new Set(sortedStrArrays);
    return Array.from(duplicatesRemoved).map(entry => entry.split(','));
  };

  const drawStamps = (stamps: number[]) => {
    return (
      <div>
        { stamps.map((stamp: number, index: number) => (
          <div key={`container${stamp}${index}`} className="stampContainer"><div key={`${stamp}${index}`} className="stamp">{stamp}</div></div>
        ))}
      </div>
    );
  };

  const resetVariables = () => {
    setStampDenominations(DEFAULT_STAMP_DENOMINATIONS);
    setPostageCost(DEFAULT_POSTAGE_COST);
    setMaxStamps(DEFAULT_STAMP_MAX);
    setDesiredDenominations('');
  };

  const [stampDenominations, setStampDenominations] = useState(DEFAULT_STAMP_DENOMINATIONS);
  const [postageCost, setPostageCost] = useState(DEFAULT_POSTAGE_COST);
  const [maxStamps, setMaxStamps] = useState(DEFAULT_STAMP_MAX);
  const [desiredDenominations, setDesiredDenominations] = useState('');
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
            label="All Stamp Values Available"
            className='largeDataEntry'
            value={stampDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStampDenominations(event.target.value || '')}
            onBlur={() => {
              const intStampDenoms = stampDenominations.split(',').map(strDenom => Number.parseInt(strDenom.trim()));
              const strSortedStampDenoms = intStampDenoms.sort(sortInts).join(', ');

              var regExp = /[a-zA-Z]/;
              if (!regExp.test(strSortedStampDenoms)) {
                localStorage.setItem('stampDenominations', strSortedStampDenoms);
                setStampDenominations(strSortedStampDenoms);
              } else {
                setStampDenominations(DEFAULT_STAMP_DENOMINATIONS);
              }
            }}
          />
          <TextField
            label="Stamp Values Desired"
            className='largeDataEntry'
            value={desiredDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (event.target.value.toString() === '' || !!event.target.value) {
                setDesiredDenominations(event.target.value.toString());
              }
            }}
            onBlur={() => {
              const intStampDenoms = desiredDenominations.split(',').map(strDenom => Number.parseInt(strDenom.trim()));
              const strSortedStampDenoms = intStampDenoms.sort(sortInts).join(', ');

              // TODO: Use a RegEx to determine if the inputted string is a comma separated list
              // FOR NOW: just check if the input contains a letter
              var regExp = /[a-zA-Z]/;
              if (!regExp.test(strSortedStampDenoms)) {
                setDesiredDenominations(strSortedStampDenoms);
              }
            }}
          />
          <div className='generateSolution'>
            <Pressable onPress={() => generateSolutions()} aria-label='Create postage solutions'>
              <Text><div className='whiteTextButton'>Go!</div></Text>
            </Pressable>
          </div>
          <div className='resetOptions'>
            <Pressable onPress={() => resetVariables()} aria-label='Reset all options'>
              <Text><div className='whiteTextButton'>Reset</div></Text>
            </Pressable>
          </div>
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
