import { List, ListItem } from '@mui/material';
import { Pressable } from 'react-native';
import { Solution } from '../services/util';


const toggleSolution = (index: number, arr: Solution[], alreadySaved: boolean, setSolutions: Function, savedSolutions: Solution[], setSavedSolutions: Function) => {
  setSolutions(arr.map((item, i) => {
    if (i === index) {
      return { ...item, isSaved: !alreadySaved };
    }
    
    return item;
  }));
  
  if (!alreadySaved) {
    const newSavedSolutions = [...savedSolutions, { stamps: arr[index].stamps, isSaved: true }];
    localStorage.setItem('savedSolutions', JSON.stringify(newSavedSolutions));
    setSavedSolutions(newSavedSolutions);
  }
  else {
    const checkSolution = arr[index].stamps;

    const solutionRemoved = savedSolutions.filter(item => {
      if (checkSolution.length !== item.stamps.length) return true;

      for (let x = 0; x < checkSolution.length; x++) {
        if (checkSolution[x] !== item.stamps[x]) return true;
      }

      return false;
    });

    localStorage.setItem('savedSolutions', JSON.stringify(solutionRemoved));
    setSavedSolutions(solutionRemoved);
  }
};

function CalculatedSolutions(props: any) {
  return (
    <List className='displayPostageSolution'>
      { props.calculatedSolutions.map((sol: Solution, index: number) => (
        <div className='solutionButtonHelper'>
          <Pressable
            onPress={(event) => toggleSolution(index, props.calculatedSolutions, sol.isSaved, props.setSolutions, props.savedSolutions, props.setSavedSolutions)}
            aria-label={`Click to ${sol.isSaved ? 'remove from' : 'add to'} saved solutions`}
          >
            <ListItem key={sol.stamps.toString() + index.toString()} className={sol.isSaved ? 'postageSolutionSaved' : 'postageSolutionUnsaved'}>
              { sol.stamps.map((stamp: number, index: number) => (
                <div key={`container${stamp}_${index}`} className={sol.isSaved ? 'stampContainerSaved' : 'stampContainerUnsaved'}>
                  <div key={`${stamp}${index}`} className="stamp">{stamp}</div>
                </div>
              ))}
            </ListItem>
          </Pressable>
        </div>
      ))}
    </List>
  );
}

export default CalculatedSolutions;