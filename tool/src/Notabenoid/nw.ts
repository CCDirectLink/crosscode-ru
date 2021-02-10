import { NotaHttpClient } from '../Notabenoid.js';

export class NwNotaHttpClient implements NotaHttpClient {
  public async requestJSON(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<unknown> {
    let res = await fetch(url, { method, body: bodyToFormData(body), credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    return await res.json();
  }

  public requestDocument(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<Document> {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = 'document';

      xhr.onload = () => {
        if (!(200 <= xhr.status && xhr.status < 300)) {
          reject(new Error(`HTTP error: ${xhr.status} ${xhr.statusText}`));
          return;
        }
        let doc = xhr.responseXML;
        if (doc == null) {
          reject(new Error('responseXML is null'));
          return;
        }
        resolve(doc);
      };
      xhr.onerror = () => {
        reject(new Error('Network error'));
      };
      xhr.ontimeout = () => {
        reject(new Error('Timeout'));
      };

      xhr.send(bodyToFormData(body));
    });
  }
}

function bodyToFormData(body?: Record<string, string> | null): FormData | null {
  if (body == null) return null;
  let formData = new FormData();
  for (let [k, v] of Object.entries(body)) {
    formData.append(k, v);
  }
  return formData;
}
