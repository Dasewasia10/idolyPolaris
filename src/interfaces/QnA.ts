export interface QnA {
    question: string;
    reply: string;
    voice: string;
  }
  
export interface QnASource {
  name: string;
  data: QnA[];
}