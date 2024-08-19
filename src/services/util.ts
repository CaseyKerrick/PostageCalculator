export const spliterate = (rawArr: string): number[] => {
  return rawArr.split(',').map((item: string) => Number.parseInt(item)).filter(item => !!item);
};

export const subtractLists = (listA: number[], listB: number[]): number[] => {
  let subtractedList = [];
  for (let x = 0; x < listA.length; x++) {
    if (!listB.includes(listA[x])) {
      subtractedList.push(listA[x]);
    }
  }

  return subtractedList;
};

export const sortInts = (a: number, b: number) => a - b;

export const sum = (arr: number[]): number => {
  return arr.length > 0 ? arr.reduce((total: number, curr: number) => total + curr) : 0;
};

export const removeDuplicateLists = (arr: number[][]) => {
  const sortedStringifiedArr = arr.map(item => item.sort(sortInts).toString());
  const sortedSet = new Set(sortedStringifiedArr);
  const duplicatesRemoved = Array.from(sortedSet);

  return duplicatesRemoved.map(spliterate);
};

export type Solution = {
  isSaved: boolean,
  stamps: number[],
};
