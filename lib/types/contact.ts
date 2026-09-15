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

// POST /feedback body — "subject" here is the free-text email subject line
// (the form's category picker is translated to a label before sending).
export interface FeedbackRequest {
  name: string;
  email: string;
  subject: string;
  body: string;
}
