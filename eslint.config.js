import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
)
