/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

  return string
    ? recursion([...string], [...string][0], size).join("")
    : "";
}
function recursion(arr, sym, size) {

  let i = 0;
  let count = 0;

  while (arr[i] === sym) {
    count++;
    i++;
  }

  const arrSym = [...(sym.repeat(count >= size ? size : count))];

  return arr.slice(i).length
    ? arrSym.concat(recursion(arr.slice(i), arr[i], size))
    : arrSym;
}

