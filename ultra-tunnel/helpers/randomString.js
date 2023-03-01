module.exports = (length) => {
  const dictionary = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = '';

  for (let i = 0; i < length; i++) {
    const offset = Math.floor(Math.random() * dictionary.length);
    result += dictionary[offset];
  }
  return result;
}
