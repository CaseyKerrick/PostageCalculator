import React, { useState, useEffect } from 'react';
import { InputAdornment, TextField, List, ListItem } from '@mui/material';
import { Pressable, Text } from 'react-native';
import fullLogo from './FullLogo_Transparent.png';
import { removeDuplicateLists, spliterate, subtractLists, sortInts, sum } from './util';
import './App.css';

function App() {
  const DEFAULT_STAMP_DENOMINATIONS = '4, 5, 10, 18, 20, 22, 24, 29, 33, 34, 50, 51, 66, 87, 100, 111';
  const DEFAULT_POSTAGE_COST = 51;
  const DEFAULT_STAMP_MAX = 4;
  const STRING_CONTAINS_LETTER = /[a-zA-Z]/;

  const generateSolutions = () => {
    const cleanRequiredStamps = spliterate(desiredDenominations);
    const requiredStampsSum = sum(cleanRequiredStamps);

    if (postageCost === requiredStampsSum) {
      setSolutions(sortAndRemoveArrayDuplicates([cleanRequiredStamps]));
      return;
    }

    const cleanStampDenoms = subtractLists(spliterate(stampDenominations), spliterate(excludedDenominations));
    let rawSolutions: number[][] = scrySolutions([cleanRequiredStamps], postageCost, cleanStampDenoms, maxStamps - cleanRequiredStamps.length);

    setSolutions(sortAndRemoveArrayDuplicates(rawSolutions));
    setShowFreshSolutions(true);
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
          nextSolutions.push([...rawSolutions[x]]);
          break;
        }
        nextSolutions.push([...rawSolutions[x], availableDenominations[y]]);
      }
    }

    return scrySolutions([...removeDuplicateLists(nextSolutions)], maxPostage, availableDenominations, stampSlotsRemaining - 1);
  };

  const sortAndRemoveArrayDuplicates = (arr: number[][]) => {
    const noEmptiesOrBadSumsArr = arr.filter(item => item.length > 0 && sum(item) === postageCost);
    const sortedByLengthArr = noEmptiesOrBadSumsArr.sort((a: number[], b: number[]) => a.length - b.length);
    return sortedByLengthArr;
  };

  const displaySolutions = () => {
    if (showFreshSolutions) {
      return drawList(solutions);
    } else if (savedSolutions.length > 0) {
      return drawList(savedSolutions, false);
    }

    return 'To save a solution, click on it.';
  }

  const modifySavedSolutions = (index: number, addMode: boolean = true) => {
    if (!addMode) {
      savedSolutions.splice(index, 1);
      const newSolutions = [...savedSolutions];

      setSavedSolutions(newSolutions);
      localStorage.setItem('savedSolutions', newSolutions.map(item => item.join(',')).join(';'));
    } else {
      const newSolutions = [...savedSolutions, solutions[index]];

      setSavedSolutions(newSolutions);
      localStorage.setItem('savedSolutions', newSolutions.map(item => item.join(',')).join(';'));
    }
  };

  const drawList = (arr: number[][], addMode: boolean = true) => {
    return (
      <List className='displayPostageSolution'>
        { arr.map((sol: number[], index: number) => (
          <div className='solutionButtonHelper'>
            <Pressable
              onPress={(event) => modifySavedSolutions(index, addMode)}
              aria-label={`Click to ${addMode ? 'add to' : 'remove from'} saved solutions`}
            >
              <ListItem key={sol.toString() + index.toString()} className='postageSolution'>
                {drawStamps(sol, addMode)}
              </ListItem>
            </Pressable>
          </div>
        ))}
      </List>
    );
  };

  const drawStamps = (stamps: number[], addMode: boolean = true) => {
    return (
      <div>
        { stamps.map((stamp: number, index: number) => (
          <div key={`container${stamp}${index}`} className="stampContainer">
            <div key={`${stamp}${index}`} className="stamp">{stamp}</div>
          </div>
        ))}
      </div>
    );
  };

  const onListBlur = (key: string, listVar: string, setListVar: Function) => {
    const numberList = listVar.split(',').map(item => Number.parseInt(item)).filter(item => !!item);
    const strSortedList = numberList.sort(sortInts).join(', ');
    if (!STRING_CONTAINS_LETTER.test(strSortedList)) {
      setListVar(strSortedList);
      localStorage.setItem(key, strSortedList);
    }
  };

  const showSavedSolutions = () => {
    setSolutions([...savedSolutions, '1,2,3']);
    setShowFreshSolutions(false);
  };

  const [stampDenominations, setStampDenominations] = useState(DEFAULT_STAMP_DENOMINATIONS);
  const [postageCost, setPostageCost] = useState(DEFAULT_POSTAGE_COST);
  const [maxStamps, setMaxStamps] = useState(DEFAULT_STAMP_MAX);
  const [desiredDenominations, setDesiredDenominations] = useState('');
  const [excludedDenominations, setExcludedDenominations] = useState('');
  const [solutions, setSolutions] = useState(new Array());
  const [savedSolutions, setSavedSolutions] = useState(new Array());
  const [showFreshSolutions, setShowFreshSolutions] = useState(true);

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

    const storedDesiredDenominations = localStorage.getItem('desiredDenominations');
    if (storedDesiredDenominations) {
      setDesiredDenominations(storedDesiredDenominations);
    }

    const storedExcludedDenominations = localStorage.getItem('excludedDenominations');
    if (storedExcludedDenominations) {
      setExcludedDenominations(storedExcludedDenominations);
    }

    const storedSavedSolutions = localStorage.getItem('savedSolutions');
    if (storedSavedSolutions) {
      const cleanSavedSolutions = storedSavedSolutions.split(';').map(item => spliterate(item));
      setSavedSolutions(cleanSavedSolutions);
    }
  }, [setPostageCost, setMaxStamps, setStampDenominations, setDesiredDenominations, setExcludedDenominations, setSavedSolutions]);

  return (
    <>
      <div className="logoHeader">
        <img src={fullLogo} alt="Snail with an at symbol shell. Happy Mail Postage Calculator" className="logo" />
      </div>
      <div className='content'>
        <div className='dataEntry'>
          <TextField
            label='Total Postage Cost'
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
            label='Max Stamps Allowed'
            className='smallDataEntry'
            value={maxStamps}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              localStorage.setItem('maxStamps', event.target.value);
              setMaxStamps(Number.parseInt(event.target.value) || 0);
            }}
          />
          <TextField
            label="Postage Denominations Available"
            className='largeDataEntry'
            value={stampDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStampDenominations(event.target.value)}
            onBlur={() => onListBlur('stampDenominations', stampDenominations, setStampDenominations)}
          />
          <TextField
            label="Postage To Include"
            className='largeDataEntry'
            value={desiredDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDesiredDenominations(event.target.value)}
            onBlur={() => onListBlur('desiredDenominations', desiredDenominations, setDesiredDenominations)}
          />
          <TextField
            label="Postage To Exclude"
            className='largeDataEntry'
            value={excludedDenominations}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExcludedDenominations(event.target.value)}
            onBlur={() => onListBlur('excludedDenominations', excludedDenominations, setExcludedDenominations)}
          />
          <div className='generateSolution'>
            <Pressable onPress={generateSolutions} aria-label='Create postage solutions'>
              <Text><div className='whiteTextButton'>Go!</div></Text>
            </Pressable>
          </div>
          <div className='resetOptions'>
            <Pressable onPress={showSavedSolutions} aria-label='Reset all options'>
              <Text><div className='whiteTextButton'>Saved Combinations</div></Text>
            </Pressable>
          </div>
        </div>
        {displaySolutions()}
        {/* <div className='footer'>
          <div className='footerText footerButton'><Text>Source Code</Text></div>
          <div className='footerText'><Text>Copyright (c) 2023</Text></div>
          <div className='footerText footerButton'><Text>Donate</Text></div>
        </div> */}
      </div>
    </>
  );
}

export default App;
