import { WebPlugin } from "@capacitor/core";

import {
  SignInWithApplePlugin,
  InitOptions,
  SignInResponse,
  SignInError,
} from "./definitions";

declare var window: any;

export class SignInWithAppleWeb extends WebPlugin
  implements SignInWithApplePlugin {
  hasInitialized = false;

  constructor() {
    super({
      name: "SignInWithApple",
      platforms: ["web"],
    });
  }

  async Init(options: InitOptions): Promise<void> {
    this.loadAppleScript(() => {
      if (window && window.AppleID && !this.hasInitialized) {
        const { clientId, scope, redirectURI, state, usePopup } = options;

        window.AppleID.auth.init({
          clientId: clientId,
          scope: scope,
          redirectURI: redirectURI,
          state: state,
          usePopup: usePopup !== undefined ? usePopup : false,
        });

        this.hasInitialized = true;
      }
    });
  }

  Authorize(): Promise<SignInResponse> {
    return new Promise<SignInResponse>(async (resolve, reject) => {
      const buildReject = (error: string) => reject({ error } as SignInError);

      if (window && !window.AppleID) {
        buildReject("Cannot find AppleID instance");
      }

      if (!this.hasInitialized) {
        buildReject("AppleID has not yet initialized");
      }

      try {
        const response: SignInResponse = await window.AppleID.auth.signIn();
        resolve(response);
      } catch (error) {
        reject(error as SignInError);
      }
    });
  }

  private loadAppleScript(callback: any) {
    if (window && window.AppleID) {
      return callback();
    }

    const file = document.createElement("script");
    file.setAttribute("type", "text/javascript");
    file.setAttribute(
      "src",
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
    );
    file.addEventListener("load", callback);
    document.getElementsByTagName("head")[0].appendChild(file);
  }
}

const SignInWithApple = new SignInWithAppleWeb();

export { SignInWithApple };

import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(SignInWithApple);
