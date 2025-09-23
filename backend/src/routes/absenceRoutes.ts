import express from 'express';
import { createAbsence, getAbsences, updateAbsenceStatus } from '../controllers/absenceController.js';

const router = express.Router();

// Luo uusi poissaolo
router.post('/absences', createAbsence);

// Hae kaikki poissaolot
router.get('/absences', getAbsences);

// Päivitä poissaolon tila
router.patch('/absences/:id', updateAbsenceStatus);

export default router;
