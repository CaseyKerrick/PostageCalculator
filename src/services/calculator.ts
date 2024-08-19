import { removeDuplicateLists, spliterate, subtractLists, sum } from './util';


export const generateSolutions = (
  postageCost: number,
  maxStamps: number,
  stampDenominations: string,
  desiredDenominations: string,
  excludedDenominations: string,
) => {
  const cleanRequiredStamps = spliterate(desiredDenominations);
  const requiredStampsSum = sum(cleanRequiredStamps);

  if (postageCost === requiredStampsSum) {
    const sortedShortcutArr = sortAndRemoveArrayDuplicates([cleanRequiredStamps], postageCost);
    return sortedShortcutArr.map(solution => {
      return { isSaved: false, stamps: solution };
    });
  }

  const cleanStampDenoms = subtractLists(spliterate(stampDenominations), spliterate(excludedDenominations));
  let rawSolutions: number[][] = scrySolutions([cleanRequiredStamps], postageCost, cleanStampDenoms, maxStamps - cleanRequiredStamps.length);

  const sortedArr = sortAndRemoveArrayDuplicates(rawSolutions, postageCost);
  return sortedArr.map(solution => {
    return { isSaved: false, stamps: solution };
  });
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

const sortAndRemoveArrayDuplicates = (arr: number[][], postageCost: number) => {
  const noEmptiesOrBadSumsArr = arr.filter(item => item.length > 0 && sum(item) === postageCost);
  const sortedByLengthArr = noEmptiesOrBadSumsArr.sort((a: number[], b: number[]) => a.length - b.length);
  return sortedByLengthArr;
};
