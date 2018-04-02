// Object
import 'core-js/fn/object/assign'
import 'core-js/fn/object/keys'
import 'core-js/fn/object/values'

// Array
import 'core-js/fn/array/find'
import 'core-js/fn/array/includes'
import 'core-js/fn/array/find-index'

// String
import 'core-js/fn/string/includes'

// promise
import 'core-js/es6/promise'

// Element classList
if (process.browser) {
  if (!('classList' in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
      get() {
        let self = this
        function update(fn, type) {
          return function() {
            let length = arguments.length
            let classs = self.className.split(/\s+/g)
            if (type === 'item' || type === 'contains') {
              return fn(classs, arguments[0])
            } else {
              if (type === 'toggle') {
                let val = arguments[0]
                let index = classs.indexOf(val)
                fn(classs, index, val, arguments[1])
              } else {
                for (let i = 0; i < length; i++) {
                  let val = arguments[i]
                  if (typeof val !== 'string') throw Error('参数必须是字符串')
                  let index = classs.indexOf(val)
                  fn(classs, index, val)
                }
              }
              self.className = classs.join(' ')
            }
          }
        }
        return {
          add: update((classs, index, val) => {
            if (!~index) classs.push(val)
          }),
          remove: update((classs, index, val) => {
            if (index > 0) classs.splice(index, 1)
          }),
          item: update((classs, num) => {
            return classs[num] || null
          }, 'item'),
          contains: update((classs, val) => {
            return classs.includes(val)
          }, 'contains'),
          toggle: update((classs, index, val, force) => {
            if (force !== void 0) {
              if (force) {
                if (!~index) classs.push(val)
              } else {
                if (index > 0) classs.splice(index, 1)
              }
            } else {
              if (!~index) {
                classs.push(val)
              } else {
                classs.splice(index, 1)
              }
            }
          }, 'toggle')
        }
      }
    })
  }
}

// Element matchs
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s)
      var i = matches.length
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1
    }
}

// requestAnimationFrame
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame =
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 17)
    }
}
