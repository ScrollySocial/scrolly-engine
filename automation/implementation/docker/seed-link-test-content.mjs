import 'dotenv/config';
import { getContent, setContent } from '../lib/cms-adapter.mjs';

const aboutContent =
  '<p>Mulberry Creek is a family-owned nursery and landscaping business serving Wills Point, Texas and the surrounding area. We offer a wide selection of native and adapted plants, trees, and shrubs suited to the East Texas climate. In addition to our retail nursery, we provide full landscape design and installation services for homeowners and businesses.</p>';

const landscapeContent =
  '<p>Our landscape design team works with you to create a custom outdoor space that fits your property and budget. From initial concept through installation, we handle every step of the process. Many of our design projects begin with plants sourced directly from our own nursery, ensuring healthy, locally-adapted stock for every job.</p>';

const aboutTask = { targetObjectType: 'page', targetObjectId: 10 };
const landscapeTask = { targetObjectType: 'page', targetObjectId: 18 };

await setContent(aboutTask, aboutContent);
await setContent(landscapeTask, landscapeContent);

console.log('page 10 content:', await getContent(aboutTask));
console.log('page 18 content:', await getContent(landscapeTask));
