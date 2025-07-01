export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: 'familyHead' | 'familyMember';
}
