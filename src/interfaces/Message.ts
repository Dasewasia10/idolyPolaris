interface ReplyReference {
  id: number;
  text: string;
  name: string;
}

export interface Message {
  id: number;
  text: string;
  name: string;
  icon: string;
  position: "left" | "right";
  stamp?: string;
  replyTo?: ReplyReference;
  isCall?: boolean;
  callDuration?: string;
  callBgColor?: string;
  callIconColor?: string;
  reactions?: {
    [emoji: string]: string[];
  };
  image?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
}
