export function sortByAscending(sortBy: string) {
  return (a: any, b: any)=>{
    if (a?.[sortBy] < b?.[sortBy]) {
      return -1;
    }
    if (a?.[sortBy] > b?.[sortBy]) {
      return 1;
    }
    return 0;
  }
}


export const customSort = (list: string[]): string[] => {
  const customSortKey = (item: string): (string | number)[] => {
    const parts = item.split(/(\d+)/).map(part => (isNaN(Number(part)) ? part : Number(part)));
    return parts;
  };

  return list.sort((a, b) => {
    const keyA = customSortKey(a);
    const keyB = customSortKey(b);

    for (let i = 0; i < Math.min(keyA.length, keyB.length); i++) {
      if (keyA[i] < keyB[i]) {
        return -1;
      } else if (keyA[i] > keyB[i]) {
        return 1;
      }
    }

    return keyA.length - keyB.length;
  });
};
