export function fetchDocument(url: URL | string): Promise<Document> {
  return new Promise((resolve, reject) => {
    let urlStr = url.toString();
    console.log('fetching document:', urlStr);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', urlStr);
    xhr.responseType = 'document';

    xhr.onload = (): void => {
      if (200 <= xhr.status && xhr.status < 300) {
        let doc = xhr.responseXML;
        if (doc == null) reject(new Error('responseXML is null'));
        else resolve(doc);
      } else {
        reject(new Error(`HTTP error: ${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = (): void => {
      reject(new Error('network error'));
    };
    xhr.ontimeout = (): void => {
      reject(new Error('timeout'));
    };

    xhr.send();
  });
}
