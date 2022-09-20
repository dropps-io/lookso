let RPC: string, NATIVE_TOKEN: string, API_URL: string, EXPLORER_URL: string, POST_VALIDATOR_ADDRESS: string, WEBSITE_URL: string;
switch (process.env.NEXT_PUBLIC_ENV) {
  case 'staging':

    RPC = process.env.NEXT_PUBLIC_STAGING_RPC as string;
    NATIVE_TOKEN = process.env.NEXT_PUBLIC_STAGING_NATIVE_TOKEN as string;
    API_URL = process.env.NEXT_PUBLIC_STAGING_API_URL as string;
    EXPLORER_URL = process.env.NEXT_PUBLIC_STAGING_EXPLORER_URL as string;
    POST_VALIDATOR_ADDRESS = process.env.NEXT_PUBLIC_STAGING_POST_VALIDATOR_ADDRESS as string;
    WEBSITE_URL = process.env.NEXT_PUBLIC_STAGING_WEBSITE_URL as string;

    break;
  case 'prod':

    RPC = process.env.NEXT_PUBLIC_PROD_RPC as string;
    NATIVE_TOKEN = process.env.NEXT_PUBLIC_PROD_NATIVE_TOKEN as string;
    API_URL = process.env.NEXT_PUBLIC_PROD_API_URL as string;
    EXPLORER_URL = process.env.NEXT_PUBLIC_PROD_EXPLORER_URL as string;
    POST_VALIDATOR_ADDRESS = process.env.NEXT_PUBLIC_PROD_POST_VALIDATOR_ADDRESS as string;
    WEBSITE_URL = process.env.NEXT_PUBLIC_PROD_WEBSITE_URL as string;

    break;
  default:

    RPC = process.env.NEXT_PUBLIC_RPC as string;
    NATIVE_TOKEN = process.env.NEXT_PUBLIC_NATIVE_TOKEN as string;
    API_URL = process.env.NEXT_PUBLIC_API_URL as string;
    EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL as string;
    POST_VALIDATOR_ADDRESS = process.env.NEXT_PUBLIC_POST_VALIDATOR_ADDRESS as string;
    WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL as string;

    break;
}
export {RPC, NATIVE_TOKEN, API_URL, EXPLORER_URL, POST_VALIDATOR_ADDRESS, WEBSITE_URL};
