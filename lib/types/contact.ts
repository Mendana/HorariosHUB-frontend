export type ContactFormSubject = 
  | 'bug' 
  | 'suggestion' 
  | 'schedule_issue' 
  | 'other';

export interface ContactForm {
  name: string;
  email: string;
  subject: ContactFormSubject;
  message: string;
}
