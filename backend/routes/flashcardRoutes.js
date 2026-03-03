import express from 'express';

import {getflashcards,getAllFlashcardSets,reviewFlashcard,toggleStarFlashcard,deleteFlashcardSet} from
'../controllers/flashcardController.js'
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/',getAllFlashcardSets);
router.get('/:documentId',getflashcards);
router.post('/:cardid/review',reviewFlashcard);
router.put('/:cardId/star',toggleStarFlashcard);
router.delete('/:id',deleteFlashcardSet);

export default router;