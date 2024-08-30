import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { Pressable, Text } from 'react-native';
import SavedSolutions from './components/SavedSolutions';
import CalculatedSolutions from './components/CalculatedSolutions';
import Footer from './components/Footer';
import fullLogo from './FullLogo_Transparent.png';
import { generateSolutions } from './services/calculator';
import { sortInts, Solution } from './services/util';
import './App.css';

const DEFAULT_STAMP_DENOMINATIONS = '4, 5, 10, 18, 20, 22, 24, 29, 33, 34, 50, 56';
const DEFAULT_POSTAGE_COST = '56';
const DEFAULT_STAMP_MAX = '4';
const STRING_CONTAINS_LETTER = /[a-zA-Z]/;

const sortSolutions = (arr: Solution[]) => {
  const noEmpties = arr.filter(item => item.stamps.length > 0);
  const sortedByStampValues = noEmpties.sort((a: Solution, b: Solution) => a.stamps[0] - b.stamps[0]).reverse();
  const sortedByLengthArr = sortedByStampValues.sort((a: Solution, b: Solution) => a.stamps.length - b.stamps.length);
  return sortedByLengthArr;
};

function App() {

  const onListBlur = (key: string, listVar: string, setListVar: Function) => {
    const numberList = listVar.split(',').map(item => Number(item)).filter(item => !!item);
    const strSortedList = numberList.sort(sortInts).join(', ');
    if (!STRING_CONTAINS_LETTER.test(strSortedList)) {
      setListVar(strSortedList);
      localStorage.setItem(key, strSortedList);
    }
  };

  const isSolutionSaved = (checkSolution: Array<number>) => {
    return savedSolutions.filter(item => {
      if (checkSolution.length !== item.stamps.length) return false;

      for (let x = 0; x < checkSolution.length; x++) {
        if (checkSolution[x] !== item.stamps[x]) return false;
      }

      return true;
    }).length > 0;
  };

  const showWhichSolutions = (fresh: boolean) => () => {
    const filteredSolutions = savedSolutions.filter(item => item.isSaved);
    const sortedSolutions = sortSolutions(filteredSolutions);
    localStorage.setItem('savedSolutions', JSON.stringify(sortedSolutions));
    setSavedSolutions(sortedSolutions);
    setShowFreshSolutions(fresh);
  }

  const [stampDenominations, setStampDenominations] = useState(DEFAULT_STAMP_DENOMINATIONS);
  const [postageCost, setPostageCost] = useState(DEFAULT_POSTAGE_COST);
  const [maxStamps, setMaxStamps] = useState(DEFAULT_STAMP_MAX);
  const [desiredDenominations, setDesiredDenominations] = useState('');
  const [excludedDenominations, setExcludedDenominations] = useState('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [savedSolutions, setSavedSolutions] = useState<Solution[]>([]);
  const [showFreshSolutions, setShowFreshSolutions] = useState(true);

  useEffect(() => {
    const storedPostageCost = localStorage.getItem('postageCost');
    if (storedPostageCost) {
      setPostageCost(storedPostageCost);
    }

    const storedMaxStamps = localStorage.getItem('maxStamps');
    if (storedMaxStamps) {
      setMaxStamps(storedMaxStamps);
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
      setSavedSolutions(JSON.parse(storedSavedSolutions));
    }
  }, [setPostageCost, setMaxStamps, setStampDenominations, setDesiredDenominations, setExcludedDenominations, setSavedSolutions]);

  return (
    <>
      <div className="logoHeader">
        <img src={fullLogo} alt="Snail with an at symbol for a shell. Text reads Happy Mail Postage Calculator" className="logo" />
      </div>
      <div className='content'>
        <div className='dataEntry'>
          <div className='shrinkRow'>
            <TextField
              label='Total Postage Cost'
              className='smallDataEntry'
              value={postageCost}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                localStorage.setItem('postageCost', event.target.value);
                setPostageCost(event.target.value);
              }}
            />
            <TextField
              label='Max # of Stamps'
              className='smallDataEntry'
              value={maxStamps}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                localStorage.setItem('maxStamps', event.target.value);
                setMaxStamps(event.target.value);
              }}
            />
          </div>
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
          <div className='shrinkRow'>
            <div className='generateSolution'>
              <Pressable onPress={() => {
                showWhichSolutions(true)();
                let generatedSolutions = generateSolutions(
                  Number(postageCost),
                  Number(maxStamps),
                  stampDenominations,
                  desiredDenominations,
                  excludedDenominations);
                let solutionsWithSavedIndicator = generatedSolutions.map(item => {
                  return {
                    isSaved: isSolutionSaved(item.stamps),
                    stamps: item.stamps,
                  };
                });
                setSolutions(solutionsWithSavedIndicator);
                setShowFreshSolutions(true);
              }} aria-label='Create postage solutions'>
                <Text><div className='whiteTextButton'>Go!</div></Text>
              </Pressable>
            </div>
            <div className='savedSolutionsButton'>
              <Pressable onPress={showWhichSolutions(false)} aria-label='Show saved combinations'>
                <Text><div className='whiteTextButton'>Favorites</div></Text>
              </Pressable>
            </div>
          </div>
        </div>
        { showFreshSolutions
          ? <CalculatedSolutions calculatedSolutions={solutions} setSolutions={setSolutions} savedSolutions={savedSolutions} setSavedSolutions={setSavedSolutions} />
          : <SavedSolutions savedSolutions={savedSolutions} setSavedSolutions={setSavedSolutions} />
        }
        <Footer />
      </div>
    </>
  );
}

export default App;
