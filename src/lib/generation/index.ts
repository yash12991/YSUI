// Export all generation utilities

export {
  type TechStack,
  type ProjectFeature,
  type ProjectType,
  type ProjectConfig,
  type GenerationRequest,
  type GenerationResult,
  TECH_STACK_PRESETS,
  PROJECT_TEMPLATES,
  FEATURE_DESCRIPTIONS,
  generatePromptForPlanner,
  generatePromptForBackend,
  generatePromptForFrontend,
  validateProjectConfig,
  estimateProjectStats,
} from './types'

export { WebsiteGenerator, generateWebsite } from './generator'
