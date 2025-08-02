import { Router } from 'express';
import {
  getAllContactsController,
  getContactByIdController,
} from '../controllers/contactsController.js';

const router = Router();

router.get('/', getAllContactsController);
router.get('/:contactId', getContactByIdController);

export default router;
