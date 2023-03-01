/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  function sortByLocaleAndCase(a, b) {
    const result = a.localeCompare(b, "ru", { sensitivity: "base" });
    if (result !== 0) {
      return result;
    } else {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }
  }
  const newArr = [...arr].sort(sortByLocaleAndCase);
  if (param === "desc") {
    newArr.reverse();
  }
  return newArr;
}
