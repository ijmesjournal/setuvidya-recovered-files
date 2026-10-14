import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// No persistent cache or Cloudflare resources are needed for this local test.
export default defineCloudflareConfig();
