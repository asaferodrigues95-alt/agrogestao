// Helpers genéricos de data/hora, usados por toda a camada de dados.
// Ficam em "shared" por serem utilitários sem regra de negócio (não são domínio).
export const now = (): number => Date.now();
export const todayStr = (): string => new Date().toISOString().slice(0, 10);
export const nowTimeStr = (): string => new Date().toTimeString().slice(0, 5);
