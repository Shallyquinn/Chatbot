export interface ResponsePayload {
  step_in_flow: string;       // step is string
  response_category: string;
  response_type: string;
  question_asked:string;
  widget_used:string,
  available_options:string[],
  user_response: string,
  response_value: string,
}  
