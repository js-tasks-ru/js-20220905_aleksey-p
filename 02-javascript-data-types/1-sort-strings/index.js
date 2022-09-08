/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  const arrCopy = [...arr];
  const firstCase = param === 'asc' ? 'upper' : 'lower';
  const sortType = param === 'asc' ? 1 : -1;
  return arrCopy.sort((a, b) => sortType * a.localeCompare(b, ['ru', 'eng'], { caseFirst: firstCase}));
}
