export async function fetchDocument(url: string): Promise<Document> {
  console.log('fetching document:', url);

  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'document';
  await new Promise((resolve, reject) => {
    xhr.onload = resolve;
    xhr.onerror = reject;
    xhr.send();
  });
  let doc = xhr.responseXML;
  if (doc == null) {
    throw new Error('xhr.responseXML is null');
  }
  return doc;

  // let response = await fetch(url);
  // let parser = new DOMParser();
  // return parser.parseFromString(await response.text(), 'text/html');
}
