export const findMaxRepeatedItemInArray = (arr: string[]): string | undefined => {
  const countMap: Map<string, number> = new Map();

  // Count occurrences of each element
  arr.forEach((element) => {
    countMap.set(element, (countMap.get(element) || 0) + 1);
  });

  // Find the element with the maximum count
  let maxElement: string | undefined;
  let maxCount = 0;

  countMap.forEach((count, element) => {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  });

  return maxElement;
};