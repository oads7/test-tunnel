module.exports = (httpBuffer) => {
  const http = httpBuffer.toString();
  const httpBodyPosition = http.indexOf('\r\n\r\n') + 4;

  const httpHeader = http.slice(0, httpBodyPosition - 4);
  const httpHeaderLines = httpHeader.split('\r\n');
  const httpHeaderControl = httpHeaderLines[0].split(' ');
  const isResponse = httpHeaderControl[0].startsWith('HTTP');

  const method = !isResponse ? httpHeaderControl[0] : null;
  const url = !isResponse ? httpHeaderControl[1] : null;
  const httpVersion = httpHeaderControl[!isResponse ? 2 : 0];
  const httpVersionCode = +httpVersion.substring(httpVersion.indexOf('/') + 1);
  const statusCode = isResponse ? httpHeaderControl[1] : null;

  let headers = {};
  for (let h = 1; h < httpHeaderLines.length; h++) {
    const line = httpHeaderLines[h];
    const [key, value] = line.split(': ');
    headers[key] = value;
  }

  return isResponse ? { httpVersion, httpVersionCode, statusCode, headers } :
    { method, url, httpVersion, httpVersionCode, headers};
}
