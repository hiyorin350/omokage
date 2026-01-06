export type Step = 1 | 2 | 3 | 4;

export type FormState = {
  gender: 'male' | 'female' | null;
  hair: string;
  age: number;
  similarTo: string;
  features: string;
};

export type UpdateField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
