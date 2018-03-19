// //polyfills

// /**
//  * detect IE
//  * returns version of IE or false, if browser is not Internet Explorer
//  */
// function detectIE() {
//   const ua = window.navigator.userAgent;

//   // Test values; Uncomment to check result …

//   // IE 10
//   // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
//   // IE 11
//   // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
//   // Edge 12 (Spartan)
//   // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
//   // Edge 13
//   // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

//   const msie = ua.indexOf('MSIE ');
//   if (msie > 0) {
//     // IE 10 or older => return version number
//     return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
//   }

//   const trident = ua.indexOf('Trident/');
//   if (trident > 0) {
//     // IE 11 => return version number
//     const rv = ua.indexOf('rv:');
//     return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
//   }

//   const edge = ua.indexOf('Edge/');
//   if (edge > 0) {
//     // Edge (IE 12+) => return version number
//     return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
//   }

//   // other browser
//   return false;
// }

// //Array.find for all IE
// if (!Array.prototype.find) {
//   Object.defineProperty(Array.prototype, 'find', {
//     value: function(predicate: any) {
//      // 1. Let O be ? ToObject(this value).
//       if (this == null) {
//         throw new TypeError('"this" is null or not defined');
//       }

//       let o = Object(this);

//       // 2. Let len be ? ToLength(? Get(O, "length")).
//       let len = o.length >>> 0;

//       // 3. If IsCallable(predicate) is false, throw a TypeError exception.
//       if (typeof predicate !== 'function') {
//         throw new TypeError('predicate must be a function');
//       }

//       // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
//       let thisArg = arguments[1];

//       // 5. Let k be 0.
//       let k = 0;

//       // 6. Repeat, while k < len
//       while (k < len) {
//         // a. Let Pk be ! ToString(k).
//         // b. Let kValue be ? Get(O, Pk).
//         // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
//         // d. If testResult is true, return kValue.
//         let kValue = o[k];
//         if (predicate.call(thisArg, kValue, k, o)) {
//           return kValue;
//         }
//         // e. Increase k by 1.
//         k++;
//       }

//       // 7. Return undefined.
//       return undefined;
//     }
//   });
// }

// //Array.findIndex for all IE and Edge
// // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
// if (!Array.prototype.findIndex) {
//   Object.defineProperty(Array.prototype, 'findIndex', {
//     value: function(predicate: any) {
//      // 1. Let O be ? ToObject(this value).
//       if (this == null) {
//         throw new TypeError('"this" is null or not defined');
//       }

//       const o = Object(this);

//       // 2. Let len be ? ToLength(? Get(O, "length")).
//       const len = o.length >>> 0;

//       // 3. If IsCallable(predicate) is false, throw a TypeError exception.
//       if (typeof predicate !== 'function') {
//         throw new TypeError('predicate must be a function');
//       }

//       // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
//       const thisArg = arguments[1];

//       // 5. Let k be 0.
//       let k = 0;

//       // 6. Repeat, while k < len
//       while (k < len) {
//         // a. Let Pk be ! ToString(k).
//         // b. Let kValue be ? Get(O, Pk).
//         // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
//         // d. If testResult is true, return k.
//         const kValue = o[k];
//         if (predicate.call(thisArg, kValue, k, o)) {
//           return k;
//         }
//         // e. Increase k by 1.
//         k++;
//       }

//       // 7. Return -1.
//       return -1;
//     }
//   });
// }

// //Array.from for all IE and Edge 
// // Production steps of ECMA-262, Edition 6, 22.1.2.1
// if (!Array.from) {
//   Array.from = (function () {
//     const toStr = Object.prototype.toString;
//     const isCallable = function (fn: Function) {
//       return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
//     };
//     const toInteger = function (value:any) {
//       const number = Number(value);
//       if (isNaN(number)) { return 0; }
//       if (number === 0 || !isFinite(number)) { return number; }
//       return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
//     };
//     const maxSafeInteger = Math.pow(2, 53) - 1;
//     const toLength = function (value:number) {
//       const len = toInteger(value);
//       return Math.min(Math.max(len, 0), maxSafeInteger);
//     };

//     // The length property of the from method is 1.
//     return function from(this: any, arrayLike: any/*, mapFn, thisArg */) {
//       // 1. Let C be the this value.
//       const C: any = this ;

//       // 2. Let items be ToObject(arrayLike).
//       const items = Object(arrayLike);

//       // 3. ReturnIfAbrupt(items).
//       if (arrayLike == null) {
//         throw new TypeError('Array.from requires an array-like object - not null or undefined');
//       }

//       // 4. If mapfn is undefined, then let mapping be false.
//       const mapFn = arguments.length > 1 ? arguments[1] : void undefined;
//       let T;
//       if (typeof mapFn !== 'undefined') {
//         // 5. else
//         // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
//         if (!isCallable(mapFn)) {
//           throw new TypeError('Array.from: when provided, the second argument must be a function');
//         }

//         // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
//         if (arguments.length > 2) {
//           T = arguments[2];
//         }
//       }

//       // 10. Let lenValue be Get(items, "length").
//       // 11. Let len be ToLength(lenValue).
//       const len = toLength(items.length);

//       // 13. If IsConstructor(C) is true, then
//       // 13. a. Let A be the result of calling the [[Construct]] internal method 
//       // of C with an argument list containing the single item len.
//       // 14. a. Else, Let A be ArrayCreate(len).
//       const A = isCallable(C) ? Object(new C(len)) : new Array(len);

//       // 16. Let k be 0.
//       let k = 0;
//       // 17. Repeat, while k < len… (also steps a - h)
//       let kValue;
//       while (k < len) {
//         kValue = items[k];
//         if (mapFn) {
//           A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
//         } else {
//           A[k] = kValue;
//         }
//         k += 1;
//       }
//       // 18. Let putStatus be Put(A, "length", len, true).
//       A.length = len;
//       // 20. Return A.
//       return A;
//     };
//   }());
// }


// //String.includes for all IE and Edge
// if (!String.prototype.includes) {
//   String.prototype.includes = function(search: string, start: number) {
//     'use strict';
//     if (typeof start !== 'number') {
//       start = 0;
//     }
    
//     if (start + search.length > this.length) {
//       return false;
//     } else {
//       return this.indexOf(search, start) !== -1;
//     }
//   };
// }

// //_Alz workaround for "ag-grid-react": "13.3.0" for MS browsers 
// if(detectIE()){
//   Object.keys = (function() {
//     'use strict';
//     const hasOwnProperty = Object.prototype.hasOwnProperty,
//         hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
//         dontEnums = [
//           'toString',
//           'toLocaleString',
//           'valueOf',
//           'hasOwnProperty',
//           'isPrototypeOf',
//           'propertyIsEnumerable',
//           'constructor'
//         ],
//         dontEnumsLength = dontEnums.length;

//     return function(obj:any) {
//       if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
//         // throw new TypeError('Object.keys called on non-object');
//         return []
//       }

//       let result = [], prop, i;

//       for (prop in obj) {
//         if (hasOwnProperty.call(obj, prop)) {
//           result.push(prop);
//         }
//       }

//       if (hasDontEnumBug) {
//         for (i = 0; i < dontEnumsLength; i++) {
//           if (hasOwnProperty.call(obj, dontEnums[i])) {
//             result.push(dontEnums[i]);
//           }
//         }
//       }
//       return result;
//     };
//   }());
// }

// if (!Object.entries)
//   Object.entries = function( obj:any ){
//     let ownProps = Object.keys( obj ),
//         i = ownProps.length,
//         resArray = new Array(i); // preallocate the Array
//     while (i--)
//       resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
//     return resArray;
//   };