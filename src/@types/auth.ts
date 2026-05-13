
export type VerifyOtpProps = {
  otp: string;
  userId: string|number;
  deviceId: string
};

export interface ResendOtpProps{
  userId: number|number;
  deviceId: string
}