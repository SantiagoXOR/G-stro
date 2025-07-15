/**
 * Este servicio maneja los tokens de autenticación de forma segura.
 * Los tokens se almacenan en httpOnly cookies y nunca se exponen al JavaScript del cliente.
 */

type TokenResponse = {
  error?: string;
};

export const secureTokenService = {
  /**
   * Establece los tokens de autenticación mediante una llamada al backend
   * que los guardará en httpOnly cookies
   */
  async setTokens(tokens: { accessToken: string; refreshToken: string }): Promise<TokenResponse> {
    try {
      const response = await fetch('/api/auth/set-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokens),
        credentials: 'include', // Importante para incluir cookies
      });

      if (!response.ok) {
        throw new Error('Error setting tokens');
      }

      return {};
    } catch (error) {
      console.error('Error setting tokens:', error);
      return { error: 'Failed to set authentication tokens' };
    }
  },

  /**
   * Refresca los tokens usando una cookie httpOnly existente
   */
  async refreshTokens(): Promise<TokenResponse> {
    try {
      const response = await fetch('/api/auth/refresh-tokens', {
        credentials: 'include', // Importante para incluir cookies
      });

      if (!response.ok) {
        throw new Error('Error refreshing tokens');
      }

      return {};
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return { error: 'Failed to refresh authentication tokens' };
    }
  },

  /**
   * Elimina los tokens de autenticación
   */
  async clearTokens(): Promise<TokenResponse> {
    try {
      const response = await fetch('/api/auth/clear-tokens', {
        method: 'POST',
        credentials: 'include', // Importante para incluir cookies
      });

      if (!response.ok) {
        throw new Error('Error clearing tokens');
      }

      return {};
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return { error: 'Failed to clear authentication tokens' };
    }
  },
};
