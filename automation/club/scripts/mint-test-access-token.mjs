/**
 * QA-only: mints one signed access token locally, exactly the way the
 * (not-yet-live) WordPress club-access-route.php snippet will, so the
 * bridge-server side of the account-gating flow can be exercised in a
 * browser before that snippet is pasted live. Uses the SAME Node module
 * bridge-server.mjs verifies against, so there is no risk of drift between
 * "what this prints" and "what the server accepts" the way there would be
 * with two hand-written implementations.
 *
 * Never share the printed URL outside this machine -- treat it like a
 * password for the lifetime of the token (default 60 minutes).
 *
 * Usage: node automation/club/scripts/mint-test-access-token.mjs [customerId] [email]
 */
import 'dotenv/config';
import { signAccessToken } from '../lib/club-access-token.mjs';

const customerId = Number(process.argv[2] || 9001);
const email = process.argv[3] || 'club-qa-account-test@scrollyseo.com';

const token = signAccessToken({ customerId, email });
console.log(`http://localhost:${process.env.BRIDGE_PORT || 5679}/club?token=${token}`);
