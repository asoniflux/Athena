import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding prompt templates...')

  const templates = [
    {
      name: 'LinkedIn Hook Generator',
      description: 'Generate compelling LinkedIn post hooks',
      category: 'Content',
      prompt: 'Generate 5 compelling LinkedIn post hooks about {{topic}} targeting {{audience}}. Each hook should be under 2 lines and create curiosity or controversy.',
      variables: JSON.stringify([
        { name: 'topic', description: 'The topic to write about' },
        { name: 'audience', description: 'Target audience for the post' },
      ]),
    },
    {
      name: 'Blog Outline Builder',
      description: 'Create detailed blog post outlines with SEO structure',
      category: 'Content',
      prompt: 'Create a detailed blog outline about {{topic}} for {{audience}}. Include: SEO-friendly title (3 options), meta description, H2 sections with H3 subsections, key points per section, CTA.',
      variables: JSON.stringify([
        { name: 'topic', description: 'Blog topic' },
        { name: 'audience', description: 'Target reader audience' },
      ]),
    },
    {
      name: 'Instagram Caption',
      description: 'Write engaging Instagram captions with hashtags',
      category: 'Content',
      prompt: 'Write an Instagram caption for a post about {{topic}}. Include: attention-grabbing first line, value or story in the body, clear CTA, 20 relevant hashtags sorted by reach.',
      variables: JSON.stringify([
        { name: 'topic', description: 'Post topic' },
      ]),
    },
    {
      name: 'YouTube Script',
      description: 'Write structured YouTube video scripts',
      category: 'Content',
      prompt: 'Write a YouTube video script about {{topic}} ({{duration}} minutes). Structure: hook (first 30 sec), intro, {{chapters}} main chapters with transitions, outro with CTA, end screen prompt.',
      variables: JSON.stringify([
        { name: 'topic', description: 'Video topic' },
        { name: 'duration', description: 'Video duration in minutes' },
        { name: 'chapters', description: 'Number of main chapters' },
      ]),
    },
    {
      name: 'Expand Text',
      description: 'Expand text with more detail and examples',
      category: 'Writing',
      prompt: 'Expand the following text with more detail, examples, and depth while maintaining the same tone and style:\n\n{{text}}',
      variables: JSON.stringify([
        { name: 'text', description: 'Text to expand' },
      ]),
    },
    {
      name: 'Summarize',
      description: 'Summarize text to key points',
      category: 'Writing',
      prompt: 'Summarize the following text in {{length}} sentences. Capture the key points and main argument:\n\n{{text}}',
      variables: JSON.stringify([
        { name: 'text', description: 'Text to summarize' },
        { name: 'length', description: 'Number of sentences' },
      ]),
    },
    {
      name: 'Rewrite',
      description: 'Rewrite text in a different tone',
      category: 'Writing',
      prompt: 'Rewrite the following text to be more {{tone}} (professional/casual/persuasive/concise):\n\n{{text}}',
      variables: JSON.stringify([
        { name: 'text', description: 'Text to rewrite' },
        { name: 'tone', description: 'Desired tone: professional, casual, persuasive, or concise' },
      ]),
    },
    {
      name: 'SWOT Analysis',
      description: 'Perform a SWOT analysis',
      category: 'Analysis',
      prompt: 'Perform a SWOT analysis for {{subject}}. Provide 3-5 bullet points for each: Strengths, Weaknesses, Opportunities, Threats. Be specific and actionable.',
      variables: JSON.stringify([
        { name: 'subject', description: 'Subject to analyze' },
      ]),
    },
    {
      name: 'Decision Matrix',
      description: 'Compare options with a decision matrix',
      category: 'Analysis',
      prompt: 'Help me decide between {{options}}. For each option, rate on: {{criteria}} (1-10 scale). Show a comparison table and give a final recommendation with reasoning.',
      variables: JSON.stringify([
        { name: 'options', description: 'Options to compare (comma separated)' },
        { name: 'criteria', description: 'Evaluation criteria (comma separated)' },
      ]),
    },
    {
      name: 'Task Breakdown',
      description: 'Break down a goal into actionable tasks',
      category: 'Planning',
      prompt: 'Break down the following goal into actionable tasks: {{goal}}. For each task provide: title, estimated time, priority (P1-P4), and any dependencies.',
      variables: JSON.stringify([
        { name: 'goal', description: 'The goal to break down' },
      ]),
    },
    {
      name: 'Weekly Review',
      description: 'Generate a weekly review with insights',
      category: 'Planning',
      prompt: 'Based on these completed tasks: {{completed}} and these incomplete tasks: {{incomplete}}, generate a weekly review with: wins, areas for improvement, priorities for next week, and one motivational insight.',
      variables: JSON.stringify([
        { name: 'completed', description: 'List of completed tasks' },
        { name: 'incomplete', description: 'List of incomplete tasks' },
      ]),
    },
    {
      name: 'Idea Expander',
      description: 'Expand a rough idea into a detailed concept',
      category: 'Brainstorm',
      prompt: 'Take this rough idea and expand it: {{idea}}. Provide: detailed description (2 paragraphs), target audience, revenue model, 3 key challenges, 3 first steps, similar existing solutions, and what makes this unique.',
      variables: JSON.stringify([
        { name: 'idea', description: 'The rough idea to expand' },
      ]),
    },
    {
      name: 'Professional Reply',
      description: 'Draft professional email replies',
      category: 'Email',
      prompt: 'Draft a professional email reply to: {{email}}. My intended response is: {{intent}}. Tone: {{tone}}. Keep it concise and actionable.',
      variables: JSON.stringify([
        { name: 'email', description: 'The email to reply to' },
        { name: 'intent', description: 'Your intended response' },
        { name: 'tone', description: 'Desired tone' },
      ]),
    },
    {
      name: 'Prompt Optimizer',
      description: 'Optimize AI prompts for better results',
      category: 'Coding',
      prompt: 'Optimize this AI prompt for better results: {{prompt}}. Improve: clarity, specificity, structure, examples. Return the optimized prompt with explanation of changes.',
      variables: JSON.stringify([
        { name: 'prompt', description: 'The prompt to optimize' },
      ]),
    },
  ]

  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, '-') },
      update: template,
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        ...template,
      },
    })
  }

  console.log(`Seeded ${templates.length} prompt templates`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
