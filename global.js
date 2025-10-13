console.log('hai...');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}