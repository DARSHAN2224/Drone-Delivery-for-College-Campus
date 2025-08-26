import { StaticPage } from '../models/staticPageModel.js';

const DEFAULT_PAGES = [
  { slug: 'about', title: 'About Us', content: '<p>About our platform.</p>' },
  { slug: 'contact', title: 'Contact', content: '<p>Contact us at support@foodcourt.com</p>' },
  { slug: 'support', title: 'Support', content: '<p>We are here to help.</p>' },
  { slug: 'terms', title: 'Terms of Service', content: '<p>Terms...</p>' },
  { slug: 'privacy', title: 'Privacy Policy', content: '<p>Privacy...</p>' },
  { slug: 'how-it-works', title: 'How It Works', content: '<p>How we work.</p>' },
  { slug: 'partner', title: 'Partner With Us', content: '<p>Join as a partner.</p>' },
];

export const seedStaticPages = async () => {
  // Only run in non-test environments
  if (process.env.DISABLE_PAGE_SEED === 'true') return;
  try {
    for (const p of DEFAULT_PAGES) {
      const exists = await StaticPage.findOne({ slug: p.slug });
      if (!exists) {
        await StaticPage.create({ ...p, published: true });
      }
    }
  } catch (err) {
    console.warn('Static page seed failed:', err?.message);
  }
};


