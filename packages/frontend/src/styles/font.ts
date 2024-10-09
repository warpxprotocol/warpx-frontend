import { Albert_Sans, Unbounded } from 'next/font/google';

export const unbounded = Unbounded({
  preload: true,
  display: 'block',
  style: ['normal'],
  subsets: ['latin'],
});

export const albertSans = Albert_Sans({
  subsets: ['latin'],
  style: 'normal',
  weight: 'variable',
});
