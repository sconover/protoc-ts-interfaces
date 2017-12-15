export namespace plain_email {

  const enum EncryptionType {
    NONE = 0,
    ENCRYPTED = 1
  }
  
  module Identity {
  
    module SecretKey {
    
      const enum KeyType {
        PGP = 0,
        OTHER = 1
      }
    
    }
    
    interface SecretKey {
      key_type: plain_email.Identity.SecretKey.KeyType
      key: string
    }
  
  }
  
  interface Identity {
    name: string
    email: string
  }
  
  module PlainEmail {
  
    const enum AttachmentType {
      NONE = 0,
      PDF = 1,
      ZIP = 2
    }
  
  }
  
  interface PlainEmail {
    from: plain_email.Identity
    to: plain_email.Identity
    body_text: string
    attach_type: plain_email.PlainEmail.AttachmentType
    encrypt_type: plain_email.EncryptionType
  }
  
  interface PlainEmail2 {
    from2: plain_email.Identity
    to2: plain_email.Identity
    body_text2: string
  }

}

export namespace some {

  namespace nested {
  
    namespace html_email {
    
      interface HtmlEmail {
        plain_email: plain_email.PlainEmail
        body_html: string
      }
    
    }
  
  }

}
