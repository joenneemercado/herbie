import { SetMetadata } from '@nestjs/common';

export type Scope = {
  scopes: string[];
  ownerParam?: string;
};

// export const AuthScope = ({
//   scopes,
// }: {
//   scopes: string[];
//   ownerParam?: string;
// }) => {
//   console.log(scopes);
//   // Normaliza os escopos para remover espaços e converte para lowercase
//   const normalizedScopes = scopes.map((scope) => scope.trim().toLowerCase());
//   console.log(normalizedScopes);
//   return SetMetadata('authScope', normalizedScopes);
// };

export const AuthScope = (scope: { scopes: string[]; ownerParam?: string }) => {
  return SetMetadata('authScope', scope);
};
