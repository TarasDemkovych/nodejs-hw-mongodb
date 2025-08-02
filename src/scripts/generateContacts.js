import { createFakeContact } from '../utils/createFakeContact.js';
import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const generateContacts = async (n) => {
  const existingContacts = await readContacts();
  const newContacts = [];

  for (let i = 0; i < n; i++) {
    const newContact = createFakeContact();
    console.log(`Додано новий контакт:`, newContact);
    newContacts.push(newContact);
  }

  const updatedContacts = [...existingContacts, ...newContacts];
  await writeContacts(updatedContacts);

  console.log(`Успішно додано ${n} контакт(ів). Всього зараз: ${updatedContacts.length}`);
};

const countArg = parseInt(process.argv[2], 10) || 5;
generateContacts(countArg);
