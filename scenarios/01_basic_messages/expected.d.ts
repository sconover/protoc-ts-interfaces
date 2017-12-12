declare namespace plain_email {

  const enum AttachmentType {
    NONE = 0,
    PDF = 1,
    ZIP = 2
  }
  
  const enum EncryptionType {
    NONE = 0,
    ENCRYPTED = 1
  }
  
  interface Identity {
    name: string
    email: string
  }
  
  interface PlainEmail {
    from: Identity
    to: Identity
    body_text: string
    attach_type: AttachmentType
    encrypt_type: EncryptionType
  }

}

declare namespace some {

  namespace nested {
  
    namespace html_email {
    
      interface HtmlEmail {
        plain_email: plain_email.PlainEmail
        body_html: string
      }
    
    }
  
  }

}
