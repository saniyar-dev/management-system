export type ServerActionState<T> = {
  message: string;
  success: boolean;
  data?: T;
};
