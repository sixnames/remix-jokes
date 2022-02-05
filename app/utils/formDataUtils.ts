interface GetFormDataFieldsInterface {
  formData: FormData;
  fieldName: string;
}
export function getFormDataStringField({
  formData,
  fieldName,
}: GetFormDataFieldsInterface): string {
  const field = formData.get(fieldName);
  if (!field) {
    return '';
  }
  if (typeof field !== 'string') {
    return '';
  }
  return field;
}
