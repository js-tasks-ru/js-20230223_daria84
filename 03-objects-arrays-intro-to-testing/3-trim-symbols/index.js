/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string === "" || size === 0) {
    return "";
  }

  if (size === undefined) {
    return string;
  }

  let identicalCount = 0;

  const trimmedString = Array.from(string).reduce(
    (accumulator, currentValue, currentIndex, array) => {
      const nextValue = array[currentIndex + 1];
      if (currentValue === nextValue) {
        identicalCount++;
      } else {
        identicalCount = 0;
      }
      if (identicalCount < size) {
        accumulator += currentValue;
      }

      return accumulator;
    },
    ""
  );

  return trimmedString;
}
