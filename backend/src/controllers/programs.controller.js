import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { Program } from '../models/index.js';

const FIELDS = ['id', 'name', 'slug', 'tagline', 'label', 'highlights', 'description', 'coverImage', 'status'];

export const list = asyncHandler(async (req, res) => {
  const data = await Program.findAll({
    attributes: FIELDS,
    order: [
      ['sortOrder', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  res.json({ data });
});

export const detail = asyncHandler(async (req, res) => {
  const program = await Program.findOne({
    where: { slug: req.params.slug },
    attributes: FIELDS,
  });

  if (!program) throw new HttpError(404, 'Program not found');

  res.json({ data: program });
});
