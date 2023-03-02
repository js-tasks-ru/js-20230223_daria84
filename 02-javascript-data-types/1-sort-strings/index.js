/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  function sortByLocaleAndCase(a, b) {
    const locale = "ru";
    const options = { sensitivity: "base" };
    const result =
      param === "desc"
        ? b.localeCompare(a, locale, options)
        : a.localeCompare(b, locale, options);

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
  return [...arr].sort(sortByLocaleAndCase);
}
