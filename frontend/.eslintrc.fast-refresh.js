/**
 * Reglas de ESLint específicas para prevenir errores de Fast Refresh
 * Estas reglas ayudan a mantener un entorno de desarrollo estable
 */

module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Reglas específicas para Fast Refresh
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    
    // Prevenir dependencias circulares en hooks
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="useCallback"] Property[key.name="signOut"]',
        message: 'Evita incluir signOut en las dependencias de useCallback para prevenir dependencias circulares'
      },
      {
        selector: 'CallExpression[callee.name="useEffect"] Property[key.name="user"]:not(Property[key.name="user"] Property[key.name="id"])',
        message: 'Usa user?.id en lugar del objeto user completo en las dependencias de useEffect'
      }
    ],

    // Advertir sobre funciones no memoizadas en dependencias
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useCustomEffect|useAsyncEffect)'
      }
    ],

    // Prevenir re-renders innecesarios
    'react/jsx-no-bind': [
      'warn',
      {
        allowArrowFunctions: false,
        allowBind: false,
        allowFunctions: false
      }
    ],

    // Asegurar keys únicas en listas
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true
      }
    ],

    // Prevenir mutaciones directas de estado
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['draft'] // Para immer
      }
    ],

    // Advertir sobre console.log en producción
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error', 'info']
      }
    ],

    // Prevenir imports dinámicos problemáticos
    'import/no-dynamic-require': 'error',
    
    // Asegurar que los componentes tengan nombres válidos
    'react/display-name': 'error',

    // Prevenir uso de índices como keys
    'react/no-array-index-key': 'warn',

    // Advertir sobre efectos sin cleanup
    'react-hooks/exhaustive-deps': [
      'error',
      {
        enableDangerousAutofixThisMayCauseInfiniteLoops: false
      }
    ]
  },

  // Configuración específica para archivos de desarrollo
  overrides: [
    {
      files: ['**/*.dev.tsx', '**/*.dev.ts', '**/dev/**/*'],
      rules: {
        'no-console': 'off',
        'react-hooks/exhaustive-deps': 'warn'
      }
    },
    {
      files: ['**/*.test.tsx', '**/*.test.ts', '**/*.spec.tsx', '**/*.spec.ts'],
      rules: {
        'react-hooks/exhaustive-deps': 'off',
        'no-console': 'off'
      }
    }
  ],

  // Configuración del parser
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },

  // Variables globales para desarrollo
  globals: {
    __DEV__: 'readonly',
    __FAST_REFRESH__: 'readonly'
  },

  // Configuración de entornos
  env: {
    browser: true,
    es2022: true,
    node: true
  }
};
