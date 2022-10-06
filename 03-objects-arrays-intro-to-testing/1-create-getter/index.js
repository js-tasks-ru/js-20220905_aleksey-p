/**
 * createGetter - creates function getter which allows select value from object
 * @returns {function} - function-getter which allow get value from object by set path
 * @param path
 */


export function createGetter(path) {
  const pathArr = path.split('.');

  const findValue = (object, i = 0) => (pathArr.length > i && object !== undefined)
    ? findValue(object[pathArr[i]], ++i)
    : object;

  return obj => findValue(obj);
}
