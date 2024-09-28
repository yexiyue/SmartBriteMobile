import "fast-text-encoding";

// 仅用来转换bytes
export function stringToUint8Array(str: string) {
  const len = str.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToString(arr: Uint8Array) {
  return String.fromCharCode.apply(null, [...arr]);
}

export function base64ToUint8Array(base64: string) {
  return stringToUint8Array(atob(base64));
}

export function uint8ArrayToBase64(arr: Uint8Array) {
  return btoa(uint8ArrayToString(arr));
}
// 支持中文
export function fastTextEncode(text: string) {
  return new TextEncoder().encode(text);
}

export function fastTextDecode(arr: Uint8Array) {
  return new TextDecoder().decode(arr);
}
