export const sanitizeText = (value: string) => value.replace(/[<>]/g, '').trim();
export const sanitizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);
