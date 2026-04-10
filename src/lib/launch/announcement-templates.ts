/**
 * Launch Announcement Templates
 * 
 * Generates launch announcement templates for different channels and audiences.
 */

export interface LaunchAnnouncementTemplate {
  channel: 'email' | 'social' | 'blog' | 'in_app';
  subject?: string;
  content: string;
  cta: string;
}

/**
 * Generate launch announcement templates
 */
export function generateLaunchAnnouncementTemplates(
  productName: string,
  launchDate: Date,
  keyFeatures: string[],
  targetAudience: string
): LaunchAnnouncementTemplate[] {
  const formattedDate = launchDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return [
    {
      channel: 'email',
      subject: `🚀 ${productName} is launching on ${formattedDate}!`,
      content: `We're thrilled to announce that ${productName} is officially launching on ${formattedDate}!

After months of development and testing based on your valuable feedback, we're ready to share ${productName} with the world.

What you can expect:
${keyFeatures.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

As an early member of our community, you get exclusive early access. Be among the first to experience ${productName}!

We couldn't have gotten here without you. Thank you for being part of this journey from the beginning.

Excited to have you onboard!`,
      cta: 'Get Early Access',
    },
    {
      channel: 'social',
      subject: undefined,
      content: `🚀 BIG NEWS: ${productName} is launching ${formattedDate}!

We've been working hard to build something special for ${targetAudience}, and we're finally ready to share it with the world.

Key highlights:
${keyFeatures.slice(0, 3).map(f => `• ${f}`).join('\n')}

Early access available for our community. Don't miss out! #launch #${productName.replace(/\s/g, '')}`,
      cta: 'Sign Up Now',
    },
    {
      channel: 'blog',
      subject: undefined,
      content: `Introducing ${productName}: A New Chapter Begins

After months of development, countless iterations, and invaluable feedback from our community, we're excited to announce that ${productName} is officially launching on ${formattedDate}.

Built specifically for ${targetAudience}, ${productName} addresses the challenges you face every day with:

${keyFeatures.map((feature, i) => `**${feature}**`).join('\n\n')}

This launch isn't just about releasing a product—it's about starting a conversation. We're committed to continuously improving ${productName} based on your feedback.

Join us on this journey and help shape the future of ${productName}.`,
      cta: 'Read More',
    },
    {
      channel: 'in_app',
      subject: undefined,
      content: `${productName} is launching ${formattedDate}! 🎉

You're one of our earliest community members, and we wanted you to be the first to know.

${productName} was built for ${targetAudience} like you, with features designed to make your life easier:

${keyFeatures.slice(0, 2).map(f => `• ${f}`).join('\n')}

Ready to see what we've built?`,
      cta: 'Explore Now',
    },
  ];
}
