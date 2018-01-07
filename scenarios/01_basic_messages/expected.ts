export namespace plain_email {

  export const enum EncryptionType {
    NONE = "NONE",
    ENCRYPTED = "ENCRYPTED"
  }

  export module Identity {

    export module SecretKey {

      export const enum KeyType {
        PGP = "PGP",
        OTHER = "OTHER"
      }

    }

    export interface SecretKey {
      keyType: plain_email.Identity.SecretKey.KeyType
      key: string[]
    }

  }

  export interface Identity {
    name: string
    email: string
    facebook?: string
    twitter?: string
  }

  export module PlainEmail {

    export const enum AttachmentType {
      NONE = "NONE",
      PDF = "PDF",
      ZIP = "ZIP"
    }

  }

  export interface PlainEmail {
    from: plain_email.Identity
    to: plain_email.Identity[]
    bodyText: string
    attachType: plain_email.PlainEmail.AttachmentType
    encryptType: plain_email.EncryptionType
  }

  export interface PlainEmail2 {
    from2: plain_email.Identity
    to2: plain_email.Identity
    bodyText2: string
  }

}

export namespace some {

  export namespace nested {

    export namespace html_email {

      export interface HtmlEmail {
        plainEmail: plain_email.PlainEmail
        bodyHtml: string
      }

    }

  }

}
