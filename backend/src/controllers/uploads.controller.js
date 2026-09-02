import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, createProductImageUpload } from '../utils/s3.js';

export const presignProductImage = asyncHandler(async (req, res) => {
  const contentType = String(req.body?.contentType ?? '').toLowerCase();
  const size = Number(req.body?.size);

  if (!ALLOWED_IMAGE_TYPES[contentType]) {
    throw new HttpError(400, 'Images must be JPEG, PNG or WebP');
  }

  if (!Number.isFinite(size) || size <= 0) {
    throw new HttpError(400, 'The file size is missing');
  }

  if (size > MAX_IMAGE_BYTES) {
    throw new HttpError(400, 'Images must be smaller than 5 MB');
  }

  res.json({ data: await createProductImageUpload(contentType) });
});
