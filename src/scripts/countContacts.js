import { readContacts } from '../utils/readContacts.js';

export const countContacts = async () => {
  const contacts = await readContacts();
  const count = contacts.length;

  console.log(`Кількість контактів: ${count}`);
  return count;
};

countContacts();
