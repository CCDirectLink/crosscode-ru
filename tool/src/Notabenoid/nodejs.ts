import { NotaHttpClient } from '../Notabenoid.js';
import * as request from 'request';
import { JSDOM } from 'jsdom';

export class NodejsNotaHttpClient implements NotaHttpClient {
  public async requestJSON(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<unknown> {
    return JSON.parse(await this.request(method, url, body));
  }

  public async requestDocument(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<Document> {
    return (JSDOM.fragment(await this.request(method, url, body)) as unknown) as Document;
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
