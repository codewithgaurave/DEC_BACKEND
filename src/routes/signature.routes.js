import { Router } from 'express'
import {
  getAllSignatures,
  getSignatureById,
  createSignature,
  updateSignature,
  deleteSignature,
  downloadSignatureHtml,
  previewSignatureRawHtml,
  seedInitialSignature,
} from '../controllers/signature.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Public read & download endpoints
router.get('/', getAllSignatures)
router.get('/seed', seedInitialSignature)
router.post('/seed', authenticate, seedInitialSignature)
router.get('/:id/download', downloadSignatureHtml)
router.get('/:id/preview', previewSignatureRawHtml)
router.get('/:id', getSignatureById)

// Protected CRUD operations (Requires login token)
router.post('/', authenticate, createSignature)
router.put('/:id', authenticate, updateSignature)
router.delete('/:id', authenticate, deleteSignature)

export default router
