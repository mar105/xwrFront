import fetch from 'dva/fetch';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response): any {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options): any {
  // @ts-ignore
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => ({ data }))
    .catch((err) => ({ err }));
}

export function getRequest(url, token): any {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  };
  return request(url, options);
}

export function postRequest(url, token, params): any {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify(params),
  };
  return request(url, options);
}

export function postExcelRequest(url, token, params): any {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify(params),
  };
  return fetch(url, options).catch((err) => ({ err }));
}