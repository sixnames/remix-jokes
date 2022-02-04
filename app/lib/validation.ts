interface ValidateFieldInterface {
  value: string;
  message: string;
  minLength: number;
}

export function validateStringField({ value, minLength, message }: ValidateFieldInterface) {
  if (value.length < minLength) {
    return message;
  }
}
