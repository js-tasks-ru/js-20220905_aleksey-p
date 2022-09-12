/**
 * createGetter - creates function getter which allows select value from object
 * @returns {function} - function-getter which allow get value from object by set path
 * @param object
 * @param pathArr
 * @param i
 */
const findValue = (object, pathArr, i = 0) =>
  (pathArr.length > i && object !== undefined) ?
    findValue(object[pathArr[i]], pathArr, ++i) :
    object;

export function createGetter(path) {
  const pathArr = path.split('.');
  return obj => findValue(obj, pathArr);
}
