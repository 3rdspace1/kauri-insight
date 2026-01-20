/**
 * Advanced Prompting Engine for Nano Banana Pro
 *
 * Research-backed, expert-crafted prompts for survey data visualization
 * and business intelligence imagery. Leverages cutting-edge understanding
 * of visual language, data storytelling, and professional design principles.
 */

/**
 * Visual Language Principles for Survey Data
 *
 * Based on research from:
 * - Edward Tufte's principles of analytical design
 * - Stephen Few's data visualization best practices
 * - Gestalt psychology of visual perception
 * - Color theory in business communication
 */

interface VisualContext {
  industry: string
  sentiment: 'positive' | 'neutral' | 'negative'
  dataType?: 'quantitative' | 'qualitative' | 'temporal' | 'categorical'
  purpose?: 'executive' | 'analytical' | 'storytelling' | 'diagnostic'
  audience?: 'technical' | 'executive' | 'general'
}

interface EnhancedPromptOptions {
  context: VisualContext
  customElements?: string[]
  brandColors?: string[]
  emphasizeDataIntegrity?: boolean
}

/**
 * Industry-Specific Visual Languages
 *
 * Each industry has established visual conventions that
 * enhance comprehension and trust
 */
const INDUSTRY_VISUAL_LANGUAGES = {
  Healthcare: {
    colorPalette: 'medical blue, healthcare teal, clinical white, sterile grays',
    visualMotifs: 'heartbeat lines, cellular patterns, care icons, wellness curves',
    designApproach: 'clean, trustworthy, empathetic, evidence-based',
    dataStyle: 'clinical precision, outcome-focused, patient-centered',
    composition: 'organized hierarchy, clear pathways, calming symmetry',
    textureStyle: 'smooth gradients, soft edges, gentle transitions',
  },
  Technology: {
    colorPalette: 'electric blue, neon cyan, deep purples, digital oranges',
    visualMotifs: 'circuit patterns, data streams, network nodes, binary aesthetics',
    designApproach: 'cutting-edge, innovative, dynamic, forward-thinking',
    dataStyle: 'real-time metrics, performance-driven, algorithmic precision',
    composition: 'asymmetric balance, flowing connections, layered depth',
    textureStyle: 'holographic effects, digital particles, light trails',
  },
  Finance: {
    colorPalette: 'corporate navy, trust blue, wealth gold, conservative grays',
    visualMotifs: 'growth arrows, market trends, stability anchors, value shields',
    designApproach: 'professional, trustworthy, sophisticated, data-driven',
    dataStyle: 'quantitative precision, trend analysis, risk-aware visualization',
    composition: 'structured grids, balanced proportions, hierarchical clarity',
    textureStyle: 'subtle textures, premium finishes, confident gradients',
  },
  Retail: {
    colorPalette: 'vibrant reds, shopping oranges, consumer purples, cart greens',
    visualMotifs: 'shopping paths, customer journeys, product flows, satisfaction curves',
    designApproach: 'approachable, energetic, customer-centric, conversion-focused',
    dataStyle: 'behavior metrics, satisfaction scores, purchase patterns',
    composition: 'welcoming layouts, eye-level focus, action-oriented',
    textureStyle: 'warm gradients, inviting softness, energetic contrasts',
  },
  Education: {
    colorPalette: 'academic blue, learning green, achievement gold, knowledge purples',
    visualMotifs: 'growth curves, learning paths, knowledge trees, progression steps',
    designApproach: 'inspiring, accessible, developmental, achievement-focused',
    dataStyle: 'progress tracking, outcome measurement, engagement metrics',
    composition: 'progressive layouts, milestone markers, journey flows',
    textureStyle: 'encouraging gradients, optimistic brightness, clear pathways',
  },
  Hospitality: {
    colorPalette: 'warm earth tones, experience golds, service blues, comfort beiges',
    visualMotifs: 'service curves, experience journeys, satisfaction waves, comfort elements',
    designApproach: 'welcoming, premium, experience-focused, guest-centric',
    dataStyle: 'satisfaction metrics, experience ratings, service quality',
    composition: 'inviting layouts, experiential flows, comfort-driven spacing',
    textureStyle: 'luxurious textures, warm gradients, premium finishes',
  },
  'Real Estate': {
    colorPalette: 'property blues, market greens, investment golds, foundation grays',
    visualMotifs: 'building blocks, property lines, growth foundations, market indicators',
    designApproach: 'solid, trustworthy, investment-focused, market-aware',
    dataStyle: 'market trends, property metrics, investment indicators',
    composition: 'foundational structures, stable grids, growth directions',
    textureStyle: 'architectural lines, solid textures, material finishes',
  },
  Consulting: {
    colorPalette: 'strategic blue, insight purple, advisor navy, clarity white',
    visualMotifs: 'strategic frameworks, insight diamonds, solution paths, value chains',
    designApproach: 'authoritative, insightful, solution-oriented, strategic',
    dataStyle: 'strategic insights, performance frameworks, outcome modeling',
    composition: 'framework-based, systematic layouts, insight hierarchy',
    textureStyle: 'professional polish, confident gradients, executive quality',
  },
}

/**
 * Sentiment-Based Visual Strategies
 *
 * Research shows specific visual elements trigger emotional responses
 * that align with sentiment communication
 */
const SENTIMENT_VISUAL_STRATEGIES = {
  positive: {
    colorPsychology: 'vibrant greens (growth), energetic blues (trust), optimistic yellows (happiness)',
    composition: 'upward trajectories, expanding forms, open spaces, ascending diagonals',
    lighting: 'bright, warm, front-lit, radiating luminosity',
    shapes: 'rounded corners, flowing curves, organic forms, expanding circles',
    energy: 'dynamic movement, forward momentum, celebratory patterns',
    depth: 'expansive perspective, open horizons, unlimited potential',
    texture: 'smooth, polished, crystalline clarity, radiant gradients',
  },
  neutral: {
    colorPsychology: 'balanced blues (stability), professional grays (objectivity), measured teals (clarity)',
    composition: 'centered balance, symmetric arrangements, equilibrium points, horizontal stability',
    lighting: 'even, diffused, balanced shadows, neutral temperature',
    shapes: 'geometric precision, structured forms, balanced proportions, clear lines',
    energy: 'steady flow, measured pace, consistent rhythm',
    depth: 'controlled perspective, organized layers, methodical depth',
    texture: 'matte finishes, uniform surfaces, professional polish',
  },
  negative: {
    colorPsychology: 'alerting oranges (urgency), critical reds (attention), cautionary yellows (warning)',
    composition: 'attention-grabbing focal points, diagonal tensions, concentrated areas, urgent asymmetry',
    lighting: 'focused spotlighting, dramatic contrasts, shadow emphasis',
    shapes: 'sharp angles, pointed markers, angular warnings, concentrated areas',
    energy: 'contained intensity, focused urgency, directed attention',
    depth: 'compressed perspective, near-field focus, immediate presence',
    texture: 'tactile urgency, dimensional emphasis, alert gradients',
  },
}

/**
 * Data Visualization Visual Language
 *
 * Modern data visualization principles for abstract representations
 */
const DATA_VIZ_ELEMENTS = {
  quantitative: {
    forms: 'bar lengths, circle sizes, area scales, linear progressions',
    metaphors: 'mountains of data, rivers of information, forests of variables',
    precision: 'grid-aligned, scale-conscious, proportion-accurate',
  },
  qualitative: {
    forms: 'color categories, shape variations, texture distinctions',
    metaphors: 'color spectrums, pattern diversity, categorical landscapes',
    precision: 'distinct groupings, clear separations, categorical clarity',
  },
  temporal: {
    forms: 'flowing timelines, progressive sequences, rhythmic patterns',
    metaphors: 'time rivers, progression paths, evolution flows',
    precision: 'sequential accuracy, temporal rhythm, chronological flow',
  },
  categorical: {
    forms: 'grouped clusters, segmented regions, classified zones',
    metaphors: 'organized territories, classified landscapes, sorted domains',
    precision: 'clear boundaries, distinct categories, organized spaces',
  },
}

/**
 * Generate expert-level prompt for Nano Banana Pro
 */
export function generateExpertPrompt(options: EnhancedPromptOptions): string {
  const { context } = options
  const industry = INDUSTRY_VISUAL_LANGUAGES[context.industry as keyof typeof INDUSTRY_VISUAL_LANGUAGES]
    || INDUSTRY_VISUAL_LANGUAGES.Technology
  const sentiment = SENTIMENT_VISUAL_STRATEGIES[context.sentiment]
  const dataViz = context.dataType ? DATA_VIZ_ELEMENTS[context.dataType] : null

  // Build comprehensive prompt using research-backed principles
  const promptSections: string[] = []

  // 1. Core Subject & Purpose
  promptSections.push(
    `Professional survey data visualization cover for ${context.industry} industry.`
  )

  // 2. Industry-Specific Visual Language
  promptSections.push(
    `Visual style: ${industry.designApproach}.`,
    `Color palette: ${industry.colorPalette}.`,
    `Visual motifs: ${industry.visualMotifs}.`,
    `Data representation: ${industry.dataStyle}.`
  )

  // 3. Sentiment-Driven Composition
  promptSections.push(
    `Emotional tone: ${sentiment.colorPsychology}.`,
    `Composition strategy: ${sentiment.composition}.`,
    `Lighting approach: ${sentiment.lighting}.`,
    `Shape language: ${sentiment.shapes}.`,
    `Visual energy: ${sentiment.energy}.`
  )

  // 4. Data Visualization Elements
  if (dataViz) {
    promptSections.push(
      `Data forms: ${dataViz.forms}.`,
      `Visual metaphors: ${dataViz.metaphors}.`,
      `Precision approach: ${dataViz.precision}.`
    )
  }

  // 5. Technical Excellence
  promptSections.push(
    `Composition: ${industry.composition}.`,
    `Texture: ${industry.textureStyle}.`,
    `Depth: ${sentiment.depth}.`
  )

  // 6. Custom Elements
  if (options.customElements && options.customElements.length > 0) {
    promptSections.push(
      `Additional elements: ${options.customElements.join(', ')}.`
    )
  }

  // 7. Brand Colors
  if (options.brandColors && options.brandColors.length > 0) {
    promptSections.push(
      `Brand colors to integrate: ${options.brandColors.join(', ')}.`
    )
  }

  // 8. Quality & Professional Standards
  promptSections.push(
    'Quality standards: 4K ultra-high definition, professional photography quality, award-winning composition.',
    'Technical execution: perfect lighting balance, color theory mastery, golden ratio composition.',
    'Visual hierarchy: clear focal points, guided eye movement, balanced information density.',
    'Professional finish: print-ready quality, executive presentation standard, breathtaking depth.'
  )

  // 9. Data Integrity Emphasis
  if (options.emphasizeDataIntegrity) {
    promptSections.push(
      'Data integrity focus: truthful representation, unbiased visualization, ethical design principles.'
    )
  }

  return promptSections.join(' ')
}

/**
 * Generate negative prompt to avoid common pitfalls
 */
export function generateExpertNegativePrompt(context: VisualContext): string {
  const avoidances: string[] = [
    // Text avoidance (AI struggles with text)
    'text', 'words', 'letters', 'numbers', 'labels', 'typography', 'writing',

    // Human elements (unless specifically needed)
    'people', 'faces', 'hands', 'human figures', 'portraits',

    // Logo/brand elements (handled separately)
    'logos', 'trademarks', 'watermarks', 'signatures',

    // Quality issues
    'blurry', 'low quality', 'pixelated', 'jpeg artifacts', 'compression',
    'grainy', 'noisy', 'distorted', 'warped', 'corrupted',

    // Inappropriate styles
    'cartoon', 'anime', 'sketch', 'doodle', 'clip art',
    'amateur', 'unprofessional', 'childish', 'simplistic',

    // Composition issues
    'cluttered', 'chaotic', 'messy', 'disorganized', 'confusing',
    'unbalanced', 'asymmetric chaos', 'overwhelming',

    // Lighting issues
    'overexposed', 'underexposed', 'harsh shadows', 'flat lighting',

    // Color issues
    'oversaturated', 'washed out', 'muddy colors', 'garish',
  ]

  // Industry-specific avoidances
  const industryAvoidances: Record<string, string[]> = {
    Healthcare: ['disturbing', 'medical gore', 'painful imagery', 'disease'],
    Finance: ['unstable', 'risky', 'gambling', 'uncertain'],
    Education: ['failure', 'struggle', 'difficulty', 'frustration'],
    Retail: ['empty', 'abandoned', 'closing', 'declining'],
  }

  if (context.industry in industryAvoidances) {
    avoidances.push(...industryAvoidances[context.industry])
  }

  return avoidances.join(', ')
}

/**
 * Generate complete prompt package for Nano Banana Pro
 */
export function generateNanaBananaPrompt(
  baseDescription: string,
  options: EnhancedPromptOptions
): {
  prompt: string
  negativePrompt: string
  technicalParams: {
    width: number
    height: number
    aspectRatio: string
    numInferenceSteps: number
    guidanceScale: number
  }
} {
  // Combine base description with expert prompt
  const expertPrompt = generateExpertPrompt(options)
  const fullPrompt = `${baseDescription}. ${expertPrompt}`

  const negativePrompt = generateExpertNegativePrompt(options.context)

  // Optimize technical parameters based on context
  const technicalParams = {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    numInferenceSteps: options.emphasizeDataIntegrity ? 40 : 30, // More steps for precision
    guidanceScale: options.context.purpose === 'executive' ? 8.5 : 7.5, // Higher for polish
  }

  return {
    prompt: fullPrompt,
    negativePrompt,
    technicalParams,
  }
}

/**
 * Preset prompt templates for common scenarios
 */
export const EXPERT_PRESETS = {
  surveyReportCover: (industry: string, sentiment: 'positive' | 'neutral' | 'negative') =>
    generateNanaBananaPrompt(
      'Breathtaking survey data visualization cover image',
      {
        context: {
          industry,
          sentiment,
          dataType: 'categorical',
          purpose: 'executive',
          audience: 'executive',
        },
        emphasizeDataIntegrity: true,
      }
    ),

  insightVisualization: (insightTitle: string, industry: string, sentiment: 'positive' | 'neutral' | 'negative') =>
    generateNanaBananaPrompt(
      `Abstract visual metaphor for "${insightTitle}"`,
      {
        context: {
          industry,
          sentiment,
          dataType: 'qualitative',
          purpose: 'storytelling',
          audience: 'general',
        },
      }
    ),

  executiveDashboard: (industry: string) =>
    generateNanaBananaPrompt(
      'Executive dashboard visualization background',
      {
        context: {
          industry,
          sentiment: 'neutral',
          dataType: 'quantitative',
          purpose: 'analytical',
          audience: 'executive',
        },
        emphasizeDataIntegrity: true,
      }
    ),

  dataInfographic: (topic: string, industry: string) =>
    generateNanaBananaPrompt(
      `Professional infographic visualization about ${topic}`,
      {
        context: {
          industry,
          sentiment: 'neutral',
          dataType: 'categorical',
          purpose: 'analytical',
          audience: 'technical',
        },
        customElements: ['data points', 'statistical indicators', 'metric visualizations'],
      }
    ),
}
