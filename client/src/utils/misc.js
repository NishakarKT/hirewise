export const clearExistingTimeouts = () => {
  let id = window.setTimeout(() => {}, 0);
  while (id){
    window.clearTimeout(id);
    id -= 1;
  }
}

export const getMemorySize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${Math.round(bytes / 1024 ** i, 2)} ${sizes[i]}`;
}
