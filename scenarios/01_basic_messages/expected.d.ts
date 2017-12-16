export namespace plain_email {

  const enum EncryptionType {
    NONE = "NONE",
    ENCRYPTED = "ENCRYPTED"
  }
  
  module Identity {
  
    module SecretKey {
    
      const enum KeyType {
        PGP = "PGP",
        OTHER = "OTHER"
      }
    
    }
    
    interface SecretKey {
      keyType: plain_email.Identity.SecretKey.KeyType
      key: string[]
    }
  
  }
  
  interface Identity {
    name: string
    email: string
  }
  
  module PlainEmail {
  
    const enum AttachmentType {
      NONE = "NONE",
      PDF = "PDF",
      ZIP = "ZIP"
    }
  
  }
  
  interface PlainEmail {
    from: plain_email.Identity
    to: plain_email.Identity[]
    bodyText: string
    attachType: plain_email.PlainEmail.AttachmentType
    encryptType: plain_email.EncryptionType
  }
  
  interface PlainEmail2 {
    from2: plain_email.Identity
    to2: plain_email.Identity
    bodyText2: string
  }

}

export namespace some {

  namespace nested {
  
    namespace html_email {
    
      interface HtmlEmail {
        plainEmail: plain_email.PlainEmail
        bodyHtml: string
      }
    
    }
  
  }

}
