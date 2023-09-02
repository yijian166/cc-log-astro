import qs from 'qs';
import fetch from 'node-fetch';
export const PaginationLimit = 30;
export const AdminJwtTokenKey = 'adminJWTToken';
export const CancelByAbort = 'The user aborted a request.';

export const AdminUrl = import.meta.env.SECRET_Backend;
export const SiteUrl = import.meta.env.SECRET_Url;
export const apiRequestV2WithThrow = async (
  url,
  method,
  param = {},
  option = {},
) => {
  const result = await apiRequestV2(url, method, param, option);
  if (result.error) {
    throw result.error;
  }
  return result;
};

export const apiRequestV2 = async (url, method, param = {}, option = {}) => {
  try {
    url = url.startsWith(AdminUrl)
      ? url
      : `${AdminUrl}${url.startsWith('/') ? url : `/${url}`}`;
    if (method === 'GET') {
      url += '?' + qs.stringify(param);
      // console.log('---request url---', url);
    }
    // console.log('---request url---', url, param, option);
    const res = await fetch(url, {
      ...(method !== 'GET' && {
        body: JSON.stringify(option.query ? { query: option.query } : param),
      }),
      method: method,
      headers: {
        'content-type': 'application/json',
        ...(option.token && {
          Authorization: `Bearer ${option.token}`,
        }),
      },
      ...(option.signal ? { signal: option.signal } : {}),
    });
    // console.log('--1 0', url);
    if (url.endsWith('posts')) {
      console.log('--1', param, res, url);
    }
    if (
      (res.status === 401 && res.statusText === 'Unauthorized') ||
      (res.status === 403 && res.statusText === 'Forbidden')
    ) {
      return {
        error: res.statusText,
        unauthorized: true,
      };
    }
    if (option.returnText) {
      const count = await res.text();
      return {
        error: '',
        data: parseInt(count),
      };
    }
    const data = await res.json();
    // console.log('--2 url', url, data);
    if (option.query) {
      // graphql
      return {
        error: '',
        data: data.data,
      };
    }
    if (!option.noObject && typeof data === 'object') {
      if (data.error) {
        const error = data.message?.[0]?.messages?.[0]?.message ?? data.error;
        return { error };
      }
      return {
        error: '',
        data,
      };
    }
    if (option.noObject) {
      return { error: '', data };
    }
    return { error: 'unknow error' };
  } catch (e) {
    console.log('---e', e);
    const error =
      typeof e === 'object' ? e?.message ?? 'Api Error' : e.toString();
    // console.warn('---apiRequest---', error.message === apiRequest.CanelByObort);
    return { error };
  }
};

export function toJsonObject(data, timeLocal = false) {
  // console.log('-tojsondata', data);
  if (!data) {
    return data;
  }
  const _data = { ...data };
  // _data._createTime =
  //   _data.createTime instanceof Date ? _data.createTime.toLocaleString() : '';
  // _data._modifyTime =
  //   _data.modifyTime instanceof Date ? _data.modifyTime.toLocaleString() : '';
  const cr =
    !timeLocal || !_data.created_at
      ? _data.created_at ?? ''
      : new Date(_data.created_at).toLocaleString();
  const up =
    !timeLocal || !_data.updated_at
      ? _data.updated_at ?? ''
      : new Date(_data.updated_at).toLocaleString();
  _data._createTime = cr;
  _data._modifyTime = up;
  _data.createTime = cr;
  _data.modifyTime = up;
  const content = _data.content || '';
  const richContent = _data.richContent || {};
  _data.content = richContent;
  _data.rawContent = content;
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      _data[key] = value.getTime();
    }
  }

  return _data;
}
