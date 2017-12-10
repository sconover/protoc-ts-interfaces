declare namespace plain_email {

  interface Identity {
    name: string
    email: string
  }
  
  interface PlainEmail {
    from: plain_email.Identity
    to: plain_email.Identity
    body_text: string
  }

}
