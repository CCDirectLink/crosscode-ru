import { NotaHttpClient } from '../Notabenoid.js';
import * as request from 'request';
import { JSDOM } from 'jsdom';

export class NodejsNotaHttpClient implements NotaHttpClient {
  public async requestJSON<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<T> {
    return JSON.parse(await this.request(method, url, body));
  }

  public async requestDocument(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<DocumentFragment> {
    return JSDOM.fragment(await this.request(method, url, body));
  }

  protected async request(
    method: 'GET' | 'POST',
    url: string,
    body: Record<string, string> | null | undefined,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      request(
        {
          method,
          url,
          formData: body ?? undefined, // eslint-disable-line no-undefined
          jar: true,
          followRedirect: true,
          followAllRedirects: true, // needed for authenication
          followOriginalHttpMethod: true,
          gzip: true,
        },
        (error: unknown, _response: request.Response, body: unknown) => {
          if (error != null) {
            reject(error);
            return;
          }
          if (!(typeof body === 'string')) {
            throw new Error("Assertion failed: typeof body === 'string'");
          }
          resolve(body);
        },
      );
    });
  }
}
