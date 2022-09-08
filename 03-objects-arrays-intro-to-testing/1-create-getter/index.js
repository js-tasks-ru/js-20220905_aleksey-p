/**
 * createGetter - creates function getter which allows select value from object
 * @returns {function} - function-getter which allow get value from object by set path
 * @param object
 * @param pathArr
 */
const findValue = (object, pathArr) =>
  (pathArr.length > 0 && object !== undefined) ? findValue(object[pathArr.pop()], pathArr) : object;

export function createGetter(path) {
  return obj => findValue(obj, path.split('.').reverse());
}
