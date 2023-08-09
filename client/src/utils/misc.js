export const clearExistingTimeouts = () => {
  let id = window.setTimeout(() => {}, 0);
  while (id){
    window.clearTimeout(id);
    id -= 1;
  }
}
