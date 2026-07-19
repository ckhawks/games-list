// Minimal ambient types for the `openid` package (callback-based, untyped upstream).
declare module "openid" {
  export class RelyingParty {
    constructor(
      returnUrl: string,
      realm: string | null,
      stateless: boolean,
      strict: boolean,
      extensions: any[]
    );
    authenticate(
      identifier: string,
      immediate: boolean,
      callback: (error: any, authUrl?: string | null) => void
    ): void;
    verifyAssertion(
      requestOrUrl: any,
      callback: (
        error: any,
        result?: { authenticated: boolean; claimedIdentifier?: string }
      ) => void
    ): void;
  }
}
