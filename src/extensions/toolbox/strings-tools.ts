import { is, trim } from "./utils.js";
import lodash from 'lodash';
const {kebabCase} = lodash

/**
 * Is this not a string?
 *
 * @param value The value to check
 * @return True if it is not a string, otherwise false
*/
function isNotString(value: any): boolean {
    return !is(String, value)
}
  
/**
 * Is this value a blank string?
 *
 * @param value The value to check.
 * @returns True if it was, otherwise false.
*/
function isBlank(value: any): boolean {
    return isNotString(value) || trim(value) === ''
}

export default{
    isNotString,
    isBlank,
    kebabCase
}