import { NotaClient } from './Notabenoid';
import { NodejsNotaHttpClient } from './Notabenoid/nodejs';

async function main(): Promise<void> {
  let notaClient = new NotaClient(new NodejsNotaHttpClient());
  await notaClient.login('username', 'password');
  console.log(await notaClient.fetchAllChapterStatuses());
}

void main();
