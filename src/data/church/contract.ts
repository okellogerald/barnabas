import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { churchSchema } from './schema';

const c = initContract();

export const churchContract = c.router({
  getCurrentChurch: {
    method: 'GET',
    path: '/church/me',
    responses: {
      200: churchSchema,
      401: z.null(),
    },
    summary: 'Get current user\'s church',
  }
});