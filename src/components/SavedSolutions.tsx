import { List, ListItem } from '@mui/material';
import { Pressable } from 'react-native';
import { Solution } from '../services/util';


const toggleSolution = (index: number, arr: Solution[], alreadySaved: boolean, setSavedSolutions: Function) => {
  setSavedSolutions(arr.map((item, i) => {
    if (i === index) {
      return { ...item, isSaved: !alreadySaved };
    }
    
    return item;
  }));
};

function SavedSolutions(props: any) {
  return (
    <List className='displayPostageSolution'>
      { props.savedSolutions.map((sol: Solution, index: number) => (
        <div className='solutionButtonHelper'>
          <Pressable
            onPress={() => toggleSolution(index, props.savedSolutions, sol.isSaved, props.setSavedSolutions)}
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

export default SavedSolutions;