/**
 * Interface que isola o resto do código de qual provedor de IA está em uso
 * (RF-04). Trocar de provedor deve significar criar um novo arquivo que
 * implementa `ProvedorIA`, sem tocar em código que consome a interface.
 */
export interface ProvedorIA {
  gerarConteudo(prompt: string): Promise<string>;
}
