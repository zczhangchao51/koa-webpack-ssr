export function getFirstChild(node, cur) {
  cur = node.firstChild
  for (; cur; cur = cur.nextSibling) {
    if (cur.nodeType === 1) return cur
  }
  return null
}

export function getElementTop(el) {
  let actualTop = el.offsetTop
  let current = el.offsetParent
  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return actualTop
}

export function getNext(el) {
  while ((el = el.nextSibling) && el.nodeType !== 1) {}
  return el
}

export function getNextUtil(el, selector) {
  while ((el = el.nextSibling)) {
    if (el.nodeType === 1 && el.matches(selector)) return el
  }
  return null
}
